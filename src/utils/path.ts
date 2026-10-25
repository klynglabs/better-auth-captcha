export function getAuthPath(url: URL | string, baseURL: string | undefined) {
  const { pathname } = new URL(url);
  const basePath = baseURL ? new URL(baseURL, url).pathname : "";
  const path = (pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname)
    .replace(/\/{2,}/g, "/")
    .replace(/^(?!\/)/, "/");
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

export function toMatcher(endpoint: string) {
  if (!endpoint.includes("*")) return (path: string) => path === endpoint;

  const source = endpoint
    .split("/")
    .map((segment) =>
      segment === "**"
        ? segment
        : segment
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replaceAll("*", "[^/]*")
            .replaceAll("?", "[^/]"),
    )
    .join("/")
    .replaceAll("/**", "(?:/.*)?");
  const pattern = new RegExp(`^${source}$`);
  return (path: string) => pattern.test(path);
}
