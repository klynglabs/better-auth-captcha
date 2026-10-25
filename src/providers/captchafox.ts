import type { CaptchaProvider } from "../index.ts";
import { createQueue, loadScript, once, warn } from "./utils.ts";

const SCRIPT_URL = "https://cdn.captchafox.com/api.js?render=explicit&onload=onCaptchafoxLoad";

interface CaptchafoxApi {
  render: (container: HTMLElement, params: { sitekey: string; mode: "hidden" }) => string;
  execute: (widgetId: string) => Promise<string>;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    captchafox?: CaptchafoxApi;
  }
}

export interface CaptchafoxOptions {
  siteKey: string;
}

export function captchafox({ siteKey }: CaptchafoxOptions): CaptchaProvider {
  const enqueue = createQueue();

  async function renderWidget() {
    const api = await loadScript(SCRIPT_URL, "onCaptchafoxLoad", () => window.captchafox);

    const container = document.createElement("div");
    document.body.append(container);

    return { api, widgetId: api.render(container, { sitekey: siteKey, mode: "hidden" }) };
  }

  const mountWidget = once(renderWidget);

  async function execute() {
    try {
      const { api, widgetId } = await mountWidget();
      try {
        return await api.execute(widgetId);
      } finally {
        api.reset(widgetId);
      }
    } catch (error) {
      warn("CaptchaFox error", error);
      return "";
    }
  }

  return {
    preload: () => {
      mountWidget().catch((error: unknown) => warn("Preload failed", error));
    },
    getToken: () => enqueue(execute),
  };
}
