class OutputBase
{
  constructor(version, packageInfo)
  {
    this.version = version;
    this.packageInfo = packageInfo;
  }

  output(...args)
  {
    console.log.apply(console, args)
  }
}

module.exports = OutputBase;
