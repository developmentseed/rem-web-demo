module.exports = {
  mapboxAccessToken: process.env.MapboxAccessToken ||
  'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJjaW14d2w2MW8wM2tndXJra2locWczMGR2In0._7KBuOaYm9R1rK3K6hdJlQ',
  mapboxAccount: 'devseed',
  customersTileset: 'devseed.rem-customers',
  "modelMenuTitle": "Diesel Price",
  models: [
    { name: '$0.85', tileset: 'devseed.rem-VSD-85-20160420m-abb8'},
    { name: '$0.90', tileset: 'devseed.rem-VSD-90-20160420m-a669'},
    { name: '$0.95', tileset: 'devseed.rem-VSD-95-20160420m-84e2'},
    { name: '$1.00', tileset: 'devseed.rem-VSD-100-20160420m-d491'}
  ],
}
