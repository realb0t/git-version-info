const BranchInfo = require('./branch-info/base-branch-info');
const MasterBranchInfo = require('./branch-info/master-branch-info');
const DevelopBranchInfo = require('./branch-info/develop-branch-info');
const ReleaseBranchInfo = require('./branch-info/release-branch-info');
const HotfixBranchInfo = require('./branch-info/hotfix-branch-info');
const FeatureBranchInfo = require('./branch-info/feature-branch-info');

function branchInfoFactory(repo)
{
  return repo.getCurrentBranch().then(ref =>
    {
      const branchInfo = new BranchInfo(ref, repo);
      const branchName = branchInfo.name;

      switch (true)
      {
        case (branchName === 'master'):
          return new MasterBranchInfo(ref, repo);

        case (branchName === 'develop'):
          return new DevelopBranchInfo(ref, repo);

        case ((/^release\/.*$/).test(branchName)):
          return new ReleaseBranchInfo(ref, repo);

        case ((/^hotfix\/.*$/).test(branchName)):
          return new HotfixBranchInfo(ref, repo);

        case ((/^feature\/.*$/).test(branchName)):
          return new FeatureBranchInfo(ref, repo);

        default:
          throw(new Error('Unsupported branch'));
      };
    });
}

module.exports = branchInfoFactory;
