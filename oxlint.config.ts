import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "import", "oxc"],
  categories: {
    correctness: "error",
    suspicious: "warn",
    perf: "warn",
  },
  env: { browser: true, es2024: true },
  ignorePatterns: ["**/dist/**"],
});
