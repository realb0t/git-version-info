const BranchInfo = require('./base-branch');

class ReleaseBranchInfo extends BranchInfo
{
  // Вычисляет последний схожий коммит между ветками develop и release/*
  // и возвращает количество коммитов в release/* после него
  getCountReleaseCommits(repo, developRef, releaseRef)
  {

  }

  getPackageVersionByBranch()
  {
    const regexp = /^.+\/v*(\d+\.\d+\.\d+)$/;
    const version = this.name.replace(regexp, '$1');
    return new PackageVersion(version);
  }

  definePrerelease(packageVersion)
  {
    return Promise.resolve(packageVersion);
  }
}

module.exports = ReleaseBranchInfo;
