#!/usr/bin/env node

const package = require('./package.json');
const program = require('commander');

function getPackageVersion(workDir)
{
  const packageJson = require(workDir + '/package.json');
  return packageJson.version;
}

function getFeatureCommit(repo, featureRef)
{
  return new Promise((completeResolve, completeReject) =>
  {
    repo.getReferenceCommit('refs/heads/develop')
      .catch(completeReject)
      .then(developCommit =>
      {
        repo.getReferenceCommit(featureRef)
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

                completeResolve(firstJointSha.slice(0, 7));
              });
          });
      });
  });
}

function getVersionByBranchName(branchName)
{
  const regexp = /^release\/v*(\d+\.\d+\.\d+)$/;
  const version = branchName.replace(regexp, '$1');
  return version;
}

function getPrefixByBranch(repo, currentVersion)
{

  return repo.getCurrentBranch().then(ref =>
    {
      const branchName = ref.name();
      const normalizeName = branchName.replace('refs/heads/', '');
      let branchVersion = currentVersion;
      console.log(`Branch name "${normalizeName}"`)

      switch (true)
      {
        case (normalizeName === 'master'):
          console.log(currentVersion);
          break;
        case (normalizeName === 'develop'):
          console.log(currentVersion + '-alpha.q');
          break;
        case ((/^release\/.*$/).test(normalizeName)):
          branchVersion = getVersionByBranchName(normalizeName);
          console.log(branchVersion + '-rc.1');
          break;
        case ((/^hotfix\/.*$/).test(normalizeName)):
          branchVersion = getVersionByBranchName(normalizeName);
          console.log(branchVersion + '-beta.1');
          break;
        case ((/^feature\/.*$/).test(normalizeName)):
          getFeatureCommit(repo, ref).then(tagHash =>
          {
            console.log(currentVersion + '-feature-' + tagHash + '.1');
          });
          break;
        default:
          throw(new Error('Unsupported branch'));
      };
    });
}

program
  .version(package.version)
  .option('-j, --json', 'output as JSON')
  .parse(process.argv);
  const workDir = process.cwd();
  const git = require("nodegit");
  git.Repository.open(workDir)
    .then(function(repo)
    {
      const currentVersion = getPackageVersion(workDir);
      getPrefixByBranch(repo, currentVersion)
        .catch((error) => { console.log(error) });
    })
    .catch(error => console.log('Error', error));
