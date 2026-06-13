import { Configuration } from "@omnibase/core-js";

export type OmnibaseOptions = {
  basePath: string;
  apiKey: string;
};

export const createConfig = (opts: OmnibaseOptions) =>
  new Configuration({
    basePath: opts.basePath,
    apiKey: opts.apiKey,
  });
