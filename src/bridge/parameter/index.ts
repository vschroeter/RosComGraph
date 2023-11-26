import { Configurable } from "../configurable";
import { Configuration } from "../configurable/types";
import { Parameters } from "../parameters";
import { SetParameterError, SetParametersError } from "../parameters/errors";
import { JsTypeFor, ParameterData, ParameterType } from "../parameters/types";
import { CallServiceError } from "../service/errors";
import { MessageHandler, SubscribeOptions } from "../subscriber/types";
import { MessageData } from "../types";

/**
 * A ROS2 client for managing a single parameter.
 */
export class Parameter<T extends ParameterType> extends Configurable {
  protected readonly parameters: Parameters;

  protected readonly name: string;
  protected readonly type: T;

  /**
   * Creates a new {@link Parameter} instance for the specified parameter.
   *
   * @param node The name of the node.
   * @param name The name of the parameter.
   * @param type The type of the parameter.
   * @param configuration The configuration for the message bridge.
   */
  constructor(
    node: string,
    name: string,
    type: T,
    configuration?: Partial<Configuration>
  ) {
    super(configuration);

    this.parameters = new Parameters(node, configuration);

    this.name = name;
    this.type = type;
  }

  /**
   * Gets the value of the parameter.
   *
   * @returns The value of the parameter.
   *
   * @throws {@link CallServiceError} If the `get_parameters` call failed.
   */
  public async get() {
    return (await this.parameters.get<T>([this.name]))[0].value;
  }

  /**
   * Sets the value of the parameter.
   *
   * @param value The value of the parameter.
   *
   * @throws {@link SetParameterError} If the parameter could not be set.
   * @throws {@link CallServiceError} If the `set_parameters` call failed.
   */
  public async set(value: JsTypeFor<T>) {
    try {
      await this.parameters.set([{ name: this.name, type: this.type, value }]);
    } catch (error) {
      if (error instanceof SetParametersError) {
        throw error.toSingleError();
      }

      throw error;
    }
  }

  /**
   * Subscribes to parameter change events.
   *
   * @param handler The handler to call when the parameter changed.
   * @param options The subscription options.
   */
  public async subscribe(
    handler: MessageHandler<ParameterData<T>>,
    options: Partial<SubscribeOptions> = {}
  ) {
    await this.parameters.subscribe<T>(handle.bind(this), options);

    function handle(message: MessageData<ParameterData<T>[]>, topic) {
      if (message === null) return;

      message
        .filter((parameter) => this.name === parameter.name)
        .forEach((parameter) => handler(parameter, topic));
    }
  }
}
