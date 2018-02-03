const Version = require('../version');

const refNamePrefix = 'refs/heads/';
const developBranchRefName = refNamePrefix + 'develop';
const masterBranchRefName = refNamePrefix + 'master';

class BranchInfo
{
  constructor(ref, repo, config)
  {
    this.config = config;
    this.ref = ref;
    this.repo = repo;
    this.refName = ref.name();
    this.name = this.refName.replace('refs/heads/', '');
  }

  calculateVersion(packageVersion)
  {
    return Promise.reject(new Error('Not define prerelease calc mechanic'));
  }

  getDevelopBranchReference()
  {
    return this.repo.getReference(developBranchRefName);
  }

  getMasterBranchReference()
  {
    return this.repo.getReference(masterBranchRefName);
  }

  getDevelopBranchCommit()
  {
    return this.getDevelopBranchReference()
      .then(ref => this.repo.getReferenceCommit(ref));
  }

  getMasterBranchCommit()
  {
    return this.getMasterBranchReference()
      .then(ref => this.repo.getReferenceCommit(ref));
  }

  getCurrentReference()
  {
    return Promise.resolve(this.ref);
  }

  getCurrentReferenceCommit()
  {
    return this.repo.getReferenceCommit(this.ref)
  }

  findLastCommonCommit(targetBranchCommit, otherBranchCommit)
  {
    return new Promise((searchCommitResolve, searchCommitReject) =>
    {
      const targetHistory = targetBranchCommit.history();
      const otherHistory = otherBranchCommit.history();
      const getHistoryReader = (history) => (
        new Promise((readAllHistory) =>
        {
          history.on('end', readAllHistory);
          history.on('error', searchCommitReject);
        })
      );

      const targetHistoryReader = getHistoryReader(targetHistory);
      const otherHistoryReader = getHistoryReader(otherHistory);

      targetHistory.start();
      otherHistory.start();

      Promise.all([ targetHistoryReader, otherHistoryReader ])
        .then(([ targetBranchCommits, otherBranchCommits ]) =>
        {
          const targetBranchHashes = targetBranchCommits.map(commit => commit.sha());
          const otherBranchHashes = otherBranchCommits.map(commit => commit.sha());

          const longHistory = (targetBranchHashes.length > otherBranchHashes.length)
            ? targetBranchHashes : otherBranchHashes;
          const shortHistory = (targetBranchHashes.length < otherBranchHashes.length)
            ? targetBranchHashes : otherBranchHashes;

          const firstJointShaFromTheEnd = longHistory.find(longSha =>
            shortHistory.indexOf(longSha) !== -1);

          if (typeof firstJointShaFromTheEnd === 'undefined')
          {
            searchCommitReject(new Error('Not found joint commit'));
          }

          const lastJointSha = firstJointShaFromTheEnd;
          searchCommitResolve(lastJointSha);
        });
    });
  }

  getCommitsCountFrom(targetCommitSha)
  {
    return new Promise((resolve, reject) =>
    {
      this.repo.getReferenceCommit(this.ref)
        .catch(reject)
        .then(refCommit =>
        {
          const history = refCommit.history();
          let count = 0;

          history.on('commit', commit =>
          {
            if (commit.sha() === targetCommitSha)
            {
              resolve(count);
            }
            count += 1;
          });

          history.on('end', () =>
          {
            if (count !== 0)
            {
              reject(new Error(`Not found commit ${targetCommitSha}`));
            }
          });

          history.on('error', reject);
          history.start();
        });
    });
  }
}

BranchInfo.refNamePrefix = refNamePrefix;
BranchInfo.developBranchRefName = developBranchRefName;
BranchInfo.masterBranchRefName = masterBranchRefName;

module.exports = BranchInfo;
