import type { CaptchaProvider } from "../index.ts";
import { loadScript, once, warn } from "./utils.ts";

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
  const load = once(async () => {
    const api = await loadScript(
      `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}&onload=onRecaptchaLoad`,
      "onRecaptchaLoad",
      () => window.grecaptcha,
    );
    await new Promise<void>((resolve) => api.ready(resolve));
    return api;
  });

  return {
    preload: () => {
      load().catch((error: unknown) => warn("Preload failed", error));
    },
    async getToken() {
      try {
        const api = await load();
        return await api.execute(siteKey, { action });
      } catch (error) {
        warn("reCAPTCHA error", error);
        return "";
      }
    },
  };
}
