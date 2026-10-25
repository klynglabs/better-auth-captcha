import type { BetterAuthClientPlugin } from "better-auth";
import type { captcha } from "better-auth/plugins/captcha";

export interface CaptchaProvider {
  preload: () => void;
  getToken: () => Promise<string>;
}

export interface CaptchaClientOptions {
  provider: CaptchaProvider;
  endpoints?: string[];
}

export interface CaptchaClientPlugin {
  id: "captcha";
  $InferServerPlugin?: ReturnType<typeof captcha>;
  getActions: () => { captcha: { preload: () => void } };
  fetchPlugins: NonNullable<BetterAuthClientPlugin["fetchPlugins"]>;
}
