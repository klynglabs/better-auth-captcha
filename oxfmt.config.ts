import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 100,
  sortImports: {},
  sortPackageJson: {},
  ignorePatterns: ["**/dist/**", "**/.next/**", "**/*.md"],
});
