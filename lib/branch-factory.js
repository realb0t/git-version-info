const BranchInfo = require('./branch/base');
const MasterBranchInfo = require('./branch/master');
const DevelopBranchInfo = require('./branch/develop');
const ReleaseBranchInfo = require('./branch/release');
const HotfixBranchInfo = require('./branch/hotfix');
const FeatureBranchInfo = require('./branch/feature');

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
