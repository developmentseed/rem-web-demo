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

var container
var currentModelIndex = 0

// setup the document
ready(function () {
  insertCss()

  // stick a container div into the document if there isn't one already
  container = document.querySelector('#rem-demo')
  if (!container) {
    container = yo`<div id='rem-demo'></div>`
    document.body.appendChild(container)
  }

  // boot up the map
  container.appendChild(yo`<div id='rem-map'></div>`)
  var map = new mapboxgl.Map({
    container: 'rem-map',
    style: buildStyle()
  })
  window.map = map
  map.on('style.load', function () { onLoad(map) })

  // model switcher
  var menu = createMenu(config.models, function (model) {
    currentModelIndex = config.models.indexOf(model)
    getModelLayers(map).forEach((layer) => {
      var visible = layer.endsWith('-' + currentModelIndex)
      map.setLayoutProperty(layer, 'visibility', visible ? 'visible' : 'none')
    })
  }, config.models[0])

  var infoPane = yo`
  <div id='rem-info-pane'>
    <div class='menu'>
      <h2>${config.modelMenuTitle}</h2>
      ${menu}
    </div>
    ${renderProperties([])}
    <div class='legend'></div>
  </div>`
  container.appendChild(infoPane)

  container.appendChild(yo`
    <div class='rem-disclaimer'>
      FOR DEMONSTRATION PURPOSES ONLY.<br>
      Data shown is not an official recommendation by Development Seed or the
      MIT-Comillas Universal Energy Access Research Group.
    </div>
  `)
})

function onLoad (map) {
  map.addControl(new mapboxgl.Navigation({ position: 'top-right' }))
  var satLayers = map.getStyle().layers
    .map((layer) => layer.id)
    .filter((id) => id.startsWith('satellite'))
  map.addControl(new Layers({
    layers: {
      'Satellite Layer': satLayers,
      'Customer Locations': [ 'customers-non-electrified', 'customers-electrified' ]
    }
  }))

  // Keep track of the visible network features as the map moves around
  // (This is hackery to workaround this issue: https://github.com/mapbox/mapbox-gl-js/issues/1715)
  var visibleFeatures = []
  map.on('moveend', updateVisibleFeatures)
  updateVisibleFeatures()
  function updateVisibleFeatures () {
    function onData () {
      if(!map.loaded()) { return }
      map.off('render', onData)
      visibleFeatures = map.queryRenderedFeatures({
        layers: getModelLayers(map, RegExp('network.*model-' + currentModelIndex + '$'))
      })
    }
    map.on('render', onData)
  }

  var hoveredClusterId
  function isHoveredNetwork (feature) {
    return feature.properties.ClusterID === hoveredClusterId
  }
  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      radius: 7,
      layers: getModelLayers(map, RegExp('model-' + currentModelIndex + '$'))
    })
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''

    if (!features.length) {
      return
    }

    // update cluster info table
    var feature = features[0]
    var info = container.querySelector('.rem-cluster-info')
    yo.update(info, renderProperties([feature]))

    if (hoveredClusterId !== feature.properties.ClusterID) {
      hoveredClusterId = feature.properties.ClusterID
      // Highlight hovered feature
      var hovered = visibleFeatures.filter(isHoveredNetwork)
      map.getSource('highlight-features').setData({
        type: 'FeatureCollection',
        features: hovered
      })
    }
  })
}

function getModelLayers (map, pattern) {
  pattern = pattern || /model-\d+$/
  return map.getStyle().layers.map((x) => x.id).filter((x) => pattern.test(x))
}
