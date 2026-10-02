<script setup lang="ts">
import { RoleCreatorTree } from "../src";
import {
  mockEnrichedDefinitions,
  mockNamespaceMap,
  mockRoles,
} from "@omnibase/mitosis-storybook/mock-data";

function onRoleCreate(data: { role_name: string; permissions: string[] }) {
  alert(`Creating role: ${data.role_name}\n${data.permissions.join(", ")}`);
}

function onRoleUpdate(data: {
  role_id: string;
  role_name: string;
  permissions: string[];
}) {
  alert(
    `Updating role: ${data.role_name} (${data.role_id})\n${data.permissions.join(
      ", "
    )}`
  );
}
</script>

<template>
  <main class="mx-auto max-w-5xl p-8">
    <RoleCreatorTree
      :definitions="mockEnrichedDefinitions"
      :roles="mockRoles"
      :namespace-map="mockNamespaceMap"
      :on-role-create="onRoleCreate"
      :on-role-update="onRoleUpdate"
    />
  </main>
</template>
