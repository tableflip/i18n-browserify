global.LOCALE = 'en'
var dict = require('./dict/dict.en.json')
module.exports = require('./locale.js')(dict)
