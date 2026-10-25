import type { CaptchaProvider } from "../types.ts";
import { createContainer, loadScript, warn } from "../utils/browser.ts";
import { createProvider } from "./create-provider.ts";

const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";

interface TurnstileRenderParams {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback": (code: string) => boolean;
  "timeout-callback": () => void;
  "unsupported-callback": () => void;
  "refresh-expired": "auto" | "manual" | "never";
}

interface TurnstileApi {
  render: (container: HTMLElement, params: TurnstileRenderParams) => string | undefined;
  reset: (widgetId: string) => void;
  getResponse: (widgetId: string) => string | undefined;
  isExpired: (widgetId: string) => boolean;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileOptions {
  siteKey: string;
}

export function turnstile({ siteKey }: TurnstileOptions): CaptchaProvider {
  let pending: ((token: string) => void) | undefined;
  let failed = false;

  const fail = (message: string) => {
    warn(message);
    failed = true;
    pending?.("");
    pending = undefined;
  };

  return createProvider({
    name: "Turnstile",
    async mount() {
      const api = await loadScript(SCRIPT_URL, "onTurnstileLoad", () => window.turnstile);

      const container = createContainer();
      container.style.cssText = "width:0;height:0;overflow:hidden";

      const widgetId = api.render(container, {
        sitekey: siteKey,
        "refresh-expired": "auto",
        callback: (token) => {
          failed = false;
          if (!widgetId || !pending) return;

          api.reset(widgetId);
          pending(token);
          pending = undefined;
        },
        "error-callback": (code) => {
          fail(`Turnstile error ${code}`);
          return true;
        },
        "timeout-callback": () => fail("Turnstile challenge timed out"),
        "unsupported-callback": () => fail("Turnstile does not support this browser"),
      });

      if (!widgetId) {
        throw new Error("Failed to render Turnstile.");
      }

      return { api, widgetId };
    },
    async execute({ api, widgetId }) {
      if (failed) {
        api.reset(widgetId);
        return "";
      }

      const token = api.getResponse(widgetId);

      if (token && !api.isExpired(widgetId)) {
        api.reset(widgetId);
        return token;
      }

      return new Promise<string>((resolve) => {
        pending = resolve;
      });
    },
  });
}
