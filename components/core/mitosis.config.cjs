/**
 * @type {import('@builder.io/mitosis').MitosisConfig}
 */
module.exports = {
  files: "src/**",
  targets: [
    "react",
    "preact",
    "vue",
    "svelte",
    "solid",
    "angular",
    "alpine",
    "reactNative",
    "swift",
  ],
  dest: "../frameworks",
  commonOptions: {
    typescript: true,
  },
  options: {
    react: {
      typescript: true,
      stylesType: "style-tag",
    },
    preact: {
      typescript: true,
      stylesType: "style-tag",
    },
    vue: {
      typescript: true,
    },
    svelte: {
      typescript: true,
    },
    solid: {
      typescript: true,
      state: "signals",
      stylesType: "style-tag",
    },
    angular: {
      typescript: true,
      standalone: true,
      api: "signals",
      defaultExportComponents: true,
    },
    alpine: {
      typescript: false,
      useShorthandSyntax: true,
    },
    reactNative: {
      typescript: true,
      stylesType: "react-native",
      stateType: "useState",
    },
    swift: {
      includeTypes: true,
      includePreview: true,
    },
  },
};
