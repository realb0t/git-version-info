#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const git = require('nodegit');
const fs = require('fs');

const PackageVersion = require('./lib/package-version');
const OutputInfo = require('./lib/output-info');
const PackageInfo = require('./lib/package-info');

const workDir = process.cwd();

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

function processVersionInfo(program, packageVersion, packageInfo)
{
  const outputInfo = new OutputInfo(program);
  outputInfo.print(packageVersion, packageInfo);

  if (program.write)
  {
    packageInfo.writeVersion(packageVersion);
  }
}

function produceVersionInfo(repo, currentVersion, packageInfo)
{
  return repo.getCurrentBranch().then(ref =>
    {
      const branchName = ref.name();
      const normalizeName = branchName.replace('refs/heads/', '');
      let branchVersion = currentVersion;

      switch (true)
      {
        case (normalizeName === 'master'):
          processVersionInfo(program, branchVersion);
          break;
        case (normalizeName === 'develop'):
          branchVersion.prerelease = 'alpha.1';
          processVersionInfo(program, branchVersion, packageInfo);
          break;
        case ((/^release\/.*$/).test(normalizeName)):
          branchVersion = getVersionByBranchName(normalizeName);
          branchVersion.prerelease = 'alpha.1';
          processVersionInfo(program, branchVersion, packageInfo);
          break;
        case ((/^hotfix\/.*$/).test(normalizeName)):
          branchVersion = getVersionByBranchName(normalizeName);
          branchVersion.prerelease = 'beta.1';
          processVersionInfo(program, branchVersion, packageInfo);
          break;
        case ((/^feature\/.*$/).test(normalizeName)):
          getFeatureCommit(repo, ref).then(tagHash =>
          {
            const shortSha = tagHash.slice(0, 7);
            getCommitsCount(repo, ref, tagHash).then((count) =>
            {
              branchVersion.prerelease = `feature-${shortSha}.${count}`;
              processVersionInfo(program, branchVersion, packageInfo);
            })
            .catch(e => console.log(e));
          });
          break;
        default:
          throw(new Error('Unsupported branch'));
      };
    });
}

const version = require(path.join(__dirname, '/package.json')).version;

program
  .version(version)
  .option('-j, --json', 'output as JSON')
  .option('-t, --teamcity', 'output for TeamCity as service message')
  .option('-w, --write', 'write version into package.json')
  .parse(process.argv);

  PackageInfo.produce(workDir)
    .then((packageInfo) =>
    {
      git.Repository.open(workDir)
        .then(function(repo)
        {
          const currentVersion = new PackageVersion(packageInfo.getVersion());
          produceVersionInfo(repo, currentVersion, packageInfo)
            .catch((error) => { console.log(error) });
        })

    })
    .catch(error => console.log('Error', error));;


////
/*
const gitRepository = yield git.Repository.open(workDir);
const branchInfo = yield BranchInfo.product(repo);
// { branchVersion, commits }
const packageInfo = yield PackageInfo.produce(workDir);
GitVersion.process(program, branchInfo, packageInfo);
*/
