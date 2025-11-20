import type { Meta, StoryObj } from "@storybook/react";
import { PricingTable } from "./index";
import { mockProducts } from "./mock-data";

const meta: Meta<typeof PricingTable> = {
  title: "Components/PricingTable",
  component: PricingTable,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive pricing table component that displays products with their pricing options, features, and UI customizations. Supports highlighting, badges, custom pricing text, and flexible billing intervals.",
      },
    },
  },
  argTypes: {
    products: {
      description: "Array of products from Stripe configuration",
      control: false,
    },
    selectedPriceId: {
      description: "Currently selected price ID for highlighting",
      control: "text",
    },
    onPriceSelect: {
      description: "Callback fired when a price is selected",
      action: "price selected",
    },
    showPricingToggle: {
      description: "Show monthly/yearly toggle",
      control: "boolean",
    },
    defaultInterval: {
      description: "Default billing interval to display",
      control: "select",
      options: ["month", "year"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PricingTable>;

// Default story showing the pricing table
export const Default: Story = {
  args: {
    products: mockProducts,
    showPricingToggle: true,
    defaultInterval: "month",
  },
};

// Story with selected price
export const WithSelectedPrice: Story = {
  args: {
    products: mockProducts,
    selectedPriceId: "pro_monthly",
    showPricingToggle: true,
    defaultInterval: "month",
  },
};

// Story showing yearly pricing by default
export const YearlyDefault: Story = {
  args: {
    products: mockProducts,
    showPricingToggle: true,
    defaultInterval: "year",
  },
};

// Story without pricing toggle
export const WithoutToggle: Story = {
  args: {
    products: mockProducts,
    showPricingToggle: false,
    defaultInterval: "month",
  },
};

// Story with single product
export const SingleProduct: Story = {
  args: {
    products: [mockProducts[0]],
    showPricingToggle: true,
    defaultInterval: "month",
  },
};

// Story with custom styling
export const CustomStyling: Story = {
  args: {
    products: mockProducts,
    showPricingToggle: true,
    defaultInterval: "month",
    className: "max-w-6xl mx-auto",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-50 p-8 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-gray-600">
            Select the perfect plan for your business needs
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
};

// Story demonstrating carousel with all products
export const CarouselExample: Story = {
  args: {
    products: mockProducts, // This has 6 products, so carousel will be active
    showPricingToggle: true,
    defaultInterval: "month",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-50 p-8 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Carousel Example</h1>
          <p className="text-gray-600">
            6 products with carousel navigation (shows 3 at a time)
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
};
