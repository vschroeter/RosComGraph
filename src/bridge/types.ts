/**
 * The data of a message.
 */
export type MessageData<T> = T | null;

/**
 * A ROS2 topic.
 *
 * @typeParam T The type of the topic's data.
 */
export interface Topic<T> extends TopicBase {}

export interface TopicBase {
  /**
   * The name of the topic.
   */
  name: string;

  /**
   * The name of the topic's type.
   */
  type: string;
}
