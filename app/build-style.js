var traverse = require('traverse')
var flatten = require('lodash.flatten')
var template = require('./style.template.json')
var config = require('./config')

module.exports = buildStyle

function buildStyle () {
  return traverse(template).map(function (x) {
    var key = this.path.join('.')
    if (key === 'sources') {
      var sources = extend(x)
      config.models.forEach((src, i) => {
        sources['model-' + i] = {
            url: 'mapbox://' + src.tileset,
            type: 'vector'
        }
      })

      sources['highlight-features'] = {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      }

      this.update(sources)
    } else if (key === 'layers') {
      var referenceNetworkLayer
      var layers = x.map((layer) => {
        if (layer.source === 'model') {
          // keep a copy of a network layer to use for the highlight style (below)
          if (layer.type === 'line') { referenceNetworkLayer = layer }

          // make per-model copy of each model-rendering layer in the template
          return config.models.map((src, i) => {
            return extend(layer, {
              id: layer.id + '-model-' + i,
              source: 'model-' + i,
              layout: extend(layer.layout, {
                visibility: i ? 'none' : 'visible'
              })
            })
          })
        } else {
          return layer
        }
      })

      // add hover style layer
      var highlightFill = {
        id: 'rem-network-highlight',
        source: 'highlight-features',
        type: 'fill',
        paint: {
          'fill-color': '#888888',
          'fill-opacity': 0.16666,
        },
        layout: {
          visibility: 'visible'
        }
      }

      var highlightLine = {
        id: 'rem-network-highlight-line',
        source: 'highlight-features',
        type: 'line',
        paint: {
          'line-color': '#ff8800',
          'line-width': 2,
          'line-opacity': 0.75
        }
      }

      layers = flatten(layers)
      var remIndex = layers.indexOf(layers.find((l) => /^model/.test(l.source)))
      layers.splice(remIndex, 0, highlightFill)
      layers.push(highlightLine)

      this.update(layers)
    } else if (isString(x)) {
      this.update(x.replace(/MB_ACCOUNT/g, config.mapboxAccount)
                    .replace(/CUSTOMERS_TILESET/g, config.customersTileset)
                    .replace(/STYLE_ID/g, template.id))
    }
  })
}

function isString (x) { return typeof x === 'string' }
function extend (o1, o2) {
  return Object.assign({}, o1, o2)
}

function multiplyLineWidth (width, m) {
  if (typeof width === 'number') { return width * m }
  return {
    base: width.base * m,
    stops: width.stops.map((s) => [s[0], m * s[1]])
  }
}

// output to console if this is being run directly as a script
if (require.main === module) {
  console.log(JSON.stringify(buildStyle(), null, 2))
}
