# git-version-info

This library is intended for define semantic version of package by the git environment.
It's inspired by [GitFlow](http://nvie.com/posts/a-successful-git-branching-model/), [SemVer 2.0.0](https://semver.org/), [GitVersion](https://gitversion.readthedocs.io/en/latest/).

Base agreements:

* The stable versions of the package are announced by the developer in **master** branches
* Unstable versions of the package **could be** computed by the git environment
* Development **should be** carried out within the framework of the [GitFlow](http://nvie.com/posts/a-successful-git-branching-model/),
and package versions **should be** based on [SemVer 2.0.0](https://semver.org/).

In order to CI server can publish the package as _unstable_ (_prerelease_) and _stable_ version.
For definition to be performed correctly, it is necessary to observe **GitFlow** branching model.

This definition available for following branches:

* **master** - package version remains as is `X.Y.Z`
* **develop** - to package version is `X.(Y+1).0-alpha.{commits}`
* **feature/*** - to package version is `X.(Y+1).0-feature-{hash}.{commits}`
* **release/vX'.Y'.Z' - to package version is `X'.Y'.Z'-rc.{commits}`
* **hotfix/*** - to package version is `X.Y.(Z+1)-beta.{commits}`

`X` - current major version declarate in package.json

`Y` - current minor version declarate in package.json

`Z` - current patch version declarate in package.json

`{hash}` - it's first feature branch commit (generic commit from develop and feature branch)

`{commits}` - quantity commits from branch start.

## Example

The final semantic version of the package looks like:

```
<major>.<minor>.<patch>-<prerelease>+<build-number>
```

For example for branch `feature/feature-long-name` and package main version `1.2.3`,
it's prerelease version looks like:

```
1.2.3-feature-3kn3erb.13+42
```

## Install

```
$ npm i git-version-info -g
```

## Usage


In package directory (where placed file **package.json**) run:
```
$ git-version-info --help
```

Output:
```
Usage: git-version-info [options] [cwd]


Options:

  -v, --version   output the version number
  -j, --json      output as JSON
  -t, --teamcity  output for TeamCity as service message
  -w, --write     write version into package.json
  -h, --help      output usage information
```
