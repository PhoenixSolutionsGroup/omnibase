export const mockSettingsFlow = {
  action:
    "http://127.0.0.1:3000/self-service/settings?flow=aa8212d9-b07a-4c0a-8e0d-af80815dd3af",
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
          "QotjqL5BCIgYxXppbNyOqjxOASAqeLxb+HvHzSIBOlhtOw9sOaEhrWup8Xvlkt5uNI+lkq01Murb5arh3LAOHQ==",
      },
      group: "default",
      messages: [],
      meta: {},
      type: "input",
    },
    {
      attributes: {
        autocomplete: "email",
        disabled: false,
        name: "traits.email",
        node_type: "input",
        required: true,
        type: "email",
        value: "johndoe@gmail.com",
      },
      group: "profile",
      messages: [],
      meta: {
        label: {
          context: {
            title: "E-Mail",
          },
          id: 1070002,
          text: "E-Mail",
          type: "info",
        },
      },
      type: "input",
    },
    {
      attributes: {
        disabled: false,
        name: "traits.name.first",
        node_type: "input",
        type: "text",
        value: "John",
      },
      group: "profile",
      messages: [],
      meta: {
        label: {
          context: {
            title: "First Name",
          },
          id: 1070002,
          text: "First Name",
          type: "info",
        },
      },
      type: "input",
    },
    {
      attributes: {
        disabled: false,
        name: "traits.name.last",
        node_type: "input",
        type: "text",
        value: "Doe",
      },
      group: "profile",
      messages: [],
      meta: {
        label: {
          context: {
            title: "Last Name",
          },
          id: 1070002,
          text: "Last Name",
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
        value: "profile",
      },
      group: "profile",
      messages: [],
      meta: {
        label: {
          id: 1070003,
          text: "Save",
          type: "info",
        },
      },
      type: "input",
    },
    {
      attributes: {
        autocomplete: "new-password",
        disabled: false,
        name: "password",
        node_type: "input",
        required: true,
        type: "password",
      },
      group: "password",
      messages: [],
      meta: {
        label: {
          id: 1070001,
          text: "Password",
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
        value: "password",
      },
      group: "password",
      messages: [],
      meta: {
        label: {
          id: 1070003,
          text: "Save",
          type: "info",
        },
      },
      type: "input",
    },
    {
      attributes: {
        disabled: false,
        name: "lookup_secret_regenerate",
        node_type: "input",
        type: "submit",
        value: "true",
      },
      group: "lookup_secret",
      messages: [],
      meta: {
        label: {
          id: 1050008,
          text: "Generate new backup recovery codes",
          type: "info",
        },
      },
      type: "input",
    },
    {
      attributes: {
        height: 256,
        id: "totp_qr",
        node_type: "img",
        src: "data:image/png;base64,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",
        width: 256,
      },
      group: "totp",
      messages: [],
      meta: {
        label: {
          id: 1050005,
          text: "Authenticator app QR code",
          type: "info",
        },
      },
      type: "img",
    },
    {
      attributes: {
        id: "totp_secret_key",
        node_type: "text",
        text: {
          context: {
            secret: "FV5ITDUM6UEK4ENFIH2LGGWREOYI3MXD",
          },
          id: 1050006,
          text: "FV5ITDUM6UEK4ENFIH2LGGWREOYI3MXD",
          type: "info",
        },
      },
      group: "totp",
      messages: [],
      meta: {
        label: {
          id: 1050017,
          text: "This is your authenticator app secret. Use it if you can not scan the QR code.",
          type: "info",
        },
      },
      type: "text",
    },
    {
      attributes: {
        disabled: false,
        name: "totp_code",
        node_type: "input",
        required: true,
        type: "text",
      },
      group: "totp",
      messages: [],
      meta: {
        label: {
          id: 1070006,
          text: "Verify code",
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
          id: 1070003,
          text: "Save",
          type: "info",
        },
      },
      type: "input",
    },
  ],
};
