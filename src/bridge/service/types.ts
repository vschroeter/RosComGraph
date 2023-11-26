import { TopicBase } from "../types";
// import { MessageData } from "../types";
import { OperationData } from "../connection/types";

/**
 * A ROS2 topic for a service.
 *
 * @typeParam TRequest The type of the request data.
 * @typeParam TResponse The type of the response data.
 */
export interface ServiceTopic<TRequest, TResponse> extends TopicBase { }



/**
 * Operation data of a service call according to https://github.com/RobotWebTools/rosbridge_suite/blob/ros1/ROSBRIDGE_PROTOCOL.md#346-call-service
 */
export class ServiceCallData extends OperationData {
  service: string;
  args?: any;
  fragment_size?: number;
  compression?: string;

  constructor(service: string, args?: any, fragment_size?: number, compression?: string) {
    super("call_service");
    this.service = service;
    this.args = args;
    this.fragment_size = fragment_size;
    this.compression = compression;
  }
}

/**
 * Operation data of a service response according to https://github.com/RobotWebTools/rosbridge_suite/blob/ros1/ROSBRIDGE_PROTOCOL.md#349-service-response
 */
export interface ServiceResponseData<T> extends OperationData {
  service: string;
  result: boolean;
  values: T;
}


// export interface Response<T> {
//   /**
//    * The result of the request to the service.
//    */
//   result?: MessageData<T>;

//   /**
//    * Whether the request was successful.
//    */
//   successful: boolean;

//   /**
//    * The errors that occurred during the request.
//    */
//   errors: Record<string, string[]>;
// }
