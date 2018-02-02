const BranchInfo = require('./base');
const VersionInfo = require('../version');

class MasterBranchInfo extends BranchInfo
{
  calculateVersion(packageVersion)
  {
    return Promise.resolve(new VersionInfo(packageVersion));
  }
}

module.exports = MasterBranchInfo;
