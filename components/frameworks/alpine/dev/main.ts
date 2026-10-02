import Alpine from "alpinejs";
import template from "../src/role-creator/role-creator.html?raw";
import {
  buildPermissionString,
  EMPTY_OPEN_GROUPS,
  EMPTY_PERMISSIONS,
  formatRelation,
  groupPermissions,
  toGroupList,
} from "../src/role-creator/role-creator.helpers";
import {
  mockEnrichedDefinitions,
  mockNamespaceMap,
  mockRoles,
} from "@omnibase/mitosis-storybook/mock-data";
import "@omnibase/mitosis-storybook/styles.css";

const globals = globalThis as Record<string, unknown>;

Object.assign(globals, {
  Alpine,
  EMPTY_OPEN_GROUPS,
  EMPTY_PERMISSIONS,
  buildPermissionString,
  formatRelation,
  groupPermissions,
  toGroupList,
  props: {
    definitions: mockEnrichedDefinitions,
    roles: mockRoles,
    namespaceMap: mockNamespaceMap,
    onRoleCreate: (roleData: { role_name: string; permissions: string[] }) => {
      console.log("Creating role:", roleData);
    },
    onRoleUpdate: (roleData: {
      role_id: string;
      role_name: string;
      permissions: string[];
    }) => {
      console.log("Updating role:", roleData);
    },
  },
});

const scriptPattern = /<script>([\s\S]*?)<\/script>/;
const script = scriptPattern.exec(template);
const markup = template.replace(scriptPattern, "");

const app = document.getElementById("app");
if (app) {
  app.innerHTML = markup;
}

if (script) {
  new Function(script[1])();
}

Alpine.start();
