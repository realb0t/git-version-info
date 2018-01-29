class OutputInfo
{
  constructor(program)
  {
    this.program = program;
  }

  outputTeamcity(packageVersion, packageJson)
  {
    const buildVersion = packageVersion.getUnstableVersionString();
    const version = packageVersion.getStableVersionString();
    const prereleaseElement = packageVersion.prerelease || '';
    const packageName = packageJson.getName();

    console.log(`##teamcity[buildNumber '${buildVersion}']`);
    this.outputTeamcityParameter('package.Name', packageName);
    this.outputTeamcityParameter('package.Version', version);
    this.outputTeamcityParameter('package.Prerelease', prereleaseElement);
  }

  outputTeamcityParameter(paramName, paramValue)
  {
    console.log(`##teamcity[setParameter name='${paramName}' value='${paramValue}']`);
  }

  outputJSON(packageVersion)
  {
    console.log(packageVersion.toJSON());
  }

  print(packageVersion, packageJson)
  {
    switch (true)
    {
      case this.program.json:
        this.outputJSON(packageVersion, packageJson);
        break;
      case this.program.teamcity:
        this.outputTeamcity(packageVersion, packageJson);
        break;
      default:
        console.log(packageVersion.toString())
    }
  }
}

module.exports = OutputInfo;
