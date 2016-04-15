
MB_ACCOUNT ?= devseed
TILESET_PREFIX ?= rem-demo
INPUT_DATA ?= data/raw

data/geojson:
	mkdir -p $@
	./scripts/to-geojson $(INPUT_DATA) $@

data/merged/input-customers.json:
	./scripts/merge -p elect='no_elect|elect' -o $@ data/geojson/*CustomersBySD*.geojson

data/merged/%.json: data/geojson
	mkdir -p $(dir $@)
	./scripts/merge -p id='C\d+R\d+' -p voltage='LV|MV|HV' -p network_type='ext|ug' -o $@ data/geojson/*?V_$*_*json

data/rem-output.mbtiles: data/merged/Customers.json data/merged/Generator.json data/merged/Network.json data/merged/Transformers.json
	tippecanoe -o $@ -n rem $^

data/rem-customer-model.mbtiles: data/merged/input-customers.json
	tippecanoe -o $@ $^

data/style.json:
	STYLE_ID=$(shell node -e 'console.log(require("./app/style.json").id)')
	cat app/style.json | \
		sed 's/MB_ACCOUNT/$(MB_ACCOUNT)/g' | \
		sed 's/TILESET_PREFIX/$(TILESET_PREFIX)/g' | \
		sed 's/STYLE_ID/$(STYLE_ID)/g'> $@

.PHONY: upload
upload: data/rem-output.mbtiles data/rem-customer-model.mbtiles
	node_modules/.bin/mapbox-upload $(MB_ACCOUNT).$(TILESET_PREFIX)-output data/rem-output.mbtiles
	node_modules/.bin/mapbox-upload $(MB_ACCOUNT).$(TILESET_PREFIX)-customers data/rem-customer-model.mbtiles

.PHONY: clean
clean:
	rm -rf data/geojson data/merged data/*.mbtiles
