import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "src/index.ts", turnstile: "src/turnstile.ts", recaptcha: "src/recaptcha.ts" },
  platform: "browser",
  dts: { generator: "oxc" },
  exports: true,
  publint: true,
});
