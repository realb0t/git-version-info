const BranchInfo = require('./base-branch-info');

class DevelopBranchInfo extends BranchInfo
{
  // Вычисляет последний общий коммит между ветками develop и master
  // и возвращает количество коммитов в develop после него
  getCountDevelopVersionCommits(repo, developRef)
  {

  }

  definePrerelease(packageVersion)
  {
    return Promise.resolve(packageVersion);
  }
}

module.exports = DevelopBranchInfo;
