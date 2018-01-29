const fs = require('fs');
const path = require('path');
const VersionInfo = require('./version');

class Package
{
  constructor(workDir)
  {
    this.workDir = workDir || process.cwd();
    this.path = path.join(this.workDir, 'package.json');
    this.content = null;
  }

  loadContent()
  {
    if (!this.content)
    {
      this.content = require(this.path);
    }

    return this;
  }

  getName()
  {
    return this.loadContent().content.name;
  }

  getVersionString()
  {
    return this.loadContent().content.version;
  }

  getVersionInfo()
  {
    return new VersionInfo(this.loadContent().content.version);
  }

  writeVersion(packageVersion)
  {
    return this.writeChanges({ version: packageVersion.toString() });
  }

  writeChanges(changes = {})
  {
    this.loadContent();
    return new Promise((resolve, reject) => {
      try
      {
        this.content = { ...this.content, ...changes };
        const jsonContent = JSON.stringify(this.content, null, 2);
        fs.writeFile(this.path, jsonContent, 'utf8', resolve);
      } catch(e) { reject(e); }
    })
  }
}

Package.produce = function(workDir)
{
  return new Promise((resolve, reject) => {
    const packageJson = new Package(workDir);
    packageJson.loadContent();
    resolve(packageJson);
  });
}

module.exports = Package;
