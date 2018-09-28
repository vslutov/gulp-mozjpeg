const through = require('through2')
const PluginError = require('plugin-error')
const execa = require('execa')
const mozjpeg = require('mozjpeg')
const replaceExt = require('replace-ext')

// Consts
const PLUGIN_NAME = 'gulp-mozjpeg'

module.exports = (options = {}) => {
  options = Object.assign({
    trellis: true,
    trellisDC: true,
    overshoot: true
  }, options)

  const args = []

  if (typeof options.quality !== 'undefined') {
    args.push('-quality', options.quality)
  }

  if (options.progressive === false) {
    args.push('-baseline')
  }

  if (options.targa) {
    args.push('-targa')
  }

  if (options.revert) {
    args.push('-revert')
  }

  if (options.fastCrush) {
    args.push('-fastcrush')
  }

  if (typeof options.dcScanOpt !== 'undefined') {
    args.push('-dc-scan-opt', options.dcScanOpt)
  }

  if (!options.trellis) {
    args.push('-notrellis')
  }

  if (!options.trellisDC) {
    args.push('-notrellis-dc')
  }

  if (options.tune) {
    args.push(`-tune-${options.tune}`)
  }

  if (!options.overshoot) {
    args.push('-noovershoot')
  }

  if (options.arithmetic) {
    args.push('-arithmetic')
  }

  if (options.dct) {
    args.push('-dct', options.dct)
  }

  if (options.quantBaseline) {
    args.push('-quant-baseline', options.quantBaseline)
  }

  if (typeof options.quantTable !== 'undefined') {
    args.push('-quant-table', options.quantTable)
  }

  if (options.smooth) {
    args.push('-smooth', options.smooth)
  }

  if (options.maxMemory) {
    args.push('-maxmemory', options.maxMemory)
  }

  if (options.sample) {
    args.push('-sample', options.sample.join(','))
  }

  const updateFile = async (file) => {
    if (file.isNull()) {
      return file
    }

    if (file.extname !== '.png' && file.extname !== 'jpg') {
      throw new PluginError(PLUGIN_NAME, 'Only .jpg and .png are allowed')
    }

    if (file.isBuffer() || file.isStream()) {
      file.contents = await execa.stdout(mozjpeg, args, {
        encoding: null,
        input: file.contents,
        maxBuffer: Infinity
      })
    }

    file.path = replaceExt(file.path, '.jpg')

    return file
  }

  // Creating a stream through which each file will pass
  return through.obj(async (file, enc, cb) => {
    updateFile(file).then((value) => cb(null, value), (exc) => cb(exc))
  })
}
