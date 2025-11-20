export const mockRegistrationPasswordFlowError = {
  action:
    "http://127.0.0.1:3000/self-service/registration?flow=49a4cd57-17ce-4ad5-b06b-7ab698c442b3",
  method: "POST",
  nodes: [
    {
      attributes: {
        disabled: false,
        name: "traits.email",
        node_type: "input",
        type: "hidden",
        value: "phopweojfew@gmail.com",
      },
      group: "default",
      messages: [],
      meta: {},
      type: "input",
    },
    {
      attributes: {
        disabled: false,
        name: "traits.name.first",
        node_type: "input",
        type: "hidden",
        value: "Phoenix",
      },
      group: "default",
      messages: [],
      meta: {},
      type: "input",
    },
    {
      attributes: {
        disabled: false,
        name: "traits.name.last",
        node_type: "input",
        type: "hidden",
        value: "Baker",
      },
      group: "default",
      messages: [],
      meta: {},
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
          "A9nI4GatlxVNF35Ch4Fw1ZWrd3ubftHEL09FdaMhKCpaBC84CbvupuUcgm/YAN9C28aIn/WpYj6LhmACJUbMJQ==",
      },
      group: "default",
      messages: [],
      meta: {},
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
      messages: [
        {
          context: {
            min_length: 8,
            actual_length: 1,
          },
          id: 4000032,
          text: "The password must be at least 8 characters long, but got 1.",
          type: "error",
        },
      ],
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
          id: 1040001,
          text: "Sign up",
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
        value: "profile:back",
      },
      group: "profile",
      messages: [],
      meta: {
        label: {
          id: 1040008,
          text: "Back",
          type: "info",
        },
      },
      type: "input",
    },
  ],
};
