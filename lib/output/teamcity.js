const OutputBase = require('./base');

const tcPrefix = '##teamcity';

class OutputTeamcity extends OutputBase
{
  outputTeamcityParameter(paramName, paramValue)
  {
    this.output(`${tcPrefix}[setParameter name='${paramName}' value='${paramValue}']`);
  }

  print()
  {
    const buildVersion = this.version.getBuildVersion();
    const version = this.version.getStableVersionString();
    const prereleaseElement = this.version.prerelease || '';
    const packageName = this.packageInfo.getName();

    this.output(`${tcPrefix}[buildNumber '${buildVersion}']`);
    this.outputTeamcityParameter('package.Name', packageName);
    this.outputTeamcityParameter('package.Version', version);
    this.outputTeamcityParameter('package.Prerelease', prereleaseElement);
  }
}

module.exports = OutputTeamcity;
