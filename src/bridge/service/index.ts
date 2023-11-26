// import { Configurable } from "../configurable";
// import { Configuration } from "../configurable/types";
// import { MessageData } from "../types";

import { RosConnection } from "../connection";
import { ConnectionObject } from "../connection/types";

import { ServiceCallData, ServiceResponseData } from "./types";

import { CallServiceError, CallServiceTimeoutError } from "./errors";
import { ServiceTopic } from "./types";

export * from "./errors";
export { type ServiceTopic } from "./types";

/**
 * A service client for a ROS2 topic.
 *
 * @typeParam TRequest The type of the request data.
 * @typeParam TResponse The type of the response data.
 */
export class Service<TRequest, TResponse> extends ConnectionObject {
  private readonly topic: ServiceTopic<TRequest, TResponse>;

  /**
   * Creates a new {@link Service} instance.
   *
   * @param topic The topic of the service.
   * @param configuration The configuration for the message bridge.
   */
  constructor(
    connection: RosConnection,
    topic: ServiceTopic<TRequest, TResponse>
  ) {
    super(connection);

    this.topic = topic;
  }


  /**
   * Calls the service with the supplied {@link data}.
   * 
   * @param data The data to call the service with.
   * 
   * @returns The response from the service.
  */
  public call(data: TRequest, timeout: number = 0, retryAttempts: number = 1): Promise<TResponse> {
    // * @throws {@link CallServiceError} If the service call failed.
    const callData = new ServiceCallData(this.topic.name, data);
    return new Promise((resolve, reject) => {

      let retryCount = 0;
      let timeoutId: NodeJS.Timeout;

      const _call = () => {
        this.connection.awaitResponse<ServiceResponseData<any>>(callData).then((response) => {
          if (response.result) {
            if (timeoutId) clearTimeout(timeoutId);
            resolve(response.values);
          } else {
            if (timeoutId) clearTimeout(timeoutId);
            reject(response);
          }
        }).catch((error) => {
          if (timeoutId) clearTimeout(timeoutId);
          reject(error);
        });
      }

      const _callWithTimeout = () => {
        timeoutId = setTimeout(() => {
          if (retryCount < retryAttempts) {
            _call();
            _callWithTimeout();
            retryCount++;
          } else {
            reject(new CallServiceTimeoutError());
          }
        }, timeout);
      }

      _call();
      if (timeout > 0) {
        _callWithTimeout();
      }


    });
  }
}