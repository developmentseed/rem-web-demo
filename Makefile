
INPUT_DATA ?= data/raw
data/geojson:
	mkdir -p $@
	./scripts/to-geojson $(INPUT_DATA) $@

data/ug/%.json:
	mkdir -p $(dir $@)
	./scripts/merge -p id='C\d+R\d+' -p voltage='LV|MV|HV' -o $@ data/geojson/*$**json

data/ug.mbtiles: data/ug/Customers.json data/ug/Generator.json data/ug/Network.json data/ug/Transformers.json
	tippecanoe -o $@ -n rem $^
