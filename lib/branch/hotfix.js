const BranchInfo = require('./base');

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

  buildPrerelease(hotfixCommitsCount)
  {
    return `beta.${hotfixCommitsCount}`
  }

  definePrerelease(packageVersionInfo)
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
                  patch: (elements.patch + 1),
                  prerelease: this.buildPrerelease(commitsCount)
                }))
              })));
  }
}

module.exports = HotfixBranchInfo;
