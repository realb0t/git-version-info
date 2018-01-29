const BranchInfo = require('./base');

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
}

module.exports = ReleaseBranchInfo;
