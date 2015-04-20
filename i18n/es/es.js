// Configure moment.js
var moment = require('moment')
require('moment/locale/es')
moment.locale('es')

// Configure gettext
var i18n = require('../i18n.js')
module.exports = i18n(require('./dict.json'))
module.exports.moment = moment
module.exports.locale = 'es'