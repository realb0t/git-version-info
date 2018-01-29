const BranchInfo = require('./base-branch');

class MasterBranchInfo extends BranchInfo
{
  definePrerelease(packageVersion)
  {
    return Promise.resolve(packageVersion);
  }
}

module.exports = MasterBranchInfo;
