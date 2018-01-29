class Version
{
  constructor(version)
  {
    switch(true)
    {
      case (typeof version === 'string'):
        this.applyElements(
          this.getVersionElementsByString(version)
        );
        break;

      case (version instanceof this.constructor):
        this.applyElements(version.getElements());
        break;

      case (typeof version === 'object'):
        this.applyElements(version);
        break;

      default:
        throw(new Error(('Unsupport version format ' + typeof version)))
    }
  }

  applyElements(elements)
  {
    this.major = elements.major;
    this.minor = elements.minor;
    this.patch = elements.patch;
    this.prerelease = elements.prerelease;
    return this;
  }

  getElements()
  {
    const { major, minor, patch, prerelease } = this;
    return { major, minor, patch, prerelease };
  }

  getVersionElementsByString(version)
  {
    const verRegex = /(\d+)\.(\d+).(\d+)(-(.*))?/i
    const [ fullVersion, major, minor, patch, suffix, prerelease ] = version.match(verRegex);
    return { major, minor, patch, prerelease };
  }

  getElements()
  {
    return {
      major: this.major,
      minor: this.minor,
      patch: this.patch,
      prerelease: this.prerelease
    };
  }

  toJSON()
  {
    return JSON.stringify(this.getElements());
  }

  getStableVersionString()
  {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  getUnstableVersionString()
  {
    return `${this.major}.${this.minor}.${this.patch}-${this.prerelease}`;
  }

  getBuildVersion()
  {
    if (this.prerelease)
    {
      return this.getUnstableVersionString();
    }
    else
    {
      return this.getStableVersionString()
    }
  }

  toString()
  {
    return this.getBuildVersion();
  }
}

module.exports = Version;
