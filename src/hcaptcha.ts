import type { CaptchaProvider } from "./index.ts";

const SCRIPT_URL =
  "https://js.hcaptcha.com/1/api.js?render=explicit&onload=onHcaptchaLoad&recaptchacompat=off";

interface HcaptchaApi {
  render: (container: HTMLElement, params: { sitekey: string; size: "invisible" }) => string;
  execute: (widgetId: string, options: { async: true }) => Promise<{ response: string }>;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    hcaptcha?: HcaptchaApi;
    onHcaptchaLoad?: () => void;
  }
}

function loadHcaptcha() {
  return new Promise<HcaptchaApi>((resolve, reject) => {
    if (window.hcaptcha) {
      resolve(window.hcaptcha);
      return;
    }

    window.onHcaptchaLoad = () => {
      if (window.hcaptcha) resolve(window.hcaptcha);
    };

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.addEventListener("error", () => reject(new Error("Failed to load hCaptcha.")), {
      once: true,
    });
    document.head.append(script);
  });
}

export interface HcaptchaOptions {
  siteKey: string;
}

export function hcaptcha({ siteKey }: HcaptchaOptions): CaptchaProvider {
  const state: {
    widget?: Promise<{ api: HcaptchaApi; widgetId: string }>;
    queue: Promise<unknown>;
  } = { queue: Promise.resolve() };

  async function renderWidget() {
    const api = await loadHcaptcha();

    const container = document.createElement("div");
    document.body.append(container);

    return { api, widgetId: api.render(container, { sitekey: siteKey, size: "invisible" }) };
  }

  function mountWidget() {
    state.widget ??= renderWidget();
    return state.widget;
  }

  async function execute() {
    try {
      const { api, widgetId } = await mountWidget();
      try {
        const { response } = await api.execute(widgetId, { async: true });
        return response;
      } finally {
        api.reset(widgetId);
      }
    } catch (error) {
      console.warn("[better-auth-captcha] hCaptcha error", error);
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
