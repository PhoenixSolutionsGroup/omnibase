module.exports = {
  branches: ['main'],
  tagFormat: 'api-v${version}',
  plugins: [
    // Filter commits to only those affecting this package
    ['semantic-release-commit-filter', {
      filterPaths: ['apps/api']
    }],
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
      publishCmd: '../../scripts/release-api-publish.sh ${nextRelease.version}',
      successCmd: '../../scripts/sync-docker-compose.sh api ${nextRelease.version}'
    }],

    // Commit changes back to repo
    // Note: SDK files are staged in release-api-prepare.sh since ../../ glob patterns don't work
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
