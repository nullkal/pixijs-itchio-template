import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    server: { open: false },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
      globals: false,
      // テンプレートではテスト0件を許可する。
      passWithNoTests: true,
      unstubEnvs: true,
    },
  }),
);
