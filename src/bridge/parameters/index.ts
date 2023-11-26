import { Configurable } from "../configurable";
import { Configuration } from "../configurable/types";
import { Service } from "../service";
import { CallServiceError } from "../service/errors";
import { Subscriber } from "../subscriber";
import {
  MessageHandler,
  SubscribeOptions,
  TimeoutStrategy,
} from "../subscriber/types";
import { MessageData } from "../types";

import { SetParametersError } from "./errors";
import { ParameterData, ParameterEvent, ParameterType } from "./types";
import * as utils from "./utils";

export * from "./errors";
export {
  type JsTypeFor,
  type ParameterData,
  type ParameterEvent,
  ParameterType,
  type ParameterValue,
} from "./types";

/**
 * A ROS2 client for managing parameters.
 */
export class Parameters extends Configurable {
  protected readonly node: string;

  /**
   * Creates a new {@link Parameters} instance for the specified node.
   *
   * @param node The name of the node to manage parameters for.
   * @param configuration The configuration for the message bridge.
   */
  constructor(node: string, configuration?: Partial<Configuration>) {
    super(configuration);

    this.node = node;
  }

  /**
   * Gets the values of the specified parameters.
   *
   * @param names The names of the parameters to get.
   *
   * @returns The values of the parameters as requested.
   *
   * @throws {@link CallServiceError} If the `get_parameters` call failed.
   */
  public async get<T extends ParameterType>(names: string[]) {
    const topic = utils.defineGetServiceTopic<T>(this.node);
    const service = new Service(topic, this.configuration);

    const response = await service.call({ names });
    return response.values.map(utils.decode);
  }

  /**
   * Sets the values of the specified parameters.
   *
   * @param parameters The parameters to set.
   *
   * @throws {@link SetParametersError} If any of the parameters could not be set.
   * @throws {@link CallServiceError} If the `set_parameters` call failed.
   */
  public async set<T extends ParameterType>(parameters: ParameterData<T>[]) {
    const topic = utils.defineSetServiceTopic(this.node);
    const service = new Service(topic, this.configuration);

    const response = await service.call({
      parameters: parameters.map((parameter) => {
        return { name: parameter.name, value: utils.encode(parameter) };
      }),
    });

    const names = parameters.map((parameter) => parameter.name);
    SetParametersError.from(names, response.results).throwIfErrorsNotEmpty();
  }

  /**
   * Subscribes to parameter change events for the configured node.
   *
   * @param handler The handler to call when a parameter event is received.
   * @param options The subscription options.
   */
  public async subscribe<T extends ParameterType>(
    handler: MessageHandler<ParameterData<T>[]>,
    options: Partial<SubscribeOptions> = {}
  ) {
    const topic = utils.defineParameterEventsTopic<T>();
    const subscriber = new Subscriber(topic, this.configuration);

    await subscriber.subscribe(handle.bind(this), {
      timeoutStrategy: TimeoutStrategy.Latest,
      ...options,
    });

    /**
     * Forwards filtered and decoded parameter events to the actual handler.
     *
     * @param message The received message.
     */
    function handle(message: MessageData<ParameterEvent<T>>) {
      // Ignore events for parameters of other nodes.
      if (!message || normalize(this.node) !== normalize(message.node)) return;

      const data = message.changed_parameters.map((parameter) => {
        return { name: parameter.name, ...utils.decode(parameter.value) };
      });

      handler?.(data, topic);

      /**
       * Normalizes the name of a ROS node to always include a leading slash.
       *
       * @param node The node name to normalize.
       *
       * @returns The normalized node name.
       */
      function normalize(node: string) {
        return node.startsWith("/") ? node : `/${node}`;
      }
    }
  }
}
