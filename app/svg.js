var yo = require('yo-yo')
module.exports.line = function (color, w, h) {
  var w = 20
  var h = 20
  return yo`<svg width="${w}" height="${h}">
  <line y2="${h / 2}" x2="0"
    y1="${h / 2}" x1="${w}"
    stroke="${color}"
    stroke-width="1.5"  fill="none" />
  </svg>
  `
}

module.exports.circle = function (color, w, h) {
  return yo`<svg width="${w}" height="${h}">
  <circle cx="${w / 2}" cy="${h / 2}" r=${w / 2} fill="${color}" />
  </svg>
  `
}
