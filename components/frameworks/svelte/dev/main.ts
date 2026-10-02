import { mount } from "svelte";
import App from "./App.svelte";
import "@omnibase/mitosis-storybook/styles.css";

const target = document.getElementById("app");

if (target) {
  mount(App, { target });
}
