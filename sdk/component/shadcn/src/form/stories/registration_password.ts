export const mockRegistrationPasswordFlow = {
  action:
    "http://127.0.0.1:3000/self-service/registration?flow=96b9b59c-2390-4be1-b018-b3a9e36a2624",
  messages: [
    {
      id: 1040009,
      text: "Please choose a credential to authenticate yourself with.",
      type: "info",
    },
  ],
  method: "POST",
  nodes: [
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
    {
      attributes: {
        disabled: false,
        name: "traits.name.last",
        node_type: "input",
        type: "hidden",
        value: "Doe",
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
        value: "John",
      },
      group: "default",
      messages: [],
      meta: {},
      type: "input",
    },
    {
      attributes: {
        disabled: false,
        name: "traits.email",
        node_type: "input",
        type: "hidden",
        value: "Johndoe1098@gmail.com",
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
          "avLB+uTBUbGjf47poo3OqtAvT9OiLk99weeVXv3vqZQmNCBPad3JANe2Ivq3qlgCLxpspS/NLOR4P5DLreps+g==",
      },
      group: "default",
      messages: [],
      meta: {},
      type: "input",
    },
  ],
};
