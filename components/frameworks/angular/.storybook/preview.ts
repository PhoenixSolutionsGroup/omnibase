import type { Preview } from "@storybook/angular-vite";
import { registerCustomCssBridge } from "@omnibase/mitosis-storybook/custom-css-bridge";
import "zone.js";
import "@omnibase/mitosis-storybook/styles.css";

registerCustomCssBridge();

const preview: Preview = {
  parameters: {
    layout: "padded",
  },
};

export default preview;
