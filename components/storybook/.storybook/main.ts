import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  refs: {
    react: { title: "React", url: "http://localhost:6008" },
    vue: { title: "Vue", url: "http://localhost:6009" },
    svelte: { title: "Svelte", url: "http://localhost:6010" },
    preact: { title: "Preact", url: "http://localhost:6011" },
    solid: { title: "Solid", url: "http://localhost:6012" },
    angular: { title: "Angular", url: "http://localhost:6013" },
  },
  async viteFinal(config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};

export default config;
