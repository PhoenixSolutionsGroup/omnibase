import type { Product } from "@omnibase/core-js/stripe";

export const mockProducts: Product[] = [
  {
    id: "starter_plan",
    name: "Starter Plan",
    description: "Perfect for individuals and small teams",
    type: "service",
    ui: {
      display_name: "Starter",
      tagline: "Perfect for getting started",
      features: [
        "Up to 5 team members",
        "10GB storage",
        "Email support",
        "Basic analytics",
      ],
      cta_text: "Start Free Trial",
      sort_order: 1,
    },
    prices: [
      {
        id: "starter_monthly",
        amount: 999,
        currency: "usd",
        interval: "month",
        ui: {
          display_name: "Monthly",
          billing_period: "per month",
          limits: [
            {
              text: "1,000 API calls included",
              value: 1000,
              unit: "calls",
            },
          ],
        },
      },
      {
        id: "starter_yearly",
        amount: 9999,
        currency: "usd",
        interval: "year",
        ui: {
          display_name: "Yearly",
          billing_period: "per year",
          price_display: {
            suffix: "(2 months free!)",
          },
          limits: [
            {
              text: "12,000 API calls included",
              value: 12000,
              unit: "calls",
            },
          ],
        },
      },
    ],
  },
  {
    id: "professional_plan",
    name: "Professional Plan",
    description: "For growing businesses that need advanced features",
    type: "service",
    ui: {
      display_name: "Professional",
      tagline: "For growing businesses",
      features: [
        "Unlimited team members",
        "100GB storage",
        "Priority support",
        "Advanced analytics",
        "API access",
      ],
      badge: "Most Popular",
      cta_text: "Upgrade Now",
      highlighted: true,
      sort_order: 2,
    },
    prices: [
      {
        id: "pro_monthly",
        amount: 2999,
        currency: "usd",
        interval: "month",
        ui: {
          display_name: "Monthly",
          billing_period: "per month",
          features: ["Monthly reports", "Standard SLA"],
          limits: [
            {
              text: "10,000 API calls included",
              value: 10000,
              unit: "calls",
            },
            {
              text: "5 integrations",
              value: 5,
              unit: "integrations",
            },
          ],
        },
      },
      {
        id: "pro_yearly",
        amount: 29999,
        currency: "usd",
        interval: "year",
        ui: {
          display_name: "Yearly",
          billing_period: "per year",
          price_display: {
            suffix: "(Save 17%!)",
            show_currency: true,
          },
          features: ["Annual reports", "Enhanced SLA"],
          limits: [
            {
              text: "120,000 API calls included",
              value: 120000,
              unit: "calls",
            },
            {
              text: "10 integrations",
              value: 10,
              unit: "integrations",
            },
          ],
        },
      },
    ],
  },
  {
    id: "business_plan",
    name: "Business Plan",
    description: "Advanced features for established businesses",
    type: "service",
    ui: {
      display_name: "Business",
      tagline: "For established businesses",
      features: [
        "Unlimited everything",
        "500GB storage",
        "24/7 phone support",
        "Custom integrations",
        "White-label options",
      ],
      cta_text: "Choose Business",
      sort_order: 3,
    },
    prices: [
      {
        id: "business_monthly",
        amount: 4999,
        currency: "usd",
        interval: "month",
        ui: {
          display_name: "Monthly",
          billing_period: "per month",
          features: ["Monthly business reviews", "Premium SLA"],
          limits: [
            {
              text: "50,000 API calls included",
              value: 50000,
              unit: "calls",
            },
            {
              text: "25 integrations",
              value: 25,
              unit: "integrations",
            },
          ],
        },
      },
      {
        id: "business_yearly",
        amount: 49999,
        currency: "usd",
        interval: "year",
        ui: {
          display_name: "Yearly",
          billing_period: "per year",
          price_display: {
            suffix: "(Save 20%!)",
            show_currency: true,
          },
          features: ["Quarterly business reviews", "Premium+ SLA"],
          limits: [
            {
              text: "600,000 API calls included",
              value: 600000,
              unit: "calls",
            },
            {
              text: "50 integrations",
              value: 50,
              unit: "integrations",
            },
          ],
        },
      },
    ],
  },
  {
    id: "scale_plan",
    name: "Scale Plan",
    description: "High-performance solution for scaling companies",
    type: "service",
    ui: {
      display_name: "Scale",
      tagline: "For scaling companies",
      features: [
        "Unlimited everything",
        "1TB storage",
        "Dedicated account manager",
        "Custom development",
        "Private cloud options",
        "Advanced security",
      ],
      badge: "High Performance",
      cta_text: "Scale Now",
      sort_order: 4,
    },
    prices: [
      {
        id: "scale_monthly",
        amount: 9999,
        currency: "usd",
        interval: "month",
        ui: {
          display_name: "Monthly",
          billing_period: "per month",
          features: ["Weekly check-ins", "Enterprise SLA"],
          limits: [
            {
              text: "250,000 API calls included",
              value: 250000,
              unit: "calls",
            },
            {
              text: "100 integrations",
              value: 100,
              unit: "integrations",
            },
          ],
        },
      },
      {
        id: "scale_yearly",
        amount: 99999,
        currency: "usd",
        interval: "year",
        ui: {
          display_name: "Yearly",
          billing_period: "per year",
          price_display: {
            suffix: "(Save 25%!)",
            show_currency: true,
          },
          features: ["Monthly strategic reviews", "Enterprise+ SLA"],
          limits: [
            {
              text: "3M API calls included",
              value: 3000000,
              unit: "calls",
            },
            {
              text: "Unlimited integrations",
            },
          ],
        },
      },
    ],
  },
  {
    id: "enterprise_plan",
    name: "Enterprise Plan",
    description:
      "Custom solutions for large organizations with dedicated support",
    type: "service",
    ui: {
      display_name: "Enterprise",
      tagline: "Custom solutions for enterprises",
      features: [
        "Unlimited everything",
        "Unlimited storage",
        "Dedicated infrastructure",
        "Custom contracts",
        "Compliance certifications",
        "White-glove onboarding",
      ],
      badge: "Enterprise",
      cta_text: "Contact Sales",
      highlighted: false,
      sort_order: 5,
    },
    prices: [
      {
        id: "enterprise_custom",
        amount: 0,
        currency: "usd",
        interval: "month",
        ui: {
          display_name: "Custom Pricing",
          price_display: {
            custom_text: "Contact us",
            show_currency: false,
          },
          billing_period: "custom terms",
          features: ["Custom contract terms", "Dedicated infrastructure"],
          limits: [
            {
              text: "Unlimited API calls",
            },
            {
              text: "Unlimited integrations",
            },
            {
              text: "24/7 phone support",
            },
          ],
        },
      },
      {
        id: "enterprise_starter",
        amount: 99999,
        currency: "usd",
        interval: "month",
        ui: {
          display_name: "Enterprise Starter",
          billing_period: "per month",
          price_display: {
            suffix: "(minimum commitment)",
            show_currency: true,
          },
          features: ["12-month minimum", "Standard enterprise features"],
          limits: [
            {
              text: "1M API calls included",
              value: 1000000,
              unit: "calls",
            },
            {
              text: "50 integrations",
              value: 50,
              unit: "integrations",
            },
            {
              text: "99.9% uptime SLA",
              value: 99.9,
              unit: "percent",
            },
          ],
        },
      },
    ],
  },
  {
    id: "developer_plan",
    name: "Developer Plan",
    description: "Perfect for individual developers and small projects",
    type: "service",
    ui: {
      display_name: "Developer",
      tagline: "Perfect for developers",
      features: [
        "1 developer seat",
        "5GB storage",
        "Community support",
        "Basic integrations",
        "Documentation access",
      ],
      cta_text: "Start Building",
      sort_order: 0,
    },
    prices: [
      {
        id: "developer_monthly",
        amount: 0,
        currency: "usd",
        interval: "month",
        ui: {
          display_name: "Free",
          price_display: {
            custom_text: "Free",
            show_currency: false,
          },
          billing_period: "forever",
          limits: [
            {
              text: "100 API calls included",
              value: 100,
              unit: "calls",
            },
            {
              text: "1 integration",
              value: 1,
              unit: "integrations",
            },
          ],
        },
      },
    ],
  },
];
