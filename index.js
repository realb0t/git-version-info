#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const git = require('nodegit');
const fs = require('fs');

const PackageVersion = require('./lib/package-version');
const OutputInfo = require('./lib/output-info');
const PackageInfo = require('./lib/package-info');
const branchInfoFactory = require('./lib/branch-info-factory');

const workDir = process.cwd();

function processVersionInfo(program, packageVersion, packageInfo)
{
  const outputInfo = new OutputInfo(program);
  outputInfo.print(packageVersion, packageInfo);

  if (program.write)
  {
    packageInfo.writeVersion(packageVersion);
  }
}

function produceVersionInfo(repo, packageVersion, packageInfo)
{
  return branchInfoFactory(repo).then(branchInfo =>
  {
    branchInfo.definePrerelease(packageVersion).then(prereleaseVersion =>
    {
      processVersionInfo(program, prereleaseVersion, packageInfo);
    });
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
    .catch(error => console.log('Error', error));
