import type { Preview } from "@storybook/react-vite";
import { registerCustomCssBridge } from "@omnibase/mitosis-storybook/custom-css-bridge";
import "../src/styles.css";

registerCustomCssBridge();

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
  },
};

export default preview;
