var i18n = require('i18n')
var tpl = require('./someModule/index.hbs')
var Handlebars = require('handlebars/runtime')

Handlebars.registerHelper('ngettext', function (one, other, count) {
  console.log('ngettext', arguments)
  var getText = i18n.sprintf(i18n.ngettext(one, other, count), count)
  var chained = i18n.translate(one).ifPlural(count, other).fetch(count)
  console.assert(getText === chained)
  return chained
})

var totalShips = 1337

document.body.innerHTML = tpl({
  name: "Old Captain Sea Wizard",
  alerts: 1,
  warnings: 0,
  ships: i18n
    .translate("There is 1 ship in your account")
    .ifPlural(totalShips, "There are %d ships in your account")
    .fetch(totalShips),

  message: i18n
    .translate("There will be 1h of scheduled maintenance on %s")
    .fetch(i18n.moment("2015-12-25").format('LLL')),

  footer: i18n.translate("made by Pole Star").fetch()
})
