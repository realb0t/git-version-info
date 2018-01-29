const BranchInfo = require('./base');

class DevelopBranchInfo extends BranchInfo
{
  // Вычисляет последний общий коммит между ветками develop и master
  // и возвращает количество коммитов в develop после него
  getCountDevelopVersionCommits(repo, developRef)
  {

  }
}

module.exports = DevelopBranchInfo;
