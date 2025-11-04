export const mockLogin = {
  created_at: {},
  expires_at: {},
  id: "6381aca4-0817-439f-b61a-f63838e1fd8f",
  issued_at: {},
  refresh: false,
  request_url: "http://127.0.0.1:3000/self-service/login/browser",
  requested_aal: "aal1",
  state: "choose_method",
  type: "browser",
  ui: {
    action:
      "http://127.0.0.1:3000/self-service/login?flow=6381aca4-0817-439f-b61a-f63838e1fd8f",
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
            id: 1010002,
            text: "Sign in with google",
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
            "8NB/4ZQ7cyOOvSS46VMUm3lSTwCt91vsA1ahUrp74D6dR/jHYCpHiloyTb8rOdPK/JeuxJW76q0Te8vK6z8OmQ==",
        },
        group: "default",
        messages: [],
        meta: {},
        type: "input",
      },
      {
        attributes: {
          disabled: false,
          name: "identifier",
          node_type: "input",
          required: true,
          type: "text",
          value: "",
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
          autocomplete: "current-password",
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
            id: 1010001,
            text: "Sign in",
            type: "info",
          },
        },
        type: "input",
      },
    ],
  },
  updated_at: {},
};
