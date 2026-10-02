import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "Overview",
  parameters: {
    layout: "fullscreen",
    options: { showPanel: false },
  },
};

export default meta;
type Story = StoryObj;

export const Introduction: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl space-y-4 p-10">
      <h1 className="text-2xl font-semibold">OmniBase Mitosis Components</h1>
      <p className="text-muted-foreground">
        One framework-agnostic implementation authored in Mitosis, compiled to
        multiple frameworks. Each framework's Storybook is composed into this
        head Storybook via <code>refs</code>, so you can compare the exact same
        component and inputs across frameworks.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>React — components/frameworks/react</li>
        <li>Vue — components/frameworks/vue</li>
        <li>Svelte — components/frameworks/svelte</li>
      </ul>
      <p className="text-muted-foreground">
        Shared fixtures and styles live in this package and are imported by
        every framework Storybook.
      </p>
    </div>
  ),
};
