#!/usr/bin/env node

const package = require('./package.json');
const path = require('path');
const program = require('commander');
const workDir = process.cwd();
const git = require("nodegit");
const packageJsonPath = path.join(workDir, 'package.json');
const fs = require('fs');

let packageJson = null;
function getPackageJson()
{
  if (!packageJson)
  {
    packageJson = require(packageJsonPath);
  }

  return packageJson;
}

function getPackageVersion(workDir)
{
  return getPackageJson().version;
}

// Вычисляет последний схожий коммит между ветками develop и release/*
// и возвращает количество коммитов в release/* после него
function getCountReleaseCommits(repo, developRef, releaseRef)
{

}

// Вычисляет последний схожий коммит между ветками master и hotfix/*
// возвращает количество коммитов в hotfix/* после него
function getCountHotfixCommits(repo, masterRef, hotfixRef)
{

}

// Вычисляет последний общий коммит между ветками develop и master
// и возвращает количество коммитов в develop после него
function getCountDevelopVersionCommits(repo, developRef)
{

}

function getCommitsCount(repo, ref, targetCommitSha)
{
  return new Promise((completeResolve, completeReject) =>
  {
    repo.getReferenceCommit(ref)
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


// Возвращает коммит с которого начаналась ветка release
// Возвращает коммит с которого начаналась ветка hotfix
// Возвращает коммит с которого начаналась feature branch
// TODO: зарефакторить на общее решение
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

                completeResolve(firstJointSha);
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

function formatVersion(version)
{
  return `${version.version}-${version.prerelease}`;
}

function outputVersionTeamcity(version)
{
  const packageJson = getPackageJson();
  const { name: packageName, version: packageVersion } = packageJson;
  console.log(`##teamcity[buildNumber '${formatVersion(version)}']`);
  console.log(`##teamcity[setParameter name='package.Name' value='${packageName}']`);
  console.log(`##teamcity[setParameter name='package.Version' value='${packageVersion}']`);
  console.log(`##teamcity[setParameter name='package.Prerelease' value='${version.prerelease}']`);
}

function outputVersionJson(version)
{
  console.log(JSON.stringify(version));
}

function outputVersion(version)
{
  switch (true)
  {
    case program.json:
      outputVersionJson(version);
      break;
    case program.teamcity:
      outputVersionTeamcity(version);
      break;
    default:
      console.log(version)
  }
}

function writeVersion(version)
{
  return new Promise((resolve, reject) => {
    try
    {
      const prevPackage = getPackageJson();
      prevPackage.version = formatVersion(version);
      const nextPackage = JSON.stringify(prevPackage, null, 2);
      fs.writeFile(packageJsonPath, nextPackage, 'utf8', resolve);
    } catch(e) { reject(e); }
  })

}

function getPrefixByBranch(repo, currentVersion)
{

  return repo.getCurrentBranch().then(ref =>
    {
      const branchName = ref.name();
      const normalizeName = branchName.replace('refs/heads/', '');
      let branchVersion = currentVersion;

      switch (true)
      {
        case (normalizeName === 'master'):
          outputVersionTeamcity(currentVersion);
          break;
        case (normalizeName === 'develop'):
          outputVersionTeamcity(currentVersion + '-alpha.q');
          break;
        case ((/^release\/.*$/).test(normalizeName)):
          branchVersion = getVersionByBranchName(normalizeName);
          outputVersionTeamcity(branchVersion + '-rc.1');
          break;
        case ((/^hotfix\/.*$/).test(normalizeName)):
          branchVersion = getVersionByBranchName(normalizeName);
          outputVersionTeamcity(branchVersion + '-beta.1');
          break;
        case ((/^feature\/.*$/).test(normalizeName)):
          getFeatureCommit(repo, ref).then(tagHash =>
          {
            const shortSha = tagHash.slice(0, 7);
            getCommitsCount(repo, ref, tagHash).then((count) =>
            {
              const version = {
                version: currentVersion,
                prerelease: `feature-${shortSha}.${count}`
              };

              outputVersion(version);

              if (program.write)
              {
                writeVersion(version);
              }
            })
            .catch(e => console.log(e));
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
  .option('-t, --teamcity', 'output for TeamCity as service message')
  .option('-w, --write', 'write version into package.json')
  .parse(process.argv);

  git.Repository.open(workDir)
    .then(function(repo)
    {
      const currentVersion = getPackageVersion();
      getPrefixByBranch(repo, currentVersion)
        .catch((error) => { console.log(error) });
    })
    .catch(error => console.log('Error', error));
