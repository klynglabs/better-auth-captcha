import type { CaptchaProvider } from "./index.ts";

const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";

interface TurnstileRenderParams {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback": (code: string) => boolean;
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
    onTurnstileLoad?: () => void;
  }
}

function loadTurnstile() {
  return new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }

    window.onTurnstileLoad = () => {
      if (window.turnstile) resolve(window.turnstile);
    };

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.addEventListener("error", () => reject(new Error("Failed to load Turnstile.")), {
      once: true,
    });
    document.head.append(script);
  });
}

export interface TurnstileOptions {
  siteKey: string;
}

export function turnstile({ siteKey }: TurnstileOptions): CaptchaProvider {
  const waiting: Array<(token: string) => void> = [];
  const state: {
    widget?: Promise<{ api: TurnstileApi; widgetId: string }>;
    failed?: boolean;
  } = {};

  async function renderWidget() {
    const api = await loadTurnstile();

    const container = document.createElement("div");
    container.style.cssText = "width:0;height:0;overflow:hidden";
    document.body.append(container);

    const widgetId = api.render(container, {
      sitekey: siteKey,
      "refresh-expired": "auto",
      callback: (token) => {
        state.failed = false;
        if (!widgetId || waiting.length === 0) return;

        api.reset(widgetId);
        waiting.shift()?.(token);
      },
      "error-callback": (code) => {
        console.warn(`[better-auth-captcha] Turnstile error ${code}`);
        state.failed = true;
        waiting.splice(0).forEach((resolve) => resolve(""));
        return true;
      },
    });

    if (!widgetId) {
      throw new Error("Failed to render Turnstile.");
    }

    return { api, widgetId };
  }

  function mountWidget() {
    state.widget ??= renderWidget();
    return state.widget;
  }

  return {
    preload: () => {
      mountWidget().catch((error: unknown) => console.warn("[better-auth-captcha]", error));
    },
    async getToken() {
      const widget = await mountWidget().catch(() => undefined);
      if (!widget) return "";

      const { api, widgetId } = widget;

      if (state.failed) {
        api.reset(widgetId);
        return "";
      }

      const token = api.getResponse(widgetId);

      if (token && !api.isExpired(widgetId)) {
        api.reset(widgetId);
        return token;
      }

      return new Promise<string>((resolve) => waiting.push(resolve));
    },
  };
}
