import { SetResult } from "./types";

/**
 * Indicates that a parameter of a ROS2 node could not be set.
 */
export class SetParameterError extends Error {
  /**
   * The name of the parameter that could not be set.
   */
  public readonly parameter: string;

  /**
   * The reason why the parameter could not be set.
   */
  public readonly reason: string;

  /**
   * Creates a new {@link SetParameterError}.
   *
   * @param parameter The name of the parameter that could not be set.
   * @param reason The reason why the parameter could not be set.
   * @param options The error options.
   */
  constructor(parameter: string, reason: string, options?: ErrorOptions) {
    super(`Failed to set parameter '${parameter}': ${reason}`, options);

    this.name = "SetParameterError";
    this.parameter = parameter;
    this.reason = reason;
  }
}

/**
 * Indicates that a set of ROS2 parameters could not be set.
 */
export class SetParametersError extends Error {
  /**
   * The errors for all parameters that could not be set.
   */
  public readonly errors: SetParameterError[];

  /**
   * Creates a new {@link SetParametersError}.
   *
   * @param errors The errors for all parameters that could not be set.
   * @param options The error options.
   */
  constructor(errors: SetParameterError[], options?: ErrorOptions) {
    super(`Failed to set parameters: ${getParameterNames(errors)}`, options);

    this.name = "SetParametersError";
    this.errors = errors;
  }

  /**
   * Creates a new {@link SetParametersError} from the {@link results} of a set
   * operation (and the {@link parameters names} of the parameters).
   *
   * @param parameters The names of the parameters included in the set operation.
   * @param results The results from the set operation.
   *
   * @returns A new {@link SetParametersError} from the supplied {@link results}.
   */
  public static from(parameters: string[], results: SetResult[]) {
    const errors = parameters.map((parameter, index) => {
      const result = results[index];

      if (!result.successful) {
        return new SetParameterError(parameter, result.reason);
      }

      return null;
    });

    return new SetParametersError(errors.filter((error) => error !== null));
  }

  /**
   * Throws this error if {@link errors} contains at least one error.
   */
  public throwIfErrorsNotEmpty() {
    if (this.errors.length > 0) throw this;
  }

  /**
   * Extracts the first {@link SetParameterError} in {@link errors}.
   *
   * @returns The first {@link SetParameterError} in {@link errors}.
   */
  public toSingleError() {
    return this.errors[0];
  }
}

function getParameterNames(errors: SetParameterError[]): string[] {
  return errors.map((error) => error.parameter);
}
