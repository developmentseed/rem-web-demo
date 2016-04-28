var yo = require('yo-yo')
var flatten = require('lodash.flatten')
var numeral = require('numeral')

module.exports = function renderProperties (features) {
  if (!features.length) { return yo`<div class="rem-cluster-info rem-cluster-info--empty"></div>` }
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

// display settings for each property, by electricity type
var propertiesToDisplay = {
  ug: {
    Customers: {
      label: 'Customers',
      format: '0,0'
    },
    OffgridSolarCapacity_kW: {
      label: 'Solar Capacity (kW)',
      format: '0,0.0'
    },
    OffgridStorageCapacity_kWh: {
      label: 'Storage Capacity (kWh)',
      format: '0,0.0'
    },
    OffgridGenSetCapacity_kW: {
      label: 'Generation Set Capacity (kW)',
      format: '0,0.0'
    },
    OffgridEnergyCost_USDperkWh: {
      label: 'Energy Cost ($/kWh)',
      format: '0,0.00'
    },
    OffgridFractionDemandServed: {
      label: 'Fraction of Demand Served',
      format: '0,0.00'
    },
    OffgridPeakDemand_kW: {
      label: 'Peak Demand (kW)',
      format: '0,0.0'
    },
    OffgridDemand_kWhperYr: {
      label: 'Demand (kWh/year)',
      format: '0,0.00'
    },
    OffgridGenFuel_LitersDiesel: {
      label: 'Diesel (Liters)',
      format: '0,0'
    },
    OffgridAnnualFinancialCost_USD: {
      label: 'Annual Financial Cost ($)',
      format: '0,0'
    }
  },
  ext: {
    Customers: {
      label: 'Customers',
      format: '0,0'
    },
    GridEnergyCost_USDperkWh: {
      label: 'Energy Cost ($/kWh)',
      format: '0,0.00'
    },
    GridReliability_percent: {
      label: 'Grid Reliability',
      format: '0,0.00'
    }
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
      items.push({
        label: labels[key].label,
        value: format(properties[key], labels[key].format)
      })
    })
  }

  return items
}

function format (value, fmt) {
  if (typeof fmt === 'string') {
    return numeral(value).format(fmt)
  } else {
    return value
  }
}

