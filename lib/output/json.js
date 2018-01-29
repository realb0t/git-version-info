const OutputBase = require('./base');

class OutputJson extends OutputBase
{
  print()
  {
    console.log(this.version.toJSON());
  }
}

module.exports = OutputJson;
