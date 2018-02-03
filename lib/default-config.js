module.exports = {
  prerelease: {
    develop: "alpha.${developBranchCommitsCount}",
    feature: "feature-${firstFeatureCommitSha}.${featureBranchCommitsCount}",
    hotfix: "beta.${hotfixBranchCommitsCount}",
    release: "rc.${releaseBranchCommitsCount}"
  }
};
