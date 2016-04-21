var fs = require('fs')
var path = require('path')
var mapboxgl = require('mapbox-gl')
var yo = require('yo-yo')
var Layers = require('mapbox-gl-layers')
var ready = require('./ready')
var insertCss = require('./insert-css')
var renderProperties = require('./render-properties')
var buildStyle = require('./build-style')
var createMenu = require('./menu')
var config = require('./config')

// default is the 'rem-web-demo' API token in the devseed account
mapboxgl.accessToken = config.mapboxAccessToken

var currentModelIndex = 0

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
    style: buildStyle()
  })
  window.map = map
  map.on('style.load', function () { onLoad(map) })

  // add the model switcher
  var menu = createMenu(config.models, function (model) {
    currentModelIndex = config.models.indexOf(model)
    getModelLayers(map).forEach((layer) => {
      var visible = layer.endsWith('-' + currentModelIndex)
      map.setLayoutProperty(layer, 'visibility', visible ? 'visible' : 'none')
    })
  }, config.models[0])
  document.body.appendChild(yo`
    <div class='menu'>
      <h2>${config.modelMenuTitle}</h1>
      ${menu}
    </div>
  `)
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
      layers: getModelLayers(map, RegExp('model-' + currentModelIndex + '$'))
    })
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''

    // Show/hide popup
    if (!features.length) {
      if (popup) { popup.remove() }
      popup = null
      return
    }

    features = [features[0]]
    if (!popup) {
      popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
      popup.addTo(map)
    }
    popup.setLngLat(e.lngLat).setDOMContent(renderProperties(features))

    // Highlight hovered feature
    var filter = Object.keys(features.reduce((memo, x) => {
      if (x.properties.ClusterID) { memo[x.properties.ClusterID] = true }
      return memo
    }, {}))
    filter = ['in', 'ClusterID'].concat(filter)
    getModelLayers(map, RegExp('model-' + currentModelIndex + '-highlight'))
    .forEach((layer) => {
      map.setFilter(layer, filter)
    })
  })
}

function getModelLayers (map, pattern) {
  pattern = pattern || /model-\d+$/
  return map.getStyle().layers.map((x) => x.id).filter((x) => pattern.test(x))
}
