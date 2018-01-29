const BranchInfo = require('./base-branch');

class HotfixBranchInfo extends BranchInfo
{
  // Вычисляет последний схожий коммит между ветками master и hotfix/*
  // возвращает количество коммитов в hotfix/* после него
  getCountHotfixCommits(repo, masterRef, hotfixRef)
  {

  }

  definePrerelease(packageVersion)
  {
    return Promise.resolve(packageVersion);
  }
}

module.exports = HotfixBranchInfo;
