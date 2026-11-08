module.exports = {
  branches: ['main'],
  tagFormat: 'permissions-v${version}',
  plugins: [
    ['semantic-release-commit-filter', {
      filterPaths: ['docker/permissions']
    }],
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
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    ['@semantic-release/exec', {
      publishCmd: '../../scripts/release-docker.sh ${nextRelease.version}'
    }],
    ['@semantic-release/git', {
      assets: ['CHANGELOG.md'],
      message: 'chore(permissions): release ${nextRelease.version} [skip ci]'
    }],
    '@semantic-release/github'
  ]
};
