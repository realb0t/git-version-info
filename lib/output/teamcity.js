const OutputBase = require('./base');

class OutputTeamcity extends OutputBase
{
  output(...args)
  {
    console.log.apply(console, args)
  }

  outputTeamcityParameter(paramName, paramValue)
  {
    console.log(`##teamcity[setParameter name='${paramName}' value='${paramValue}']`);
  }

  print()
  {
    const buildVersion = this.version.getBuildVersion();
    const version = this.version.getStableVersionString();
    const prereleaseElement = this.version.prerelease || '';
    const packageName = this.packageInfo.getName();

    console.log(`##teamcity[buildNumber '${buildVersion}']`);
    this.outputTeamcityParameter('package.Name', packageName);
    this.outputTeamcityParameter('package.Version', version);
    this.outputTeamcityParameter('package.Prerelease', prereleaseElement);
  }
}

module.exports = OutputTeamcity;
