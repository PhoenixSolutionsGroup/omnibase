module.exports = {
	branches: ["main"],
	// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
	tagFormat: "auth-v${version}",
	plugins: [
		[
			"semantic-release-commit-filter",
			{
				filterPaths: ["docker/auth"],
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
				// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
				publishCmd: "../../scripts/release-docker.sh ${nextRelease.version}",
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md"],
				// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
				message: "chore(auth): release ${nextRelease.version} [skip ci]",
			},
		],
		"@semantic-release/github",
	],
};
