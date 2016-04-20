# REM model interactive web map demo

This repo is intended as an example/demo of taking the output from the [REM model developed at MIT Tata center](http://tatacenter.mit.edu/portfolio/rem-a-planning-model-for-rural-electrification/) and quickly visualizing those results on an interactive web map.

[Working demo]()

## Installation

To get set up, first:
 - Install [tippecanoe](https://github.com/mapbox/tippecanoe)
 - Install csvkit (`pip install csvkit`)
 - Install Node (v4 or higher)
 - Clone this repo and run `npm install`

## Processing the data

Drop the raw output data in the `data/raw` directory (which you'll need to
create), and then run:

 - `make data/rem-customer-model.mbtiles` to make the customer locations data source.
 - `make data/rem-output/MODEL_RUN.mbtiles`, where `MODEL_RUN` should match up with the name of a top-level subdirectory of `data/raw` (e.g. if there's data for a run in `data/raw/Vaishali_Run_1`, then you'd do `make data/rem-output/Vaishali_Run_1.mbtiles`)
 - (Alternatively, `make all-models` will attempt to build a model for each subdirectory of `data/raw` -- use it like `make all-models -j 8` to take advantage of parallelization).

This does a few things:
1. Converts the shapefiles to geojson (in `data/geojson`)
2. Merges each "type" of data into a single geojson: `Customers`, `Generator`, `Network`, `Transformer`.  The features from each individual file are given two new properties: `voltage` and `network_type`, which are inferred from the original file names.  (This step can easily be replaced if a different scheme is used later.)
3. Use `tippecanoe` to slice this data up into Mapbox Vector Tiles.

Now you can do:
```sh
# You'll need a Mapbox API token with uploads:write scope granted
export MapboxAccessToken=YOUR_TOKEN
make upload-model-runs MB_ACCOUNT=your_mapbox_account
```

## Building & deploying the frontend

Configure the Mapbox account details and specific tilesets (data sources) by editing `app/config.js`

Then, to build, just run `npm run bundle`, which updates the the bundled javascript file in `dist/`, and then commit the change to github.

