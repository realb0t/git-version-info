const BranchInfo = require('./base');
const template = require('lodash/template');
const defaultConfig = require('../default-config');

class HotfixBranchInfo extends BranchInfo
{
  getHotfixFirstCommit()
  {
    return new Promise((resolve, reject) =>
      this.getCurrentReferenceCommit()
        .catch(reject)
        .then(featureCommit =>
          this.getMasterBranchCommit()
            .catch(reject)
            .then(developCommit =>
              this.findLastCommonCommit(featureCommit, developCommit)
                .catch(reject)
                .then(resolve))));
  }

  buildPrerelease(hotfixBranchCommitsCount)
  {
    const tmp = this.config.get('prerelease.hotfix', defaultConfig.prerelease.hotfix);
    return template(tmp)({ hotfixBranchCommitsCount });
  }

  calculateVersion(packageVersionInfo)
  {
    return new Promise((resolve, reject) =>
      this.getHotfixFirstCommit()
        .catch(reject)
        .then(hotfixCommitSha =>
          this.getCommitsCountFrom(hotfixCommitSha)
            .catch(reject)
            .then(commitsCount =>
              {
                const elements = packageVersionInfo.getElements();
                resolve(new VersionInfo({
                  ...elements,
                  patch: (+elements.patch + 1),
                  prerelease: this.buildPrerelease(commitsCount)
                }))
              })));
  }
}

module.exports = HotfixBranchInfo;
