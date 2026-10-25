import type { CaptchaProvider } from "../types.ts";
import { createContainer, loadScript } from "../utils/browser.ts";
import { createProvider } from "./create-provider.ts";

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
  return createProvider({
    name: "CaptchaFox",
    async mount() {
      const api = await loadScript(SCRIPT_URL, "onCaptchafoxLoad", () => window.captchafox);

      return { api, widgetId: api.render(createContainer(), { sitekey: siteKey, mode: "hidden" }) };
    },
    async execute({ api, widgetId }) {
      try {
        return await api.execute(widgetId);
      } finally {
        api.reset(widgetId);
      }
    },
  });
}
