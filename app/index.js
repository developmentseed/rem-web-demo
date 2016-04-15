var fs = require('fs')
var path = require('path')
var mapboxgl = require('mapbox-gl')
var Layers = require('mapbox-gl-layers')
var ready = require('./ready')
var insertCss = require('./insert-css')
var renderProperties = require('./render-properties')

// default is the 'rem-web-demo' API token in the devseed account
mapboxgl.accessToken = process.env.MapboxAccessToken || 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJjaW14d2w2MW8wM2tndXJra2locWczMGR2In0._7KBuOaYm9R1rK3K6hdJlQ'


// setup the document
ready(function () {
  insertCss()

  // stick a container div into the document if there isn't one already
  if (!document.querySelector('#rem-map')) {
    var container = document.createElement('div')
    container.id = 'rem-map'
    container.style.position = 'absolute'
    container.style.top = container.style.bottom = 0
    container.style.width = '100%'
    document.body.appendChild(container)
  }

  // boot up the map
  var map = new mapboxgl.Map({
    container: 'rem-map',
    style: 'mapbox://styles/devseed/cin0qcvll0016b7kqh7mc5y2c'
  })
  window.map = map
  map.on('style.load', function () { onLoad(map) })
})

var modelLayers = [
  'lv-transformer',
  'mv-transformer',
  'lv-generator',
  'mv-generator',
  'lv-network',
  'mv-network'
]
modelLayers = modelLayers.map((x) => 'ug-' + x)
  .concat(modelLayers.map((x) => 'ext-' + x))

function onLoad (map) {
  map.addControl(new mapboxgl.Navigation({ position: 'bottom-right' }))
  var satLayers = map.getStyle().layers
    .map((layer) => layer.id)
    .filter((id) => id.startsWith('satellite'))
  map.addControl(new Layers({
    layers: {
      'Satellite Layer': satLayers,
      'Customer Locations': [ 'customers-non-electrified', 'customers-electrified' ],
      'REM Output': modelLayers.concat(['rem-customers'])
    }
  }))

  var popup
  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      radius: 7,
      layers: modelLayers
    })
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''
    if (!features.length) {
      if (popup) { popup.remove() }
      popup = null
      return
    }

    if (!popup) {
      popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
      popup.addTo(map)
    }

    popup.setLngLat(e.lngLat).setDOMContent(renderProperties(features))
  })
}
