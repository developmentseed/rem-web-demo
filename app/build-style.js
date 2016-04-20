var traverse = require('traverse')
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

      this.update(sources)
    } else if (key === 'layers') {
      var layers = x.map((layer) => {
        if (layer.source === 'model') {
          return config.models.map((src, i) => extend(layer, {
            id: layer.id + '-model-' + i,
            source: 'model-' + i,
            layout: extend(layer.layout, {
              visibility: i ? 'none' : 'visible'
            })
          }))
        } else {
          return layer
        }
      })
      this.update(flatten(layers))
    } else if (isString(x)) {
      this.update(x.replace(/MB_ACCOUNT/g, config.mapboxAccount)
                    .replace(/CUSTOMERS_TILESET/g, config.customersTileset)
                    .replace(/STYLE_ID/g, template.id))
    }
  })
}

function isString (x) { return typeof x === 'string' }
function flatten (arr) {
  return arr.reduce(function (memo, x) {
    if (Array.isArray(x)) {
      memo.push.apply(memo, x)
    } else {
      memo.push(x)
    }
    return memo
  }, [])
}
function extend (o1, o2) {
  return Object.assign({}, o1, o2)
}

// output to console if this is being run directly as a script
if (require.main === module) {
  console.log(JSON.stringify(buildStyle(), null, 2))
}
