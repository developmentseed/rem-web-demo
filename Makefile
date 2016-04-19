
MB_ACCOUNT ?= devseed
TILESET_PREFIX ?= rem
INPUT_DATA ?= data/raw

data/geojson:
	mkdir -p $@
	./scripts/to-geojson $(INPUT_DATA) $@

data/merged/input-customers.json:
	./scripts/merge -p elect='no_elect|elect' -o $@ data/geojson/*CustomersBySD*.geojson

dirname = $(patsubst %/,%,$(dir $1))

data/merged/%: data/geojson
	mkdir -p $@
	./scripts/merge -p voltage='LV|MV|HV' -p network_type='ext|ug' -o $@/Generator.json \
		'data/geojson/$**Generator_*json'
	./scripts/merge -p voltage='LV|MV|HV' -p network_type='ext|ug' -o $@/Transformers.json \
		'data/geojson/$**Transformers_*json'
	./scripts/merge -p voltage='LV|MV|HV' -p network_type='ext|ug' -o $@/Network.json \
		'data/geojson/$**Network_*json'
	./scripts/merge -p voltage='LV|MV|HV' -p network_type='ext|ug' -o $@/Customers.json \
		'data/geojson/$**Customers_*json'

data/rem-customer-model.mbtiles: data/merged/input-customers.json
	tippecanoe -o $@ $^

data/rem-output/%.mbtiles: data/merged/%
	mkdir -p $(dir $@)
	tippecanoe -o $@ -n rem -z14 -b14 data/merged/$*/*.json

.PHONY: upload-customers upload-model-runs
upload-customers: data/rem-customer-model.mbtiles
	node_modules/.bin/mapbox-upload $(MB_ACCOUNT).$(TILESET_PREFIX)-customers data/rem-customer-model.mbtiles

MODEL_RUNS := $(wildcard data/rem-output/*.mbtiles)
upload-model-runs:
	for i in $(MODEL_RUNS) ; do \
		node_modules/.bin/mapbox-upload \
			$(MB_ACCOUNT).$(TILESET_PREFIX)-`./scripts/make-id $$i` $$i ; \
	done 

.PHONY: clean
clean:
	rm -rf data/geojson data/merged data/*.mbtiles
