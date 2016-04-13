var fs = require('fs')
var path = require('path')
var mapboxgl = require('mapbox-gl')
var ready = require('./ready')
var mapboxCss = require('./insert-mapbox-css')
var renderProperties = require('./render-properties')

// default is the 'rem-web-demo' API token in the devseed account
mapboxgl.accessToken = process.env.MapboxAccessToken || 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJjaW14d2w2MW8wM2tndXJra2locWczMGR2In0._7KBuOaYm9R1rK3K6hdJlQ'

var appCss = fs.readFileSync(path.join(__dirname, 'app.css'))

// setup the document
ready(function () {
  mapboxCss(appCss)

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
    style: 'mapbox://styles/devseed/cimxnftps00n7ahnpde7k6m3h'
  })
  map.on('style.load', function () { onLoad(map) })
})

function onLoad (map) {
  map.addControl(new mapboxgl.Navigation())

  var popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })

  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      radius: 7,
      layers: [
        'lv-transformer',
        'mv-transformer',
        'lv-generator',
        'mv-generator',
        'lv-network',
        'mv-network'
      ]
    })
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''
    if (!features.length) {
      popup.remove()
      return
    }

    popup.setLngLat(e.lngLat).setHTML(renderProperties(features)).addTo(map)
  })
}
