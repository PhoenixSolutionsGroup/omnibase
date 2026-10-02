import type { Preview } from "@storybook/vue3-vite";
import { registerCustomCssBridge } from "@omnibase/mitosis-storybook/custom-css-bridge";
import "@omnibase/mitosis-storybook/styles.css";

registerCustomCssBridge();

const preview: Preview = {
  parameters: {
    layout: "padded",
  },
};

export default preview;
