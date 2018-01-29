#!/usr/bin/env node

const path = require('path');
const program = require('commander');

const Output = require('./lib/output');
const GitVersionInfo = require('./lib/git-version-info');

const defaultWorkDirectory = process.cwd();
const version = require(path.join(__dirname, '/package.json')).version;
let currentWorkDirectory = defaultWorkDirectory;

program
  .version(version, '-v, --version')
  .arguments('[cwd]')
  .option('-j, --json', 'output as JSON')
  .option('-t, --teamcity', 'output for TeamCity as service message')
  .option('-w, --write', 'write version into package.json')
  .action(cwd => { currentWorkDirectory = cwd; })
  .parse(process.argv);

  currentWorkDirectory = path.resolve(currentWorkDirectory);

  const gitVersionInfo = new GitVersionInfo(currentWorkDirectory);
  gitVersionInfo.getVersionInfo().then(({ version, package }) =>
  {
    const { json, teamcity, write } = program;
    new Output({ json, teamcity }).print(version, package);

    if (write)
    {
      package.fixVersion(version);
    }
  }).catch(console.log);
