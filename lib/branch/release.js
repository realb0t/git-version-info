const BranchInfo = require('./base');
const VersionInfo = require('../version');

class ReleaseBranchInfo extends BranchInfo
{
  getReleaseFirstCommit()
  {
    return new Promise((resolve, reject) =>
      this.getCurrentReferenceCommit()
        .catch(reject)
        .then(featureCommit =>
          this.getDevelopBranchCommit()
            .catch(reject)
            .then(developCommit =>
              this.findLastCommonCommit(featureCommit, developCommit)
                .catch(reject)
                .then(resolve))));
  }

  getPackageVersionByBranch()
  {
    const regexp = /^.+\/v*(\d+\.\d+\.\d+)$/;
    const version = this.name.replace(regexp, '$1');
    return new VersionInfo(version);
  }

  buildPrerelease(releaseCommitsCount)
  {
    return `rc.${releaseCommitsCount}`
  }

  calculateVersion(packageVersionInfo)
  {
    return new Promise((resolve, reject) =>
      this.getReleaseFirstCommit()
        .catch(reject)
        .then(releaseCommitSha =>
          this.getCommitsCountFrom(releaseCommitSha)
            .catch(reject)
            .then(commitsCount =>
              {
                const elements = this.getPackageVersionByBranch();
                resolve(new VersionInfo({
                  ...elements,
                  minor: (+elements.minor + 1),
                  patch: 0,
                  prerelease: this.buildPrerelease(commitsCount)
                }))
              })));
  }
}

module.exports = ReleaseBranchInfo;
