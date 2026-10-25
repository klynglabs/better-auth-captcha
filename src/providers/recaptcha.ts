import type { CaptchaProvider } from "../types.ts";
import { loadScript } from "../utils/browser.ts";
import { createProvider } from "./create-provider.ts";

interface RecaptchaApi {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

export interface RecaptchaOptions {
  siteKey: string;
  action?: string;
}

export function recaptcha({ siteKey, action = "submit" }: RecaptchaOptions): CaptchaProvider {
  return createProvider({
    name: "reCAPTCHA",
    async mount() {
      const api = await loadScript(
        `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}&onload=onRecaptchaLoad`,
        "onRecaptchaLoad",
        () => window.grecaptcha,
      );
      await new Promise<void>((resolve) => api.ready(resolve));
      return api;
    },
    execute: (api) => api.execute(siteKey, { action }),
  });
}
