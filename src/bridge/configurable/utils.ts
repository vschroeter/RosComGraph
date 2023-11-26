/**
 * Joins all supplied {@link paths} using `/` to create a single path.
 *
 * @param paths The paths to join.
 *
 * @returns The joined path.
 */
export function joinUrlPaths(...paths: string[]): string {
  return paths.map((path) => path.replace(/^\/|\/$/g, "")).join("/");
}

/**
 * Encodes the supplied {@link params} onto the given {@link url}.
 *
 * @param url The URL to add the search parameters to.
 * @param params The search parameters to add to the URL.
 *
 * @returns The supplied URL with the search parameters.
 */
export function encodeSearchParams(url: URL, params: Record<string, any>) {
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.append(key, value.toString());
  }

  return url;
}
