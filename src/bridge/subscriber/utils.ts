import { SubscribeOptions, TimeoutStrategy } from "./types";

/**
 * Creates the options for the `subscribe` request.
 *
 * @param options The options to override the defaults.
 *
 * @returns The options for the `subscribe` request.
 */
export function createSubscribeOptions(
  options: Partial<SubscribeOptions> = {}
): SubscribeOptions {
  return {
    timeout: 10 * 1000,
    timeoutStrategy: TimeoutStrategy.Retry,

    ...options, // Merge the options with the defaults.
  };
}
