const BranchInfo = require('./base');
const template = require('lodash/template');
const defaultConfig = require('../default-config');

class DevelopBranchInfo extends BranchInfo
{
  getDevelopFirstCommit()
  {
    return new Promise((resolve, reject) =>
      this.getMasterBranchCommit()
        .catch(reject)
        .then(featureCommit =>
          this.getDevelopBranchCommit()
            .catch(reject)
            .then(developCommit =>
              this.findLastCommonCommit(featureCommit, developCommit)
                .catch(reject)
                .then(resolve))));
  }

  buildPrerelease(developBranchCommitsCount)
  {
    const tmp = this.config.get('prerelease.develop', defaultConfig.prerelease.develop);
    return template(tmp)({ developBranchCommitsCount });
  }

  calculateVersion(packageVersionInfo)
  {
    return new Promise((resolve, reject) =>
      this.getDevelopFirstCommit()
        .catch(reject)
        .then(developCommitSha =>
          this.getCommitsCountFrom(developCommitSha)
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

module.exports = DevelopBranchInfo;
