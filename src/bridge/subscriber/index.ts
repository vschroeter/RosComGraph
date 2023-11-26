import { Configurable } from "../configurable";
import { Configuration } from "../configurable/types";
import { Topic } from "../types";

import {
  SubscribeOptions,
  Response,
  MessageHandler,
  TimeoutStrategy,
} from "./types";
import { createSubscribeOptions } from "./utils";

export { type MessageHandler, type SubscribeOptions, TimeoutStrategy } from "./types";

/**
 * A subscriber for a ROS2 topic.
 *
 * @typeParam T The type of the message data.
 */
export class Subscriber<T> extends Configurable {
  private readonly topic: Topic<T>;

  /**
   * Creates a new {@link Subscriber} instance.
   *
   * @param topic The topic to subscribe to.
   * @param configuration The configuration for the message bridge.
   */
  constructor(topic: Topic<T>, configuration?: Partial<Configuration>) {
    super(configuration);

    this.topic = topic;
  }

  /**
   * Subscribes to the configured topic using the specified {@link handler}.
   *
   * @param handler The handler to call when a message is received.
   * @param options The subscription options.
   */
  public async subscribe(
    handler: MessageHandler<T>,
    options: Partial<SubscribeOptions> = {}
  ) {
    while (!options?.signal?.aborted) {
      await this.subscribeOnce(handler, options);
    }
  }

  /**
   * Subscribes to the configured topic once using the specified {@link handler}.
   *
   * @param handler The handler to call when a message is received.
   * @param options The subscription options.
   */
  public async subscribeOnce(
    handler: MessageHandler<T>,
    options: Partial<SubscribeOptions> = {}
  ) {
    const { timeout, timeoutStrategy } = createSubscribeOptions(options);

    while (!options?.signal?.aborted) {
      const response = await this.fetch(options);

      if (response.timeout === true) {
        switch (timeoutStrategy) {
          case TimeoutStrategy.Retry:
            continue;

          case TimeoutStrategy.Latest:
            return this.subscribeOnce(handler, { ...options, timeout: 0 });
        }
      }

      if (response.data !== undefined) {
        return handler?.(response.data, this.topic);
      }

      // Prevent infinite loop when no data is received.
      if (timeout === 0 && timeoutStrategy === TimeoutStrategy.Latest) return;
    }
  }

  /**
   * Fetches the latest message published to the configured topic.
   *
   * @param options The subscription options.
   *
   * @returns The parsed response from the `subscribe` API.
   */
  private async fetch(
    options: Partial<SubscribeOptions> = {}
  ): Promise<Response<T>> {
    const { signal, timeout } = createSubscribeOptions(options);
    const { name, type } = this.topic;

    const params = { topic: name, type, timeout };
    const url = this.createApiUrl("subscribe", params);
    const response = await (await fetch(url.toString(), { signal })).json();

    return {
      data: response.res?.data,
      errors: response.errors,
      timeout: response.timeout,
    };
  }
}
