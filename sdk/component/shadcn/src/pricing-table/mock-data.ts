import type { Product } from "@omnibase/core-js";

export const mockProducts: Product[] = [
  {
    id: "starter_plan",
    name: "Starter Plan",
    description: "Perfect for individuals and small teams",
    type: "service",
    ui: {
      displayName: "Starter",
      tagline: "Perfect for getting started",
      features: [
        "Up to 5 team members",
        "10GB storage",
        "Email support",
        "Basic analytics",
      ],
      ctaText: "Start Free Trial",
      sortOrder: 1,
    },
    prices: [
      {
        id: "starter_monthly",
        amount: 999,
        currency: "usd",
        interval: "month",
        ui: {
          displayName: "Monthly",
          billingPeriod: "per month",
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
          displayName: "Yearly",
          billingPeriod: "per year",
          priceDisplay: {
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
      displayName: "Professional",
      tagline: "For growing businesses",
      features: [
        "Unlimited team members",
        "100GB storage",
        "Priority support",
        "Advanced analytics",
        "API access",
      ],
      badge: "Most Popular",
      ctaText: "Upgrade Now",
      highlighted: true,
      sortOrder: 2,
    },
    prices: [
      {
        id: "pro_monthly",
        amount: 2999,
        currency: "usd",
        interval: "month",
        ui: {
          displayName: "Monthly",
          billingPeriod: "per month",
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
          displayName: "Yearly",
          billingPeriod: "per year",
          priceDisplay: {
            suffix: "(Save 17%!)",
            showCurrency: true,
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
      displayName: "Business",
      tagline: "For established businesses",
      features: [
        "Unlimited everything",
        "500GB storage",
        "24/7 phone support",
        "Custom integrations",
        "White-label options",
      ],
      ctaText: "Choose Business",
      sortOrder: 3,
    },
    prices: [
      {
        id: "business_monthly",
        amount: 4999,
        currency: "usd",
        interval: "month",
        ui: {
          displayName: "Monthly",
          billingPeriod: "per month",
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
          displayName: "Yearly",
          billingPeriod: "per year",
          priceDisplay: {
            suffix: "(Save 20%!)",
            showCurrency: true,
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
      displayName: "Scale",
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
      ctaText: "Scale Now",
      sortOrder: 4,
    },
    prices: [
      {
        id: "scale_monthly",
        amount: 9999,
        currency: "usd",
        interval: "month",
        ui: {
          displayName: "Monthly",
          billingPeriod: "per month",
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
          displayName: "Yearly",
          billingPeriod: "per year",
          priceDisplay: {
            suffix: "(Save 25%!)",
            showCurrency: true,
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
      displayName: "Enterprise",
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
      ctaText: "Contact Sales",
      highlighted: false,
      sortOrder: 5,
    },
    prices: [
      {
        id: "enterprise_custom",
        amount: 0,
        currency: "usd",
        interval: "month",
        ui: {
          displayName: "Custom Pricing",
          priceDisplay: {
            customText: "Contact us",
            showCurrency: false,
          },
          billingPeriod: "custom terms",
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
          displayName: "Enterprise Starter",
          billingPeriod: "per month",
          priceDisplay: {
            suffix: "(minimum commitment)",
            showCurrency: true,
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
      displayName: "Developer",
      tagline: "Perfect for developers",
      features: [
        "1 developer seat",
        "5GB storage",
        "Community support",
        "Basic integrations",
        "Documentation access",
      ],
      ctaText: "Start Building",
      sortOrder: 0,
    },
    prices: [
      {
        id: "developer_monthly",
        amount: 0,
        currency: "usd",
        interval: "month",
        ui: {
          displayName: "Free",
          priceDisplay: {
            customText: "Free",
            showCurrency: false,
          },
          billingPeriod: "forever",
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
