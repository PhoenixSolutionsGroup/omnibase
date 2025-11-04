export const mockLoginTSA = {
  created_at: {},
  expires_at: {},
  id: "28611d07-c8f3-41f9-bfee-f981e0d34783",
  issued_at: {},
  refresh: false,
  request_url: "http://127.0.0.1:3000/self-service/login/browser?aal=aal2",
  requested_aal: "aal2",
  state: "choose_method",
  type: "browser",
  ui: {
    action:
      "http://127.0.0.1:3000/self-service/login?flow=28611d07-c8f3-41f9-bfee-f981e0d34783",
    messages: [
      {
        id: 1010004,
        text: "Please complete the second authentication challenge.",
        type: "info",
      },
    ],
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
            "K77Lx9XiNHeJXq5d51GDPn6rhb1le9i5Ve2jS6D20fdkyCrN+4N1d8yBRW3Z8woIC7pEvrD3YNGmBpIhUjjHcw==",
        },
        group: "default",
        messages: [],
        meta: {},
        type: "input",
      },
      {
        attributes: {
          disabled: false,
          name: "totp_code",
          node_type: "input",
          required: true,
          type: "text",
          value: "",
        },
        group: "totp",
        messages: [],
        meta: {
          label: {
            id: 1010006,
            text: "Authentication code",
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
          value: "totp",
        },
        group: "totp",
        messages: [],
        meta: {
          label: {
            id: 1010009,
            text: "Use Authenticator",
            type: "info",
          },
        },
        type: "input",
      },
      {
        attributes: {
          disabled: false,
          name: "lookup_secret",
          node_type: "input",
          required: true,
          type: "text",
          value: "",
        },
        group: "lookup_secret",
        messages: [],
        meta: {
          label: {
            id: 1010007,
            text: "Backup recovery code",
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
          value: "lookup_secret",
        },
        group: "lookup_secret",
        messages: [],
        meta: {
          label: {
            id: 1010010,
            text: "Use backup recovery code",
            type: "info",
          },
        },
        type: "input",
      },
    ],
  },
  updated_at: {},
};
