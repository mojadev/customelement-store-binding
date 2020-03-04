import { Config } from "@stencil/core";
import { cesbStencilSupport } from "cesb-stencil-plugin/rollup-plugin";
// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: "src/global/app.css",
  globalScript: "src/global/app.ts",
  plugins: [cesbStencilSupport()],
  outputTargets: [
    {
      type: "www",
      // comment the following line to disable service workers in production
      serviceWorker: null,
      baseUrl: "https://myapp.local/"
    }
  ]
};
