import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      data: path.resolve(__dirname, "src/data"),
      repositories: path.resolve(__dirname, "src/repositories"),
      application: path.resolve(__dirname, "src/application"),
      domain: path.resolve(__dirname, "src/domain"),
      infrastructure: path.resolve(__dirname, "src/infrastructure"),
      constants: path.resolve(__dirname, "src/constants"),
      helpers: path.resolve(__dirname, "src/helpers"),
      tests: path.resolve(__dirname, "src/tests"),
    },
  },
  base: "/",
});
