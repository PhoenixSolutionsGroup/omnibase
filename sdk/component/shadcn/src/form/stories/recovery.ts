export const mockRecoveryFlow = {
  created_at: {},
  expires_at: {},
  id: "10596450-47cc-40ce-ad9b-75f4278e2a26",
  issued_at: {},
  request_url: "http://127.0.0.1:3000/self-service/recovery/browser",
  state: "choose_method",
  type: "browser",
  ui: {
    action:
      "http://127.0.0.1:3000/self-service/recovery?flow=10596450-47cc-40ce-ad9b-75f4278e2a26",
    method: "POST",
    nodes: [
      {
        attributes: {
          disabled: false,
          name: "csrf_token",
          node_type: "input",
          required: true,
          type: "hidden",
          value:
            "0o5GflSL2Vjs/Mc82XBc7R4yer0uyjgkSWLDF3KOaye/GcFYoJrt8ThzrjsbGpu8m/ebeRaGiWVZT6mPI8qFgA==",
        },
        group: "default",
        messages: [],
        meta: {},
        type: "input",
      },
      {
        attributes: {
          disabled: false,
          name: "email",
          node_type: "input",
          required: true,
          type: "email",
        },
        group: "code",
        messages: [],
        meta: {
          label: {
            id: 1070007,
            text: "Email",
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
    ],
  },
  updated_at: {},
};
