const OutputBase = require('./base');

class OutputJson extends OutputBase
{
  print()
  {
    this.output(this.version.toJSON());
  }
}

module.exports = OutputJson;
