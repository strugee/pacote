const os = require('os')
const {resolve} = require('path')
const cacheDir = require('cache-directory')

module.exports = (fakePlatform = false) => {
  const temp = os.tmpdir()
  const uidOrPid = process.getuid ? process.getuid() : process.pid
  const platform = fakePlatform || process.platform
  const cacheRootOrNull = cacheDir('npm')
  const cacheRoot = cacheRootOrNull ? cacheRootOrNull : resolve(temp, 'npm-' + uidOrPid)
  return resolve(cacheRoot, '_cacache')
}
