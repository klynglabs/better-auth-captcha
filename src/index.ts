import type { BetterAuthClientPlugin } from "better-auth";

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

export interface CaptchaClientPlugin extends BetterAuthClientPlugin {
  id: "captcha";
  getActions: () => { captcha: { preload: () => void } };
}

export function captchaClient({
  provider,
  endpoints = DEFAULT_ENDPOINTS,
}: CaptchaClientOptions): CaptchaClientPlugin {
  const isBrowser = typeof window !== "undefined";

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
            const { pathname } = new URL(context.url);
            const isProtected = endpoints.some((endpoint) => pathname.endsWith(endpoint));

            if (isBrowser && isProtected && !context.headers.has(CAPTCHA_HEADER)) {
              context.headers.set(CAPTCHA_HEADER, await provider.getToken());
            }

            return context;
          },
        },
      },
    ],
  };
}
