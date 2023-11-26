import { BehaviorSubject, Observable } from 'rxjs';
import { Service, ServiceTopic } from '../service';
import { ConnectionStatus, OperationDataCallback, Configuration, OperationData } from './types';

export class RosConnection {
    private ws: WebSocket;
    private connected: boolean;
    private connectionStatus: ConnectionStatus;
    private connectionStatusSubject: BehaviorSubject<ConnectionStatus>;

    private _id: number;

    private id_listener: Map<string, OperationDataCallback<any>>;

    constructor(configuration: Configuration) {
        this.connected = false;
        this.connectionStatus = ConnectionStatus.DISCONNECTED;
        this.connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(this.connectionStatus);

        this._id = 0;

        this.ws = new WebSocket(configuration.websocketUrl);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);

        this.id_listener = new Map();
    }

    public close(): void {
        this.ws.close();
    }

    private onOpen(event: any) {
        this.connected = true;
        this.connectionStatus = ConnectionStatus.CONNECTED;
        this.connectionStatusSubject.next(this.connectionStatus);
    }

    private onError(event: any) {
        console.error(JSON.stringify(event.data));
        this.connected = false;
        this.connectionStatus = ConnectionStatus.ERROR;
        this.connectionStatusSubject.next(this.connectionStatus);
    }

    private onClose(event: any): void {
        console.log(JSON.stringify(event.data));
        this.connected = false;
        this.connectionStatus = ConnectionStatus.DISCONNECTED;
        this.connectionStatusSubject.next(this.connectionStatus);
    }

    private onMessage(event: MessageEvent<any>): void {
        const data = JSON.parse(event.data);
        // console.log(data);
        const id = data.id;
        const op = data.op;
        if (!id && !op) return;

        if (this.id_listener.has(id)) {
            const listener = this.id_listener.get(id)!;
            listener(data);
        } else {
            console.warn('No listener for id: ' + id);
        }
    }

    public waitForConnection(): Promise<ConnectionStatus> {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                resolve(ConnectionStatus.CONNECTED);
            } else {
                this.connectionStatusSubject.subscribe((status) => {
                    if (status === ConnectionStatus.CONNECTED) {
                        resolve(status);
                    } else if (status === ConnectionStatus.ERROR) {
                        reject(status);
                    }
                });
            }
        });
    }

    public getConnectionStatus(): Observable<ConnectionStatus> {
        return this.connectionStatusSubject.asObservable();
    }

    public isConnected(): boolean {
        return this.connected;
    }

    private appendIdListener(id: number | string, listener: (event: any) => void): void {
        this.id_listener.set(id.toString(), listener);
    }

    private removeIdListener(id: number | string): void {
        this.id_listener.delete(id.toString());
    }

    private send(data: OperationData): void {
        this.ws.send(data.getData());
    }

    public awaitResponse<T extends OperationData>(data: OperationData): Promise<T> {
        return new Promise((resolve, reject) => {
            this.waitForConnection().then(() => {
                data.id = (data.id || this._id++).toString();
                const id = data.id;

                const listener = (response: T) => {
                    if (response.id === id) {
                        resolve(response);
                        this.removeIdListener(response.id);
                    }
                };
                this.appendIdListener(id, listener);
                this.send(data);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    public Service<TRequest, TResponse>(topic: ServiceTopic<TRequest, TResponse>): Service<TRequest, TResponse> {
        return new Service<TRequest, TResponse>(this, topic);
    }
}

