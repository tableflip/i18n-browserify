var Handlebars = require('handlebars/runtime')
var i18n = require('i18n')

Handlebars.registerHelper('ngettext', function (one, other, count) {
  return i18n.translate(one).ifPlural(count, other).fetch(count)
})

require('./login')
