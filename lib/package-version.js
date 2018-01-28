class PackageVersion
{
  constructor(versionString)
  {
    const verRegex = /(\d+)\.(\d+).(\d+)(-(.*))?/i
    const versionInfo = versionString.match(verRegex);
    const [ fullVersion, major, minor, patch, suffix, prerelease ] = versionInfo;

    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.version = [this.major, this.minor, this.patch].join('.');
    this.prerelease = prerelease;
  }

  getVersionInfo()
  {
    return {
      major: this.major,
      minor: this.minor,
      patch: this.patch,
      version: this.version,
      prerelease: this.prerelease
    };
  }

  toJSON()
  {
    return JSON.stringify(this.getVersionInfo());
  }

  toString()
  {
    return `${this.version}-${this.prerelease}`;
  }
}

module.exports = PackageVersion;
