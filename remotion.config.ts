import { Config } from "@remotion/cli/config";
import { bundle } from "@remotion/bundler";

Config.setChromiumOpenGlRenderer("swiftshader");

export default async () => {
  const bundled = await bundle({
    entryPoint: "./src/index.ts",
    webpackOverride: (config) => {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        three: require.resolve("three"),
      };
      return config;
    },
  });
  return bundled;
};