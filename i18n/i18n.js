/*
# i18n.js - used at run-time & build-time for getext style string translation
*/
var Jed = require('jed')

module.exports = function (dict) {
  return new Jed({
    "domain" : "frontend",
    "missing_key_callback" : function(key) { console.warn("i18n", key) },
    "locale_data" : dict
  })
}
