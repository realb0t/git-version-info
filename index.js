#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const git = require('nodegit');
const fs = require('fs');

const PackageVersion = require('./lib/package-version')

const workDir = process.cwd();
const packageJsonPath = path.join(workDir, 'package.json');

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
  return new PackageVersion(version);
}

function outputVersionTeamcity(version)
{
  const packageName = getPackageJson().name;
  console.log(`##teamcity[buildNumber '${version.toString()}']`);
  console.log(`##teamcity[setParameter name='package.Name' value='${packageName}']`);
  console.log(`##teamcity[setParameter name='package.Version' value='${version.version}']`);
  console.log(`##teamcity[setParameter name='package.Prerelease' value='${version.prerelease}']`);
}

function outputVersionJSON(version)
{
  console.log(version.toJSON());
}

function outputVersion(version)
{
  switch (true)
  {
    case program.json:
      outputVersionJSON(version);
      break;
    case program.teamcity:
      outputVersionTeamcity(version);
      break;
    default:
      console.log(version.toString())
  }
}

function writeVersion(version)
{
  return new Promise((resolve, reject) => {
    try
    {
      const prevPackage = getPackageJson();
      prevPackage.version = version.toString();
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
          currentVersion.prerelease = 'alpha.1';
          outputVersionTeamcity(currentVersion);
          break;
        case ((/^release\/.*$/).test(normalizeName)):
          branchVersion = getVersionByBranchName(normalizeName);
          branchVersion.prerelease = 'alpha.1';
          outputVersionTeamcity(branchVersion);
          break;
        case ((/^hotfix\/.*$/).test(normalizeName)):
          branchVersion = getVersionByBranchName(normalizeName);
          branchVersion.prerelease = 'beta.1';
          outputVersionTeamcity(branchVersion);
          break;
        case ((/^feature\/.*$/).test(normalizeName)):
          getFeatureCommit(repo, ref).then(tagHash =>
          {
            const shortSha = tagHash.slice(0, 7);
            getCommitsCount(repo, ref, tagHash).then((count) =>
            {
              currentVersion.prerelease = `feature-${shortSha}.${count}`;

              outputVersion(currentVersion);

              if (program.write)
              {
                writeVersion(currentVersion);
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
  .version(getPackageJson().version)
  .option('-j, --json', 'output as JSON')
  .option('-t, --teamcity', 'output for TeamCity as service message')
  .option('-w, --write', 'write version into package.json')
  .parse(process.argv);

  git.Repository.open(workDir)
    .then(function(repo)
    {
      const currentVersion = new PackageVersion(getPackageVersion());
      getPrefixByBranch(repo, currentVersion)
        .catch((error) => { console.log(error) });
    })
    .catch(error => console.log('Error', error));
