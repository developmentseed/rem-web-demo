var fs = require('fs')
var path = require('path')
var mapboxgl = require('mapbox-gl')
var Layers = require('mapbox-gl-layers')
var ready = require('./ready')
var insertCss = require('./insert-css')
var renderProperties = require('./render-properties')
var buildStyle = require('./build-style')
var createMenu = require('./menu')
var config = require('./config')

// default is the 'rem-web-demo' API token in the devseed account
mapboxgl.accessToken = config.mapboxAccessToken

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
    style: buildStyle(config.models)
  })
  window.map = map
  map.on('style.load', function () { onLoad(map) })

  document.body.appendChild(createMenu(config.models, function (model) {
    var index = config.models.indexOf(model)
    map.getStyle().layers.forEach((layer) => {
      if (/model-.*$/.test(layer.id)) {
        var visible = layer.id.endsWith('-' + index)
        map.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none')
      }
    })
  }, config.models[0]))
})

function onLoad (map) {
  map.addControl(new mapboxgl.Navigation({ position: 'bottom-right' }))
  var satLayers = map.getStyle().layers
    .map((layer) => layer.id)
    .filter((id) => id.startsWith('satellite'))
  map.addControl(new Layers({
    layers: {
      'Satellite Layer': satLayers,
      'Customer Locations': [ 'customers-non-electrified', 'customers-electrified' ]
    }
  }))

  var popup
  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      radius: 7,
      layers: map.getStyle().layers.map((x) => x.id).filter((x) => /model-\d+$/.test(x))
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
