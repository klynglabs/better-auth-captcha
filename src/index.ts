import type { BetterAuthClientPlugin } from "better-auth";

import type { CaptchaClientOptions, CaptchaClientPlugin } from "./types.ts";
import { getAuthPath, toMatcher } from "./utils/path.ts";

export type { CaptchaClientOptions, CaptchaClientPlugin, CaptchaProvider } from "./types.ts";

const CAPTCHA_HEADER = "x-captcha-response";

const DEFAULT_ENDPOINTS = ["/sign-up/email", "/sign-in/email", "/request-password-reset"];

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
