var fs = require('fs')
var path = require('path')
var css = [
  fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'mapbox-gl', 'dist', 'mapbox-gl.css'), 'utf-8'),
  fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'mapbox-gl-layers', 'dist', 'mapbox-gl-layers.css'), 'utf-8'),
  fs.readFileSync(path.join(__dirname, 'app.css'), 'utf-8')
].join('\n')

module.exports = function insertCss () {
  var style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = css
  document.getElementsByTagName('head')[0].appendChild(style)
}
