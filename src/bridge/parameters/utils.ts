import { defineServiceTopic, defineTopic } from "@/utils";

import {
  GetServiceTopic,
  GetRequest,
  GetResponse,
  ParameterValueRaw,
  ParameterType,
  SetRequest,
  SetResponse,
  SetServiceTopic,
  JsTypeFor,
  ParameterValue,
  ParameterEvent,
} from "./types";

/**
 * Define a service topic for getting parameters from the specified node.
 *
 * @param node The name of the node to get parameters from.
 *
 * @typeParam T The type of the parameter.
 *
 * @returns The service topic for getting parameters.
 */
export function defineGetServiceTopic<T extends ParameterType>(
  node: string
): GetServiceTopic<T> {
  return defineServiceTopic<GetRequest, GetResponse<T>>(
    `/${node}/get_parameters`,
    "rcl_interfaces/srv/GetParameters"
  );
}

/**
 * Define a service topic for setting parameters on the specified node.
 *
 * @param node The name of the node to set parameters on.
 *
 * @typeParam T The type of the parameter.
 *
 * @returns The service topic for setting parameters.
 */
export function defineSetServiceTopic<T extends ParameterType>(
  node: string
): SetServiceTopic<T> {
  return defineServiceTopic<SetRequest<T>, SetResponse>(
    `/${node}/set_parameters`,
    "rcl_interfaces/srv/SetParameters"
  );
}

/**
 * Defines the `/parameter_events` topic for the specified {@link T type}.
 *
 * @returns The `/parameter_events` topic.
 */
export function defineParameterEventsTopic<T extends ParameterType>() {
  return defineTopic<ParameterEvent<T>>(
    "/parameter_events",
    "rcl_interfaces/msg/ParameterEvent"
  );
}

/**
 * Encodes a parameter value to its raw ROS message format.
 *
 * @param value The parameter value to encode.
 *
 * @typeParam T The type of the parameter.
 *
 * @returns The raw ROS message format of the parameter value.
 */
export function encode<T extends ParameterType>(
  value: ParameterValue<T>
): ParameterValueRaw<T> {
  switch (value.type) {
    case ParameterType.PARAMETER_BOOL:
      return {
        type: value.type,
        bool_value: value.value as boolean,
      };

    case ParameterType.PARAMETER_INTEGER:
      return {
        type: value.type,
        integer_value: value.value as number,
      };

    case ParameterType.PARAMETER_DOUBLE:
      return {
        type: value.type,
        double_value: value.value as number,
      };

    case ParameterType.PARAMETER_STRING:
      return {
        type: value.type,
        string_value: value.value as string,
      };

    case ParameterType.PARAMETER_BYTE_ARRAY:
      return {
        type: value.type,
        byte_array_value: value.value as number[],
      };

    case ParameterType.PARAMETER_BOOL_ARRAY:
      return {
        type: value.type,
        bool_array_value: value.value as boolean[],
      };

    case ParameterType.PARAMETER_INTEGER_ARRAY:
      return {
        type: value.type,
        integer_array_value: value.value as number[],
      };

    case ParameterType.PARAMETER_DOUBLE_ARRAY:
      return {
        type: value.type,
        double_array_value: value.value as number[],
      };

    case ParameterType.PARAMETER_STRING_ARRAY:
      return {
        type: value.type,
        string_array_value: value.value as string[],
      };

    default:
      return { type: value.type };
  }
}

/**
 * Decodes a parameter value from its raw ROS message format.
 *
 * @param value The raw ROS message format of the parameter value.
 *
 * @typeParam T The type of the parameter.
 *
 * @returns The decoded parameter value.
 */
export function decode<T extends ParameterType>(
  value: ParameterValueRaw<T>
): ParameterValue<T> {
  switch (value.type) {
    case ParameterType.PARAMETER_BOOL:
      return {
        type: value.type,
        value: value.bool_value as JsTypeFor<T>,
      };

    case ParameterType.PARAMETER_INTEGER:
      return {
        type: value.type,
        value: value.integer_value as JsTypeFor<T>,
      };

    case ParameterType.PARAMETER_DOUBLE:
      return {
        type: value.type,
        value: value.double_value as JsTypeFor<T>,
      };

    case ParameterType.PARAMETER_STRING:
      return {
        type: value.type,
        value: value.string_value as JsTypeFor<T>,
      };

    case ParameterType.PARAMETER_BYTE_ARRAY:
      return {
        type: value.type,
        value: value.byte_array_value as JsTypeFor<T>,
      };

    case ParameterType.PARAMETER_BOOL_ARRAY:
      return {
        type: value.type,
        value: value.bool_array_value as JsTypeFor<T>,
      };

    case ParameterType.PARAMETER_INTEGER_ARRAY:
      return {
        type: value.type,
        value: value.integer_array_value as JsTypeFor<T>,
      };

    case ParameterType.PARAMETER_DOUBLE_ARRAY:
      return {
        type: value.type,
        value: value.double_array_value as JsTypeFor<T>,
      };

    case ParameterType.PARAMETER_STRING_ARRAY:
      return {
        type: value.type,
        value: value.string_array_value as JsTypeFor<T>,
      };

    default:
      return { type: value.type, value: undefined };
  }
}
