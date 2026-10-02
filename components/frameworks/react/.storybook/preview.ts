import type { Preview } from "@storybook/react-vite";
import { registerCustomCssBridge } from "@omnibase/mitosis-storybook/custom-css-bridge";
import "@omnibase/mitosis-storybook/styles.css";

registerCustomCssBridge();

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
