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
var concave = require('./concave')
var svg = require('./svg')
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
})

function createSidePanel (menu) {
  var infoPane = yo`
  <div id='rem-info-pane'>
    <h1>Example Reference Electrification Model output</h1>
    <div class='menu'>
      <h2>${config.modelMenuTitle}</h2>
      ${menu}
    </div>
    ${renderProperties([])}
    <div class='legend'>
      <dl>
        <dt>${svg.line('hsl(84, 90%, 33%)', 20, 20)}</dt>
        <dd>Microgrid</dd>
        <dt>${svg.line('hsl(201, 90%, 33%)', 20, 20)}</dt>
        <dd>Grid Extension</dd>
        <dt>${svg.circle('hsl(43, 100%, 71%)', 20, 20)}</dt>
        <dd>Customers served by modeled network</dd>
        <dt>${svg.circle('hsla(56, 98%, 46%, 0.22)', 20, 20)}</dt>
        <dd>Already-electrified customers</dd>
      </dl>
    </div>
    <aside class='explanation'>
      <p>Prescribed medium voltage lines are shown larger, and low voltage lines are smaller. Generation site and transformer locations are also shown.</p>
      <p>For this demonstration, the <a href="http://universalaccess.mit.edu/#/main">Universal Access team</a> made guesses as to which identified buildings were grid electrified, and which ones were not electrified at all. Low voltage distribution network geodata was unavailable, so grid estimates were made based on high voltage and medium voltage distribution data. Grid extensions plans necessarily connect to our estimations of the existing grid location (not shown).</p>
    </aside>
  </div>`
  container.appendChild(infoPane)

  container.appendChild(yo`
    <div class='rem-disclaimer'>
      FOR DEMONSTRATION PURPOSES ONLY.<br>
      Data shown is not an official recommendation by Development Seed or the
      <a href="http://universalaccess.mit.edu/#/main">MIT-Comillas Universal Energy Access Research Group</a>.
    </div>
  `)
}

function onLoad (map) {
  // add layer toggle
  map.addControl(new mapboxgl.Navigation({ position: 'top-right' }))
  var satLayers = map.getStyle().layers
    .map((layer) => layer.id)
    .filter((id) => id.startsWith('satellite'))
  map.addControl(new Layers({
    layers: {
      'Satellite Layer': satLayers,
      'Currently Electrified Buildings': [ 'customers-electrified' ]
    },
    onChange: function (e) {
      // adjust the highlight layer based on whether or not the satellite layer
      // is turned on
      if (e.name === 'Satellite Layer') {
        if (e.active) {
          map.setPaintProperty('rem-network-highlight', 'fill-color', '#ffffff')
        } else {
          map.setPaintProperty('rem-network-highlight', 'fill-color', '#888888')
        }
      }
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

  // setup model switcher
  var menu = createMenu(config.models, function (model) {
    currentModelIndex = config.models.indexOf(model)
    getModelLayers(map).forEach((layer) => {
      var visible = layer.endsWith('-' + currentModelIndex)
      map.setLayoutProperty(layer, 'visibility', visible ? 'visible' : 'none')
    })
    updateVisibleFeatures()
  }, config.models[0])

  createSidePanel(menu)

  // handle hovering over rem model features
  var hoveredClusterId
  function isHoveredNetwork (feature) {
    return feature.properties.ClusterID === hoveredClusterId
  }
  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      radius: 30,
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
      var hovered = concave({
        type: 'FeatureCollection',
        features: visibleFeatures.filter(isHoveredNetwork)
      })
      map.getSource('highlight-features').setData(hovered)
    }
  })

}

function getModelLayers (map, pattern) {
  pattern = pattern || /model-\d+$/
  return map.getStyle().layers.map((x) => x.id).filter((x) => pattern.test(x))
}
