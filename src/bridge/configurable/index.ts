import { Configuration } from "./types";
import { encodeSearchParams, joinUrlPaths } from "./utils";

export { type Configuration } from "./types";

/**
 * A base class for a configurable connection to the message bridge.
 */
export abstract class Configurable {
  /**
   * The configuration for a message bridge connection.
   */
  protected readonly configuration: Configuration;

  /**
   * Creates a new {@link Configurable} instance.
   *
   * @param configuration The configuration for a message bridge connection.
   */
  constructor(configuration: Partial<Configuration> = {}) {
    const { protocol, hostname } = window.location;

    this.configuration = {
      // apiBaseUrl: `${protocol}//${hostname}/service/ros2-message-bridge/`,
      apiBaseUrl: `ws://192.168.0.216:9090`,
      ...configuration, // Merge the options with the defaults.
    };
  }

  /**
   * Creates an URL for the message bridge API.
   *
   * @param path The path relative to the API base URL.
   *
   * @returns The absolute URL for the given path.
   */
  protected createApiUrl(path: string, params: Record<string, any> = {}): URL {
    const paths = [this.configuration.apiBaseUrl, "rosBridge", path];
    const url = new URL(joinUrlPaths(...paths));

    return encodeSearchParams(url, params);
  }
}
