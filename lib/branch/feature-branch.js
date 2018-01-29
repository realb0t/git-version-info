const BranchInfo = require('./base-branch');
const VersionInfo = require('../version');

class FeatureBranchInfo extends BranchInfo
{
  getCommitsCount(targetCommitSha)
  {
    return new Promise((completeResolve, completeReject) =>
    {
      this.repo.getReferenceCommit(this.ref)
        .catch(completeReject)
        .then(refCommit =>
        {
          const history = refCommit.history();
          let count = 0;

          history.on('commit', (commit) =>
          {
            if (commit.sha() === targetCommitSha)
            {
              completeResolve(count);
            }
            count += 1;
          });
          history.on('end', function() {
            if (count !== 0)
            {
              completeReject(new Error(`Not found commit ${targetCommitSha}`));
            }
          });

          history.start();
        });
    });
  }

  getFeatureCommit()
  {
    return new Promise((completeResolve, completeReject) =>
    {
      this.repo.getReferenceCommit('refs/heads/develop')
        .catch(completeReject)
        .then(developCommit =>
        {
          this.repo.getReferenceCommit(this.ref)
            .catch(completeReject)
            .then(featureCommit =>
            {
              const developHistory = developCommit.history();
              const featureHistory = featureCommit.history();
              const developProm = new Promise((localResolve, reject) =>
              {
                developHistory.on('end', localResolve);
                developHistory.on('error', completeReject);
              });

              const featureProm = new Promise((localResolve, reject) =>
              {
                featureHistory.on('end', localResolve);
                featureHistory.on('error', completeReject);
              });

              developHistory.start();
              featureHistory.start();

              Promise.all([ developProm, featureProm ])
                .then(([ developCommits, featureCommits ]) =>
                {
                  const developHashes = developCommits.map(commit => commit.sha());
                  const featureHashes = featureCommits.map(commit => commit.sha());

                  let longHistory = featureHashes;
                  let shortHistory = developHashes;
                  if (developHashes.length > featureHashes.length)
                  {
                    longHistory = developHashes;
                    shortHistory = featureHashes;
                  }

                  const firstJointSha = longHistory.find(longSha =>
                    {
                      return shortHistory.indexOf(longSha) !== -1
                    });

                  completeResolve(firstJointSha);
                });
            });
        });
    });
  }

  definePrerelease(packageVersionInfo)
  {
    return new Promise((resolve, reject) => {
      this.getFeatureCommit().then(tagHash =>
      {
        const shortSha = tagHash.slice(0, 7);
        this.getCommitsCount(tagHash).then(count =>
        {
          resolve(new VersionInfo({
            ...packageVersionInfo.getElements(),
            prerelease: `feature-${shortSha}.${count}`
          }));
        })
        .catch(reject);
      });
    });
  }
}

module.exports = FeatureBranchInfo;
