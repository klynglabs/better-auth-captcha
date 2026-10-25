import type { CaptchaProvider } from "../types.ts";
import { createContainer, loadScript } from "../utils/browser.ts";
import { createProvider } from "./create-provider.ts";

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
  return createProvider({
    name: "hCaptcha",
    async mount() {
      const api = await loadScript(SCRIPT_URL, "onHcaptchaLoad", () => window.hcaptcha);

      return {
        api,
        widgetId: api.render(createContainer(), { sitekey: siteKey, size: "invisible" }),
      };
    },
    async execute({ api, widgetId }) {
      try {
        const { response } = await api.execute(widgetId, { async: true });
        return response;
      } finally {
        api.reset(widgetId);
      }
    },
  });
}
