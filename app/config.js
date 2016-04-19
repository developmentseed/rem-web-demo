module.exports = {
  mapboxAccessToken: process.env.MapboxAccessToken ||
  'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJjaW14d2w2MW8wM2tndXJra2locWczMGR2In0._7KBuOaYm9R1rK3K6hdJlQ',
  mapboxAccount: 'devseed',
  tilesetPrefix: 'rem',
  models: [
    { name: '60', tileset: 'devseed.rem-VSD-60-20160419m-5794'},
    { name: '70', tileset: 'devseed.rem-VSD-70-20160419m-bad7' },
    { name: '80', tileset: 'devseed.rem-VSD-80-20160419m-500d' }
  ],
}
