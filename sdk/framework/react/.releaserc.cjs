module.exports = {
  branches: ['main'],
  tagFormat: 'react-v${version}',
  plugins: [
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
      prepareCmd: 'npm pkg set version=${nextRelease.version}',
      publishCmd: 'bun pm pack && npm publish *.tgz --provenance --access public && rm *.tgz'
    }],
    ['@semantic-release/git', {
      assets: ['CHANGELOG.md', 'package.json'],
      message: 'chore(react): release ${nextRelease.version} [skip ci]'
    }],
    '@semantic-release/github'
  ]
};
