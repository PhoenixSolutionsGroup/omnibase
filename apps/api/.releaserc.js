module.exports = {
  branches: ['main'],
  tagFormat: 'api-v${version}',
  plugins: [
    // Analyze commits to determine version bump
    ['@semantic-release/commit-analyzer', {
      preset: 'angular',
      releaseRules: [
        { type: 'feat', release: 'minor' },
        { type: 'fix', release: 'patch' },
        { type: 'perf', release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { breaking: true, release: 'major' }
      ]
    }],

    // Generate release notes
    '@semantic-release/release-notes-generator',

    // Update changelog
    ['@semantic-release/changelog', {
      changelogFile: 'CHANGELOG.md'
    }],

    // Run prepare and publish scripts
    ['@semantic-release/exec', {
      prepareCmd: '../../scripts/release-api-prepare.sh ${nextRelease.version}',
      publishCmd: '../../scripts/release-api-publish.sh ${nextRelease.version}'
    }],

    // Commit changes back to repo
    ['@semantic-release/git', {
      assets: [
        'CHANGELOG.md',
        'docs/info.yaml',
        'docs/openapi.yaml'
      ],
      message: 'chore(api): release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
    }],

    // Create GitHub release
    '@semantic-release/github'
  ]
};
