# Release process

because I always forget how this stuff works

## First development snapshot

1. `npm version premajor|preminor|prepatch --preid=alpha` - increases the major|minor|patch version with a `-alpha.0` postfix
2. `git push --follow-tags`
3. `npm publish --tag alpha.0`

## Second and later development snapshots

1. `npm version prerelease --preid=alpha` - increases the number only in the `-alpha.0` postfix [1]
2. `git push --follow-tags`
3. `npm publish --tag alpha.0` <-- replace the `0` with the number you got from `npm version` in step 1

Tip: the current version can be printed out with this command: `node -p "require('./package.json').version"` [2]

## Installing a snapshot version

`npm i arx-level-generator@14.0.0-alpha.2`

## Release

1. `npm version major|minor|patch` - similarly to how it was done in the first development snapshot
2. `git push --follow-tags`
3. `npm publish`
4. Go to github and create a new release

## Sources

- [1] https://stackoverflow.com/a/51888437/1806628
- [2] https://stackoverflow.com/a/33628871/1806628
