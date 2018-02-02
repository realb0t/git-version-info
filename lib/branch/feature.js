const BranchInfo = require('./base');
const VersionInfo = require('../version');

class FeatureBranchInfo extends BranchInfo
{
  getFeatureCommit()
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
      this.getFeatureCommit()
        .catch(reject)
        .then(featureCommitSha =>
          this.getCommitsCount(featureCommitSha)
            .catch(reject)
            .then(commitsCount =>
              resolve(new VersionInfo({
                ...packageVersionInfo.getElements(),
                prerelease: this.buildPrerelease(featureCommitSha, commitsCount)
              }))
            )));
  }
}

module.exports = FeatureBranchInfo;
