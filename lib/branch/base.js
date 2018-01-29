const Version = require('../version');

class BranchInfo
{
  constructor(ref, repo)
  {
    this.ref = ref;
    this.repo = repo;
    this.refName = ref.name();
    this.name = this.refName.replace('refs/heads/', '');
  }

  definePrerelease(packageVersion)
  {
    return Promise.resolve(new Version(packageVersion));
  }
}

module.exports = BranchInfo;
