/**
 * Indicates an unsuccessful call to a ROS2 service.
 */
export class CallServiceError extends Error {
  /**
   * The errors encountered during the service call.
   */
  public readonly errors: Record<string, string[]>;

  /**
   * Create a new {@link CallServiceError}.
   * 
   * @param errors The errors encountered during the service call.
   * @param options The error options.
   */
  constructor(errors: Record<string, string[]>, options?: ErrorOptions) {
    super(`Failed to call service: ${getErrorMessages(errors)}`, options);

    this.name = "CallServiceError";
    this.errors = errors;
  }
}

function getErrorMessages(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([source, messages]) => `${messages.join()} (${source})`)
    .join();
}


export class CallServiceTimeoutError extends Error {
  /**
   * Create a new {@link CallServiceTimeoutError}.
   * 
   * @param errors The errors encountered during the service call.
   * @param options The error options.
   */
  constructor(options?: ErrorOptions) {
    super(`Failed to call service: timeout`, options);
    this.name = "CallServiceTimeoutError";
  }
}