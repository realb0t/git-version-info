const BranchInfo = require('./base');

class HotfixBranchInfo extends BranchInfo
{
  // Вычисляет последний схожий коммит между ветками master и hotfix/*
  // возвращает количество коммитов в hotfix/* после него
  getCountHotfixCommits(repo, masterRef, hotfixRef)
  {

  }
}

module.exports = HotfixBranchInfo;
