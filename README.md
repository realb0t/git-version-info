# git-version-info

This library calculate prerelease package version from the Git repository ([GitVersion](https://gitversion.readthedocs.io/en/latest/)).

In order to CI server can publish the package as _unstable version_ package.
For calculations to be performed correctly, it is necessary to observe **GitFlow**.

### Install

```
$ npm i git-version-info -g
```

## Usage

```
$ git-version-info --help
```

Output:

```
Usage: git-version-info [options]


Options:

  -V, --version   output the version number
  -j, --json      output as JSON
  -t, --teamcity  output for TeamCity as service message
  -w, --write     write version into package.json
  -h, --help      output usage information
```
