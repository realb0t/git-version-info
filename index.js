#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const git = require('nodegit');
const fs = require('fs');

const VersionInfo = require('./lib/version');
const OutputInfo = require('./lib/output');
const PackageInfo = require('./lib/package-info');
const branchInfoFactory = require('./lib/branch-factory');

const GitVersionInfo = require('./lib/git-version-info');

const workDir = process.cwd();
const gitVersionInfo = new GitVersionInfo(workDir);
const version = require(path.join(__dirname, '/package.json')).version;

program
  .version(version)
  .option('-j, --json', 'output as JSON')
  .option('-t, --teamcity', 'output for TeamCity as service message')
  .option('-w, --write', 'write version into package.json')
  .parse(process.argv);

  gitVersionInfo.getVersionInfo().then(({ version, package }) =>
  {
    const outputInfo = new OutputInfo(program);
    outputInfo.print(version, package);

    if (program.write)
    {
      package.fixVersion(version);
    }
  }).catch(console.log);
