import type { CaptchaProvider } from "../index.ts";
import { createQueue, loadScript, once, warn } from "./utils.ts";

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
  }
}

export interface HcaptchaOptions {
  siteKey: string;
}

export function hcaptcha({ siteKey }: HcaptchaOptions): CaptchaProvider {
  const enqueue = createQueue();

  async function renderWidget() {
    const api = await loadScript(SCRIPT_URL, "onHcaptchaLoad", () => window.hcaptcha);

    const container = document.createElement("div");
    document.body.append(container);

    return { api, widgetId: api.render(container, { sitekey: siteKey, size: "invisible" }) };
  }

  const mountWidget = once(renderWidget);

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
      warn("hCaptcha error", error);
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
