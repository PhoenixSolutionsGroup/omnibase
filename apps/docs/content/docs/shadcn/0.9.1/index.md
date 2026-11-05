---
title: "shadcn"
---

# @omnibase/shadcn

Prebuilt React components for OmniBase, built on [shadcn/ui](https://ui.shadcn.com) and [Radix UI](https://www.radix-ui.com). Drop in auth forms, tenant/role management, pricing tables, and permission pickers without scaffolding the UI yourself.

## Install

```bash
bun add @omnibase/shadcn
# or
npm install @omnibase/shadcn
```

`react` and `react-dom` (v19) are peer dependencies.

## Required shadcn/ui components

You do **not** run `shadcn add` for any primitive used by this package. The package bundles its own copies of the shadcn/ui primitives, so they are resolved from inside `@omnibase/shadcn` rather than from your app's `components/ui` directory.

Bundled primitives:

| Primitive | Used by |
| --- | --- |
| `alert` | auth error form |
| `avatar` | `UserViewer` |
| `button` | all components |
| `card` | all components |
| `checkbox` | `PermissionsSelectorTree` |
| `collapsible` | `PermissionsSelectorTree` (groups/subgroups) |
| `command` | `PermissionsSelector` (combobox) |
| `dialog` | `command` |
| `input` | forms, `RoleCreator` |
| `label` | forms, `RoleCreator` |
| `popover` | `PermissionsSelector` |
| `select` | `TenantSwitcher`, `UserViewer`, `PermissionsSelectorTree` |
| `separator` | `RoleCreator` |
| `table` | `UserViewer` |

The Radix and utility runtime dependencies (`@radix-ui/react-*`, `cmdk`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`) are declared by the package and installed automatically.

## Styling (required)

The package ships no compiled CSS beyond class names. Without the setup below the components render unstyled, which is the usual cause of a "broken" or "funky" look. This is a wiring problem, not a missing-component problem.

### 1. Provide the shadcn theme tokens

The components reference semantic tokens (`--background`, `--foreground`, `--primary`, `--border`, ...) through the `@theme inline` mapping. If your app already uses shadcn/ui you have them. Otherwise reuse the package theme:

```css
@import "@omnibase/shadcn/index.css";
```

### 2. Scan the package output with Tailwind

Tailwind does not scan `node_modules` by default, so the utility classes used inside the bundled components are not generated unless you point `@source` at the package build. Add it to your global stylesheet:

```css
@source "../node_modules/@omnibase/shadcn/dist";
```

The path is relative to the CSS file, and it must point at the real install location. In a hoisted monorepo the package usually lives at the workspace root, not in the app's own `node_modules`. For example, this package is hoisted to `<repo>/node_modules`, so from `apps/dashboard/src/app/globals.css` the correct path is:

```css
@source "../../../../node_modules/@omnibase/shadcn/dist";
```

### 3. Verify the path resolves

If the `@source` path does not exist, Tailwind silently skips it and only classes unique to these components go missing, producing a partially styled UI. Confirm the resolved directory exists before debugging anything else.

## Usage

```tsx
import { RoleCreator } from "@omnibase/shadcn";

<RoleCreator
  definitions={definitions}
  roles={roles}
  namespaceMap={namespaceMap}
  onRoleCreate={createRole}
  onRoleUpdate={updateRole}
/>;
```

`RoleCreator` takes an optional `selector` prop to choose the permission picker: `"tree"` (default) or `"rows"`. `RoleCreatorTree` and `RoleCreatorRows` are wrappers that pin the mode.

## Components

| Export | Description |
| --- | --- |
| `LoginForm`, `RegistrationForm`, `VerificationForm`, `RecoveryForm`, `SettingsForm`, `ErrorForm` | Auth and account forms |
| `TenantCreator`, `TenantSwitcher` | Tenant management |
| `UserInvite`, `UserViewer` | People management |
| `RoleCreator`, `RoleCreatorTree`, `RoleCreatorRows` | Role creation and editing |
| `PermissionsSelector`, `PermissionsSelectorTree` | Standalone permission pickers |
| `PricingTable` | Stripe-backed pricing |
