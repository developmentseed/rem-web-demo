var fs = require('fs')
var path = require('path')
var css = fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'mapbox-gl', 'dist', 'mapbox-gl.css'), 'utf-8')
module.exports = function insertMapboxCss (extra) {
  var style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = css + '\n' + (extra || '')
  document.getElementsByTagName('head')[0].appendChild(style)
}
