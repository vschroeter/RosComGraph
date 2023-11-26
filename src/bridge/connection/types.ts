
import { RosConnection } from './';

export enum ConnectionStatus {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    ERROR = 'ERROR'
}

export interface Configuration {
    websocketUrl: string;
}

export abstract class ConnectionObject {
    protected readonly connection: RosConnection;

    constructor(connection: RosConnection) {
        this.connection = connection;
    }
}

export abstract class OperationData {
    op: string;
    id?: string;

    constructor(op: string, id?: string) {
        this.op = op;
        this.id = id;
    }

    /**
     * Returns the data of the operation as a JSON string.
     */
    public getData(): string {
        // Take all entries of the object, ignoring the ones that are undefined, and create a JSON out of it.
        return JSON.stringify(this, (key, value) => {
            if (value !== undefined) {
                return value;
            }
        });
    }
}

export type OperationDataCallback<T extends OperationData> = (data: T) => void;

