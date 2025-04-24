import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      data: path.resolve(__dirname, "src/data"),
      repositories: path.resolve(__dirname, "src/repositories"),
      services: path.resolve(__dirname, "src/services"),
      constants: path.resolve(__dirname, "src/constants"),
      helpers: path.resolve(__dirname, "src/helpers"),
    },
  },
  base: "/",
});
