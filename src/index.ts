import type { BetterAuthClientPlugin } from "better-auth";
import type { captcha } from "better-auth/plugins/captcha";

const CAPTCHA_HEADER = "x-captcha-response";

const DEFAULT_ENDPOINTS = ["/sign-up/email", "/sign-in/email", "/request-password-reset"];

export interface CaptchaProvider {
  preload: () => void;
  getToken: () => Promise<string>;
}

export interface CaptchaClientOptions {
  provider: CaptchaProvider;
  endpoints?: string[];
}

export interface CaptchaClientPlugin {
  id: "captcha";
  $InferServerPlugin?: ReturnType<typeof captcha>;
  getActions: () => { captcha: { preload: () => void } };
  fetchPlugins: NonNullable<BetterAuthClientPlugin["fetchPlugins"]>;
}

function getAuthPath(url: URL | string, baseURL: string | undefined) {
  const { pathname } = new URL(url);
  const basePath = baseURL ? new URL(baseURL, url).pathname : "";
  const path = (pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname)
    .replace(/\/{2,}/g, "/")
    .replace(/^(?!\/)/, "/");
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

function toMatcher(endpoint: string) {
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

export function captchaClient({
  provider,
  endpoints = DEFAULT_ENDPOINTS,
}: CaptchaClientOptions): CaptchaClientPlugin {
  const isBrowser = typeof window !== "undefined";
  const matchers = endpoints.map(toMatcher);

  return {
    id: "captcha",
    getActions: () => ({
      captcha: {
        preload: () => {
          if (isBrowser) provider.preload();
        },
      },
    }),
    fetchPlugins: [
      {
        id: "captcha",
        name: "captcha",
        hooks: {
          async onRequest(context) {
            const path = getAuthPath(context.url, context.baseURL);
            const isProtected = matchers.some((matches) => matches(path));

            if (isBrowser && isProtected && !context.headers.has(CAPTCHA_HEADER)) {
              context.headers.set(CAPTCHA_HEADER, await provider.getToken());
            }

            return context;
          },
        },
      },
    ],
  } satisfies BetterAuthClientPlugin;
}
