import { MessageData, Topic } from "../types";

/**
 * Handles a message received on the specified {@link topic}.
 *
 * @param data The message data.
 * @param topic The topic the message was received on.
 */
export type MessageHandler<T> = (data: MessageData<T>, topic: Topic<T>) => void;

/**
 * The options for subscribing to a topic.
 */
export interface SubscribeOptions {
  /**
   * A signal that may be used to abort the request at any time.
   *
   * An {@link AbortSignal} can be obtained via an {@link AbortController}. The
   * latter is used to control the abortion state of the signal.
   *
   * @default undefined
   */
  signal?: AbortSignal;

  /**
   * The time to wait for new data before the request times out in milliseconds.
   *
   * If `timeout > 0` _long polling_ will be used to wait for new data to be
   * published to the topic. Otherwise, the last data published to the topic is
   * returned immediately.
   *
   * @default 10000 (10 seconds)
   */
  timeout: number;

  /**
   * The strategy to use for handling a timeout.
   *
   * @default TimeoutStrategy.Retry
   */
  timeoutStrategy: TimeoutStrategy;
}

/**
 * The strategy to use for handling a timeout.
 */
export enum TimeoutStrategy {
  /**
   * Retry the request until a response is received in the specified timeout.
   */
  Retry = "retry",

  /**
   * Request the latest message received on the topic.
   */
  Latest = "latest",
}

/**
 * The parsed response from the `subscribe` API.
 */
export interface Response<T> {
  /**
   * The data of the message as published to the topic.
   */
  data?: MessageData<T>;

  /**
   * The errors that occurred during the request.
   */
  errors: Record<string, string[]>;

  /**
   * Whether the timeout was reached while waiting for new data.
   */
  timeout?: boolean;
}
