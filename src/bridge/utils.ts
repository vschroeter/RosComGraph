import { Configuration } from "./configurable/types";
import { Publisher } from "./publisher";
import { Service, ServiceTopic } from "./service";
import { Subscriber, MessageHandler, SubscribeOptions } from "./subscriber";
import { MessageData, Topic } from "./types";

/**
 * Publishes the supplied {@link data} to the configured topic.
 *
 * @param topic The topic to publish to.
 * @param data The data to publish.
 * @param configuration The configuration for the message bridge.
 *
 * @typeParam T The type of the topic's data.
 */
export function publish<T>(
  topic: Topic<T>,
  data: MessageData<T>,
  configuration?: Configuration
) {
  return new Publisher(topic, configuration).publish(data);
}

/**
 * Subscribes to the configured topic using the specified {@link handler}.
 *
 * @param topic The topic to subscribe to.
 * @param handler The handler to call when a message is received.
 * @param configuration The configuration for the message bridge.
 * @param options The subscription options.
 *
 * @typeParam T The type of the topic's data.
 */
export function subscribe<T>(
  topic: Topic<T>,
  handler: MessageHandler<T>,
  configuration?: Configuration,
  options?: Partial<SubscribeOptions>
): Promise<void> {
  return new Subscriber(topic, configuration).subscribe(handler, options);
}

/**
 * Calls the service with the supplied {@link data}.
 *
 * @param topic The topic of the service.
 * @param data The data to call the service with.
 * @param configuration The configuration for the message bridge.
 *
 * @typeParam TRequest The type of the request data.
 * @typeParam TResponse The type of the response data.
 *
 * @returns The response from the service.
 */
export function call<TRequest, TResult>(
  topic: ServiceTopic<TRequest, TResult>,
  data: TRequest,
  configuration?: Configuration
): Promise<MessageData<TResult>> {
  return new Service(topic, configuration).call(data);
}

/**
 * Defines a new {@link Topic topic} to publish or subscribe to.
 *
 * @param name The name of the topic.
 * @param type The type of the topic.
 *
 * @typeParam T The type of the topic's data.
 *
 * @returns The defined topic.
 */
export function defineTopic<T>(name: string, type: string) {
  return { name, type } as Topic<T>;
}

/**
 * Defines a new {@link ServiceTopic topic} for a service.
 *
 * @param name The name of the topic.
 * @param type The type of the topic.
 *
 * @typeParam TRequest The type of the request data.
 * @typeParam TResponse The type of the response data.
 *
 * @returns The defined service topic.
 */
export function defineServiceTopic<TRequest, TResponse>(
  name: string,
  type: string
) {
  return { name, type } as ServiceTopic<TRequest, TResponse>;
}
