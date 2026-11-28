module.exports = {
	branches: ["main"],
	// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
	tagFormat: "mcp-server-v${version}",
	plugins: [
		[
			"semantic-release-commit-filter",
			{
				filterPaths: ["packages/mcp-server", "apps/docs/content"],
			},
		],
		[
			"@semantic-release/commit-analyzer",
			{
				preset: "angular",
				releaseRules: [
					{ type: "feat", release: "minor" },
					{ type: "fix", release: "patch" },
					{ type: "docs", release: "patch" },
					{ type: "refactor", release: "patch" },
					{ breaking: true, release: "minor" },
				],
			},
		],
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/exec",
			{
				prepareCmd:
					// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
					"npm pkg set version=${nextRelease.version} && npm run build",
				publishCmd: "npm publish --access public",
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["package.json"],
				// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
				message: "chore(mcp-server): release ${nextRelease.version} [skip ci]",
			},
		],
		"@semantic-release/github",
	],
};
