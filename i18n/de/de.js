// Configure moment.js
var moment = require('moment')
require('moment/locale/de')
moment.locale('de')

// Configure gettext
var i18n = require('../i18n.js')
module.exports = i18n(require('./dict.json'))
module.exports.moment = moment
module.exports.locale = 'de'