import type { CaptchaProvider } from "./index.ts";

const SCRIPT_URL = "https://cdn.captchafox.com/api.js?render=explicit&onload=onCaptchafoxLoad";

interface CaptchafoxApi {
  render: (container: HTMLElement, params: { sitekey: string; mode: "hidden" }) => string;
  execute: (widgetId: string) => Promise<string>;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    captchafox?: CaptchafoxApi;
    onCaptchafoxLoad?: () => void;
  }
}

function loadCaptchafox() {
  return new Promise<CaptchafoxApi>((resolve, reject) => {
    if (window.captchafox) {
      resolve(window.captchafox);
      return;
    }

    window.onCaptchafoxLoad = () => {
      if (window.captchafox) resolve(window.captchafox);
    };

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.addEventListener("error", () => reject(new Error("Failed to load CaptchaFox.")), {
      once: true,
    });
    document.head.append(script);
  });
}

export interface CaptchafoxOptions {
  siteKey: string;
}

export function captchafox({ siteKey }: CaptchafoxOptions): CaptchaProvider {
  const state: {
    widget?: Promise<{ api: CaptchafoxApi; widgetId: string }>;
    queue: Promise<unknown>;
  } = { queue: Promise.resolve() };

  async function renderWidget() {
    const api = await loadCaptchafox();

    const container = document.createElement("div");
    document.body.append(container);

    return { api, widgetId: api.render(container, { sitekey: siteKey, mode: "hidden" }) };
  }

  function mountWidget() {
    state.widget ??= renderWidget();
    return state.widget;
  }

  async function execute() {
    try {
      const { api, widgetId } = await mountWidget();
      try {
        return await api.execute(widgetId);
      } finally {
        api.reset(widgetId);
      }
    } catch (error) {
      console.warn("[better-auth-captcha] CaptchaFox error", error);
      return "";
    }
  }

  return {
    preload: () => {
      mountWidget().catch((error: unknown) => console.warn("[better-auth-captcha]", error));
    },
    getToken() {
      const token = state.queue.then(execute);
      state.queue = token;
      return token;
    },
  };
}
