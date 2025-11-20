export const mockRegistrationFirstFlow = {
  action:
    "http://127.0.0.1:3000/self-service/registration?flow=96b9b59c-2390-4be1-b018-b3a9e36a2624",
  method: "POST",
  nodes: [
    {
      attributes: {
        autocomplete: "email",
        disabled: false,
        name: "traits.email",
        node_type: "input",
        required: true,
        type: "email",
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
          "3lmDfTvHtY/dzLiDDAuaXD83f6MCL6aeypDXggNKq8uSn2LIttstPqkFFJAZLAz0wAJc1Y/MxQdzSNIXU09upQ==",
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
