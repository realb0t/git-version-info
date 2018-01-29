const git = require('nodegit');
const fs = require('fs');

const Package = require('./package');
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
      Package.open(this.workDir).then(packageInfo =>
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
        const packageVersion = packageInfo.getVersionInfo();
        branch.definePrerelease(packageVersion).then(prereleaseVersion =>
        {
          resolveVersionInfo({
            version: prereleaseVersion,
            package: packageInfo
          });
        });
      });
    });
  }
}

module.exports = GitVersionInfo;
