var yo = require('yo-yo')
var flatten = require('lodash.flatten')

module.exports = function renderProperties (features) {
  return yo`<div class="rem-cluster-info">
    ${features.map((f) => yo`
      <dl>
        ${flatten(formatProperties(f.properties)
          .map((entry) => [
            yo`<dt>${entry.label}</dt>`,
            yo`<dd>${entry.value}</dd>`
          ]))}
      </dl>
    `)}
  </div>
  `
}

var propertiesToDisplay = {
  ug: {
    OffgridSolarCapacity_kW: 'Solar Capacity (kW)',
    OffgridStorageCapacity_kWh: 'Storage Capacity (kWh)',
    OffgridGenSetCapacity_kW: 'Generation Set Capacity (kW)',
    OffgridEnergyCost_USDperkWh: 'Energy Cost ($/kWh)',
    OffgridFractionDemandServed: 'Fraction of Demand Served',
    OffgridPeakDemand_kW: 'Peak Demand (kW)',
    OffgridDemand_kWhperYr: 'Demand (kWh/year)',
    OffgridGenFuel_LitersDiesel: 'Diesel (Liters)',
    OffgridAnnualFinancialCost_USD: 'Annual Financial Cost ($)'
  },
  ext: {
    GridEnergyCost_USDperkWh: 'Energy Cost ($/kWh)',
    GridReliability_percent: 'Grid Reliability ($)'
  }
}
function formatProperties (properties) {
  var items = []
  // parse the Cluster ID
  var cid = properties.ClusterID
  var match = /(.*)_(?:region(\d+))_(.*)$/.exec(cid)
  if (match) {
    items.push({label: 'REM Run', value: match[1]})
    items.push({label: 'REM Region', value: match[2]})
    items.push({label: 'REM Cluster', value: match[3]})
  }

  // prettify electrification type
  items.push({
    label: 'Electrification Type',
    value: properties.network_type === 'ext' ? 'Grid Extension' : 'Microgrid'
  })

  // grab the rest of the properties, according to electrification type
  var labels = propertiesToDisplay[properties.network_type]
  if (labels) {
    Object.keys(labels).forEach((key) => {
      items.push({label: labels[key], value: properties[key]})
    })
  }

  return items
}

