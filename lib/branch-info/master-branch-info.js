const BranchInfo = require('./base-branch-info');

class MasterBranchInfo extends BranchInfo
{
  definePrerelease(packageVersion)
  {
    return Promise.resolve(packageVersion);
  }
}

module.exports = MasterBranchInfo;
