import { ServiceTopic } from "../service/types";

export type GetServiceTopic<T extends ParameterType> = ServiceTopic<
  GetRequest,
  GetResponse<T>
>;

export type SetServiceTopic<T extends ParameterType> = ServiceTopic<
  SetRequest<T>,
  SetResponse
>;

/**
 * The JavaScript type for the specified parameter type.
 *
 * @typeParam T The type of the parameter.
 */
export type JsTypeFor<T extends ParameterType> =
  T extends ParameterType.PARAMETER_BOOL
    ? boolean
    : T extends ParameterType.PARAMETER_INTEGER
    ? number
    : T extends ParameterType.PARAMETER_DOUBLE
    ? number
    : T extends ParameterType.PARAMETER_STRING
    ? string
    : T extends ParameterType.PARAMETER_BYTE_ARRAY
    ? number[]
    : T extends ParameterType.PARAMETER_BOOL_ARRAY
    ? boolean[]
    : T extends ParameterType.PARAMETER_INTEGER_ARRAY
    ? number[]
    : T extends ParameterType.PARAMETER_DOUBLE_ARRAY
    ? number[]
    : T extends ParameterType.PARAMETER_STRING_ARRAY
    ? string[]
    : undefined;

export interface GetRequest {
  names: string[];
}

export interface GetResponse<T extends ParameterType> {
  values: ParameterValueRaw<T>[];
}

export interface SetRequest<T extends ParameterType> {
  parameters: ParameterRaw<T>[];
}

export interface SetResponse {
  results: SetResult[];
}

export interface SetResult {
  successful: boolean;
  reason: string;
}

/**
 * A ROS2 parameter.
 */
export interface ParameterData<T extends ParameterType>
  extends ParameterValue<T> {
  /**
   * The name of the parameter.
   */
  name: string;
}

export interface ParameterRaw<T extends ParameterType> {
  name: string;
  value: ParameterValueRaw<T>;
}

/**
 * The value of a ROS2 parameter.
 */
export interface ParameterValue<T extends ParameterType> {
  /**
   * The type of the parameter.
   */
  type: T;

  /**
   * The value of the parameter.
   */
  value: JsTypeFor<T>;
}

export interface ParameterValueRaw<T extends ParameterType> {
  type: T;

  bool_value?: boolean;
  integer_value?: number;
  double_value?: number;
  string_value?: string;
  byte_array_value?: number[];
  bool_array_value?: boolean[];
  integer_array_value?: number[];
  double_array_value?: number[];
  string_array_value?: string[];
}

/**
 * The type of a ROS2 parameter.
 */
export enum ParameterType {
  PARAMETER_NOT_SET = 0,

  PARAMETER_BOOL = 1,
  PARAMETER_INTEGER = 2,
  PARAMETER_DOUBLE = 3,
  PARAMETER_STRING = 4,
  PARAMETER_BYTE_ARRAY = 5,
  PARAMETER_BOOL_ARRAY = 6,
  PARAMETER_INTEGER_ARRAY = 7,
  PARAMETER_DOUBLE_ARRAY = 8,
  PARAMETER_STRING_ARRAY = 9,
}

export interface ParameterEvent<T extends ParameterType> {
  /**
   * The fully qualified ROS path to the node.
   */
  node: string;

  new_parameters: ParameterRaw<T>[];
  changed_parameters: ParameterRaw<T>[];
  deleted_parameters: ParameterRaw<T>[];
}
