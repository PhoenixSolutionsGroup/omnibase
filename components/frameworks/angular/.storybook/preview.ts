import type { Preview } from "@storybook/angular-vite";
import "zone.js";
import "@omnibase/mitosis-storybook/styles.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
  },
};

export default preview;
