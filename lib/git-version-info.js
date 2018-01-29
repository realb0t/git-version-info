const git = require('nodegit');
const fs = require('fs');

const VersionInfo = require('./version');
const OutputInfo = require('./output');
const PackageInfo = require('./package');
const branchInfoFactory = require('./branch-factory');

class GitVersionInfo
{
  constructor(workDir)
  {
    this.workDir = workDir;
  }

  getPackageInfo()
  {
    return PackageInfo.open(this.workDir);
  }

  getRepository()
  {
    return git.Repository.open(this.workDir);
  }

  getEnvironmentInfo()
  {
    return new Promise((resolveVersionInfo, rejectVersionInfo) =>
    {
      this.getPackageInfo()
        .then(packageInfo =>
        {
          this.getRepository()
            .then(function(repo)
            {
              branchInfoFactory(repo)
                .then(branchInfo =>
                {
                  const currentPackageVersion = packageInfo.getVersionInfo();
                  branchInfo.definePrerelease(currentPackageVersion)
                    .then(packageVersion =>
                    {
                      resolveVersionInfo({
                        version: packageVersion,
                        package: packageInfo
                      });
                    })
                })
            })
        })
    });
  }
}

module.exports = GitVersionInfo;
