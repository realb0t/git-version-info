const BranchInfo = require('./base');
const VersionInfo = require('../version');

class FeatureBranchInfo extends BranchInfo
{
  getFeatureFirstCommit()
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

  buildPrerelease(firstFeatureCommitSha, featureBranchCommits)
  {
    return `feature-${firstFeatureCommitSha.slice(0, 7)}.${featureBranchCommits}`
  }

  definePrerelease(packageVersionInfo)
  {
    return new Promise((resolve, reject) =>
      this.getFeatureFirstCommit()
        .catch(reject)
        .then(featureFirstCommitSha =>
          this.getCommitsCountFrom(featureFirstCommitSha)
            .catch(reject)
            .then(commitsCount =>
              resolve(new VersionInfo({
                ...packageVersionInfo.getElements(),
                prerelease: this.buildPrerelease(featureFirstCommitSha, commitsCount)
              }))
            )));
  }
}

module.exports = FeatureBranchInfo;
