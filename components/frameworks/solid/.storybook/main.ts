import type { StorybookConfig } from "storybook-solidjs-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "storybook-solidjs-vite",
    options: {},
  },
  async viteFinal(config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};

export default config;
