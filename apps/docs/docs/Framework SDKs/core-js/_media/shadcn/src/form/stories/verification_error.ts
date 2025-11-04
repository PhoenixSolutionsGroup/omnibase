export const mockVerificationFlowError = {
  action:
    "http://127.0.0.1:3000/self-service/verification?flow=76be620c-3d14-4740-8878-1400c549674b",
  messages: [
    {
      id: 4070006,
      text: "The verification code is invalid or has already been used. Please try again.",
      type: "error",
    },
  ],
  method: "POST",
  nodes: [
    {
      attributes: {
        disabled: false,
        name: "method",
        node_type: "input",
        type: "hidden",
        value: "code",
      },
      group: "code",
      messages: [],
      meta: {},
      type: "input",
    },
    {
      attributes: {
        disabled: false,
        name: "code",
        node_type: "input",
        required: true,
        type: "text",
      },
      group: "code",
      messages: [],
      meta: {
        label: {
          id: 1070011,
          text: "Verification code",
          type: "info",
        },
      },
      type: "input",
    },
    {
      attributes: {
        disabled: false,
        name: "method",
        node_type: "input",
        type: "submit",
        value: "code",
      },
      group: "code",
      messages: [],
      meta: {
        label: {
          id: 1070005,
          text: "Submit",
          type: "info",
        },
      },
      type: "input",
    },
    {
      attributes: {
        disabled: false,
        name: "csrf_token",
        node_type: "input",
        required: true,
        type: "hidden",
        value:
          "DY9EKaKymoIcWd8QtLvNAyOvwVd81ZzxL0AOWHbxzd6PScEiStB90x5MCMYYqpZF7WLMTWZl1Rww+fxcw6OIQA==",
      },
      group: "default",
      messages: [],
      meta: {},
      type: "input",
    },
  ],
};
