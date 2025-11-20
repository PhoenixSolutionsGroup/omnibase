export const mockRegistrationOIDCGoogleFlow = {
  action:
    "http://127.0.0.1:3000/self-service/registration?flow=75521368-0d20-4cdb-be29-8e804be91867",
  method: "POST",
  nodes: [
    {
      attributes: {
        disabled: false,
        name: "provider",
        node_type: "input",
        type: "submit",
        value: "google",
      },
      group: "oidc",
      messages: [],
      meta: {
        label: {
          context: {
            provider: "google",
          },
          id: 1040002,
          text: "Sign up with google",
          type: "info",
        },
      },
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
        value: "phoenix@phoenixsolutions.com.au",
      },
      group: "default",
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
        value: "Phoenix",
      },
      group: "default",
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
        value: "Van Urk",
      },
      group: "default",
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
        name: "csrf_token",
        node_type: "input",
        required: true,
        type: "hidden",
        value:
          "Do5odY/UjvAVwBgKiKfpsYpEtXCHLHDkCVa1uso4bOUd2YUhtmfRrpMWIzUY6zTdV1S8Nysojzw/WcDsU7PQew==",
      },
      group: "default",
      messages: [],
      meta: {},
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
          id: 1040001,
          text: "Sign up",
          type: "info",
        },
      },
      type: "input",
    },
  ],
};
