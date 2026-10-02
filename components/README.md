# OmniBase Mitosis Components

A single Mitosis source in `core/` is compiled to many frameworks under
`frameworks/`. A composed Storybook in `storybook/` previews every framework
that has a Storybook renderer.

## Layout

- `core/` — Mitosis source and `mitosis.config.cjs` (source of truth). `bun run build` regenerates every target.
- `frameworks/<target>/` — generated output, plus a per-framework Storybook where a renderer exists.
- `storybook/` — host Storybook (composition) and shared mock data/styles. `bun run dev` starts the refs and the host.

## Storybook coverage

| Mitosis target | Output | Storybook renderer | Port |
| --- | --- | --- | --- |
| `react` | `frameworks/react` | `@storybook/react-vite` | 6008 |
| `vue` | `frameworks/vue` | `@storybook/vue3-vite` | 6009 |
| `svelte` | `frameworks/svelte` | `@storybook/svelte-vite` | 6010 |
| `preact` | `frameworks/preact` | `@storybook/preact-vite` | 6011 |
| `solid` | `frameworks/solid` | `storybook-solidjs-vite` | 6012 |
| `angular` | `frameworks/angular` | `@storybook/angular-vite` | 6013 |
| `alpine` | `frameworks/alpine` | none | — |
| `reactNative` | `frameworks/react-native` | none | — |
| `swift` | `frameworks/swift` | none | — |

The host Storybook at http://localhost:6007 composes React, Vue, Svelte, Preact,
Solid, and Angular.

### Not QA-able in Storybook

The following targets have **no Storybook renderer** and therefore cannot be
visually QA'd in the composed Storybook:

- **Alpine** (`frameworks/alpine`) — HTML template with Alpine.js directives. There is a standalone Vite dev app at `frameworks/alpine` (`bun run dev`, port 5176), but it is not part of the composed Storybook.
- **React Native** (`frameworks/react-native`) — requires a React Native runtime (device/emulator, or `react-native-web`).
- **Swift** (`frameworks/swift`) — SwiftUI view; requires Xcode.

Every other target is previewable through its framework Storybook.
