const git = require('nodegit');
const fs = require('fs');

const PackageInfo = require('./package-info');
const branchFactory = require('./branch-factory');

class GitVersionInfo
{
  constructor(workDir)
  {
    this.workDir = workDir;
  }

  getEnvironment()
  {
    return new Promise((resolve, reject) =>
    {
      PackageInfo.open(this.workDir).then(packageInfo =>
      {
        git.Repository.open(this.workDir).then(repo =>
        {
          branchFactory(repo).then(branch => {
            resolve({ packageInfo, repo, branch })
          });
        });
      });
    });
  }

  getVersionInfo()
  {
    return new Promise((resolveVersionInfo, rejectVersionInfo) =>
    {
      this.getEnvironment().then(({ packageInfo, repo, branch }) =>
      {
        const packageVersion = packageInfo.getVersion();
        branch.calculateVersion(packageVersion).then(calculatedVersion =>
        {
          resolveVersionInfo({
            version: calculatedVersion,
            package: packageInfo
          });
        });
      });
    });
  }
}

module.exports = GitVersionInfo;
