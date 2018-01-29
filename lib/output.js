const OutputJson = require('./output/json');
const OutputTeamcity = require('./output/teamcity');

class Output
{
  constructor(format)
  {
    this.format = format;
  }

  print(version, packageInfo)
  {
    switch (true)
    {
      case this.format.json:
        new OutputJson(version, packageInfo).print();
        break;
      case this.format.teamcity:
        new OutputTeamcity(version, packageInfo).print();
        break;
      default:
        console.log(version.toString())
    }
  }
}

module.exports = Output;
