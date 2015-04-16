/*
# i18ify - used at build time to replace text in templates.
*/

var path = require('path')
var through = require('through2')
var trumpet = require('trumpet')
var trim = require('underscore.string').trim
var i18n = require('./locale.js')

var baseDir = process.cwd()

module.exports = function (file, opts) {
  if (!isHandlebars(file)) return through()
  console.log('i18nfy', opts.lang)
  var dict = require('./dict/dict.' + opts.lang + '.json')

  var key = path.relative(baseDir, file)
  // console.log('i18nfy file', key)

  var tr = trumpet()

  // Find elements to translate
  tr.selectAll('[data-i18n]', function (elem) {

    // Add the file path id as the value of the `data-i18n attribute
    elem.setAttribute('data-i18n', key)

    // Repalace the contents with the translation
    elem.createReadStream()
      .pipe(translator(dict))
      .pipe(elem.createWriteStream())
  })

  return tr
}

// Are you hbs?
function isHandlebars (file) {
  return /\.hbs$/.test(file)
}

// a transform stream to replace text with translated text
function translator (dict) {
  var locale = i18n(dict);
  return through(function (buf, enc, next) {
    var key = trim(buf.toString('utf8'))
    var result = locale.translate(key).fetch()
    // console.log('i18nfy translate', key, result)
    // if (!result) console.warn('No translation for: ', key)
    this.push(result || key)
    next()
  })
}
