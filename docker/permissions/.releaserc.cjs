module.exports = {
	branches: ["main"],
	// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
	tagFormat: "permissions-v${version}",
	plugins: [
		[
			"semantic-release-commit-filter",
			{
				filterPaths: ["docker/permissions", "apps/api/permissions"],
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
				publishCmd:
					// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
					"DOCKER_BUILD_CONTEXT=../.. DOCKERFILE=Dockerfile ../../scripts/release-docker.sh ${nextRelease.version}",
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md"],
				// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release expands this placeholder
				message: "chore(permissions): release ${nextRelease.version} [skip ci]",
			},
		],
		"@semantic-release/github",
	],
};
