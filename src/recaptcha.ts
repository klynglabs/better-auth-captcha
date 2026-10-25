import type { CaptchaProvider } from "./index.ts";

interface RecaptchaApi {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
    onRecaptchaLoad?: () => void;
  }
}

function loadRecaptcha(siteKey: string) {
  return new Promise<RecaptchaApi>((resolve, reject) => {
    const existing = window.grecaptcha;
    if (existing) {
      existing.ready(() => resolve(existing));
      return;
    }

    window.onRecaptchaLoad = () => {
      if (window.grecaptcha) resolve(window.grecaptcha);
    };

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}&onload=onRecaptchaLoad`;
    script.async = true;
    script.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA.")), {
      once: true,
    });
    document.head.append(script);
  });
}

export interface RecaptchaOptions {
  siteKey: string;
  action?: string;
}

export function recaptcha({ siteKey, action = "submit" }: RecaptchaOptions): CaptchaProvider {
  const state: { api?: Promise<RecaptchaApi> } = {};

  function load() {
    state.api ??= loadRecaptcha(siteKey);
    return state.api;
  }

  return {
    preload: () => {
      load().catch((error: unknown) => console.warn("[better-auth-captcha]", error));
    },
    async getToken() {
      try {
        const api = await load();
        return await api.execute(siteKey, { action });
      } catch (error) {
        console.warn("[better-auth-captcha]", error);
        return "";
      }
    },
  };
}
