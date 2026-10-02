import type { StorybookConfig } from "@storybook/angular-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|mjs|ts)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/angular-vite",
    options: {},
  },
  async viteFinal(config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};

export default config;
