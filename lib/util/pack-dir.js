'use strict'

const BB = require('bluebird')

const cacache = require('cacache')
const cacheKey = require('./cache-key')
const optCheck = require('./opt-check')
const pipe = BB.promisify(require('mississippi').pipe)
const tar = require('tar')

module.exports = packDir
function packDir (manifest, label, dir, target, opts) {
  opts = optCheck(opts)

  const packer = opts.dirPacker
  ? opts.dirPacker(manifest, dir)
  : tar.c({
    cwd: dir,
    filter (p) {
      return !p.match(/\.git/)
    },
    gzip: true,
    portable: true,
    prefix: 'package/'
  }, ['.'])

  if (!opts.cache) {
    return pipe(packer, target).catch(err => {
      throw err
    })
  } else {
    const cacher = cacache.put.stream(
      opts.cache, cacheKey('packed-dir', label), opts
    ).on('integrity', i => {
      target.emit('integrity', i)
    })
    return BB.all([
      pipe(packer, cacher),
      pipe(packer, target)
    ])
  }
}
