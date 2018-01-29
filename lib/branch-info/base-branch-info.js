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
    return Promise.resolve(packageVersion);
  }
}

module.exports = BranchInfo;
