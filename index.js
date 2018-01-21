#!/usr/bin/env node

const package = require('./package.json');
const program = require('commander');

/*
 program
  .arguments('<file>')
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .action(function(file) {
    console.log('user: %s pass: %s file: %s',
        program.username, program.password, file);
  })
  .parse(process.argv);
*/

program
  .version(package.version)
  .arguments('<command>')
  .option('-j, --json', 'output as JSON')
  .action(function(command) {
    if (command === 'info')
    {
      const git = require("nodegit");
      git.Repository.open(".")
        .then(repo =>
        {
          return repo.getHeadCommit();
        })
        .then(firstCommit =>
        {
          const history = firstCommit.history();

          let count = 0;
          history.on("commit", function(commit) {
            console.log("commit: " + commit.sha());
            if (++count >= 1) {
              return;
            }
          });

          history.start();
        });
    }
  })
  .parse(process.argv);
