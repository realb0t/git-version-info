#!/usr/bin/env node

const path = require('path');
const program = require('commander');

const Output = require('./lib/output');
const GitVersionInfo = require('./lib/git-version-info');

const workDir = process.cwd();
const version = require(path.join(__dirname, '/package.json')).version;

program
  .version(version)
  .option('-j, --json', 'output as JSON')
  .option('-t, --teamcity', 'output for TeamCity as service message')
  .option('-w, --write', 'write version into package.json')
  .parse(process.argv);

  const gitVersionInfo = new GitVersionInfo(workDir);
  gitVersionInfo.getVersionInfo().then(({ version, package }) =>
  {
    const { json, teamcity, write } = program;
    new Output({ json, teamcity }).print(version, package);

    if (write)
    {
      package.fixVersion(version);
    }
  }).catch(console.log);
