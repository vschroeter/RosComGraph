import { Configurable } from "../configurable";
import { Configuration } from "../configurable/types";
import { MessageData, Topic } from "../types";

/**
 * A publisher for a ROS2 topic.
 *
 * @typeParam T The type of the message data.
 */
export class Publisher<T> extends Configurable {
  private readonly topic: Topic<T>;

  /**
   * Creates a new {@link Publisher} instance.
   *
   * @param topic The topic to publish to.
   * @param configuration The configuration for the message bridge.
   */
  constructor(topic: Topic<T>, configuration?: Partial<Configuration>) {
    super(configuration);

    this.topic = topic;
  }

  /**
   * Publishes the supplied {@link data} to the configured topic.
   *
   * @param data The data to publish.
   */
  public async publish(data: MessageData<T>) {
    await this.fetch(data);
  }

  /**
   * Fetches the `publish` endpoint with the supplied {@link data}.
   *
   * @param data The data to publish.
   */
  private async fetch(data: MessageData<T>) {
    const { name, type } = this.topic;
    const url = this.createApiUrl("publish");

    const options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: name, type, data: JSON.stringify(data) }),
    };

    await fetch(url.toString(), options);
  }
}
