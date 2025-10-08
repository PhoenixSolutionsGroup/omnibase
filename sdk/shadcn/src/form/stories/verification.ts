export const mockVerificationFlow = {
  action:
    "http://127.0.0.1:3000/self-service/verification?flow=e8b8c89d-b8a4-4a13-bbb4-43d87ae24827",
  messages: [
    {
      id: 1080003,
      text: "An email containing a verification code has been sent to the email address you provided. If you have not received an email, check the spelling of the address and make sure to use the address you registered with.",
      type: "info",
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
          "ACwu4oJU85T9Gpoq1tQ0Am0AhZhOHmhHbP/dJKJoaAB12wPE0PBsesccxTGprPtk0KaHMxHc3XgogHQ7w41zaw==",
      },
      group: "default",
      messages: [],
      meta: {},
      type: "input",
    },
  ],
};
