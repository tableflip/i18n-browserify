
var moment = require('moment')
require('moment/locale/es')
moment.locale('es')

var dict = require('./dict/dict.es.json')

module.exports = require('./locale.js')(dict)
module.exports.moment = moment
