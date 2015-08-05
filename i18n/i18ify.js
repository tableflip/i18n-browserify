/*
# i18ify - used at build time to replace text in templates.
*/
var fs = require('fs')
var path = require('path')
var through = require('through2')
var trumpet = require('trumpet')
var trim = require('underscore.string').trim
var i18n = require('./i18n.js')

module.exports = function (file, opts) {
  if (!isHandlebars(file)) return through()

  opts = opts || {}

  var baseDir = process.cwd()
  var dictPath = path.join(opts.path || baseDir, opts.lang, 'dict.json')
  var dict = JSON.parse(fs.readFileSync(dictPath))
  var key = path.relative(baseDir, file)
  var tr = trumpet()

  // Find elements to translate
  tr.selectAll('[data-i18n]', function (elem) {

    // Add the file path id as the value of the `data-i18n attribute
    elem.setAttribute('data-i18n', key)

    // Replace the contents with the translation
    elem.createReadStream()
      .pipe(translator(dict, file))
      .pipe(elem.createWriteStream())
  })

  return tr
}

// Are you hbs?
function isHandlebars (file) {
  return /\.hbs$/.test(file)
}

// a transform stream to replace text with translated text
function translator (dict, file) {
  var locale = i18n(dict)
  var key = ''

  return through(
    function (buf, enc, next) {
      key += trim(buf.toString('utf8'))
      next()
    },
    function (next) {
      if (!key) return next(new Error('Empty translation key in file ' + file))

      var result = locale.translate(key).fetch()
      // console.log('i18nfy translate', key, result)
      // if (!result) console.warn('No translation for: ', key)
      this.push(result || key)
      next()
    }
  )
}
