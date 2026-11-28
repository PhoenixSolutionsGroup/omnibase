module.exports = {
	branches: ["main"],
	// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
	tagFormat: "react-v${version}",
	plugins: [
		[
			"semantic-release-commit-filter",
			{
				filterPaths: ["sdk/framework/react"],
			},
		],
		[
			"@semantic-release/commit-analyzer",
			{
				preset: "angular",
				releaseRules: [
					{ type: "feat", release: "minor" },
					{ type: "fix", release: "patch" },
					{ type: "perf", release: "patch" },
					{ type: "refactor", release: "patch" },
					{ breaking: true, release: "major" },
				],
			},
		],
		"@semantic-release/release-notes-generator",
		["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
		[
			"@semantic-release/exec",
			{
				prepareCmd:
					// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
					"npm pkg set version=${nextRelease.version} && ../../../scripts/stamp-core-js-version.sh && bun run build",
				publishCmd:
					'find dist -name "*.d.ts" | grep -q . || (echo "ERROR: No .d.ts files" && exit 1) && bun pm pack && npm publish *.tgz --access public && rm *.tgz',
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md", "package.json"],
				// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
				message: "chore(react): release ${nextRelease.version} [skip ci]",
			},
		],
		"@semantic-release/github",
	],
};
