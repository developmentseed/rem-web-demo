var coordEach = require('turf-meta').coordEach
var concaveman = require('concaveman')

module.exports = concave

// can be replaced with turf-concave once turf 3.0 is out
function concave (features) {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [ -180, -85 ],
          [ -180, 85 ],
          [ 180, 85 ],
          [ 180, -85 ],
          [ -180, -85 ]
        ],
        concaveman(coordAll(features), 5)
      ]
    }
  }
}

function coordAll(layer) {
    var coords = []
    coordEach(layer, function (coord) {
        coords.push(coord)
    })
    return coords
}
