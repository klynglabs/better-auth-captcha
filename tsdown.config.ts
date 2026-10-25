import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    turnstile: "src/providers/turnstile.ts",
    recaptcha: "src/providers/recaptcha.ts",
    hcaptcha: "src/providers/hcaptcha.ts",
    captchafox: "src/providers/captchafox.ts",
  },
  platform: "browser",
  dts: { generator: "oxc" },
  exports: true,
  publint: true,
});
