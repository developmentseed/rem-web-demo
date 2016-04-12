# REM model interactive web map demo

This repo is intended as an example/demo of taking the output from the [REM model developed at MIT Tata center](http://tatacenter.mit.edu/portfolio/rem-a-planning-model-for-rural-electrification/) and quickly visualizing those results on an interactive web map.

[Working demo]()

## Installation

To get set up, first:
 - Install [tippecanoe](https://github.com/mapbox/tippecanoe)
 - Install Node (v4 or higher)
 - Clone this repo and run `npm install`

## Processing the data

Put raw microgrid output data in the `data/raw` directory (which you'll need
to create), and then run:

`make data/ug.mbtiles`

This does a few things:
1. Converts the shapefiles to geojson (in `data/geojson`)
2. Merges each "type" of data into a single geojson: `Customers`, `Generator`, `Network`, `Transformer`.  The features from each individual file are given two new properties: `voltage` and `id`, which are inferred from the original file names.  (This step can easily be replaced if a different scheme is used later.)
3. Use `tippecanoe` to slice this data up into Mapbox Vector Tiles.

From here, the `mbtiles` file can be uploaded directly within Mapbox Studio and then used in a new or existing map style.

## Building & deploying the frontend

Just run `npm run bundle`, which updates the the bundled javascript file in `dist/`, and then commit the change to github.
