class OutputInfo
{
  constructor(program)
  {
    this.program = program;
  }

  outputTeamcity(packageVersion, packageJson)
  {
    console.log(`##teamcity[buildNumber '${packageVersion.toString()}']`);
    console.log(`##teamcity[setParameter name='package.Name' value='${packageJson.getName()}']`);
    console.log(`##teamcity[setParameter name='package.Version' value='${packageVersion.version}']`);
    console.log(`##teamcity[setParameter name='package.Prerelease' value='${packageVersion.prerelease}']`);
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
