var i18n = require('i18n')
var tpl = require('./index.hbs')

var totalShips = 1337

document.body.innerHTML = tpl({
  name: "Captain Sea Wizard",
  alerts: 1,
  warnings: 6,
  ships: i18n
    .translate("There is 1 ship in your account")
    .ifPlural(totalShips, "There are %d ships in your account")
    .fetch(totalShips),

  message: i18n
    .translate("There will be 1h of scheduled maintenance on %s")
    .fetch(i18n.moment("2015-12-25").format('LLL')),

  footer: i18n.translate("made by robots").fetch(),
  locale: i18n.locale
})
