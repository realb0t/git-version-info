# git-version-info

This library calculate prerelease package version from the Git repository ([GitVersion](https://gitversion.readthedocs.io/en/latest/)).

In order to CI server can publish the package as _unstable version_ package.
For calculations to be performed correctly, it is necessary to observe **GitFlow**.

This calculation available for following branches:

* **master** - package version remains as is
* **develop** - to package version will be added prerelease part ```-alpha.{commits}```
* **feature/*** - to package version will be added prerelease part ```-feature-{hash}.{commits}```
* **release/*** - to package version will be added prerelease part ```-rc-{hash}.{commits}```
* **hotfix/*** - to package version will be added prerelease part ```-beta-{hash}.{commits}```


### Install

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
Usage: git-version-info [options]


Options:

  -V, --version   output the version number for git-version-info
  -j, --json      output as JSON
  -t, --teamcity  output for TeamCity as service message
  -w, --write     write version into package.json
  -h, --help      output usage information
```
