const BranchInfo = require('./base');
const VersionInfo = require('../version');
const template = require('lodash/template');
const defaultConfig = require('../default-config');

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

  buildPrerelease(releaseBranchCommitsCount)
  {
    const tmp = this.config.get('prerelease.release', defaultConfig.prerelease.release);
    return template(tmp)({ releaseBranchCommitsCount });
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
                  prerelease: this.buildPrerelease(commitsCount)
                }))
              })));
  }
}

module.exports = ReleaseBranchInfo;
