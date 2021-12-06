	// LEAFLET

	var map = L.map('map').setView([51.505, -0.09], 13);

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1
	}).addTo(map);

	L.marker([51.5, -0.09], {
		draggable: true,
		color: 'red',
	}).addTo(map)
		.bindPopup("<b>Hello world!</b>").openPopup();

	const circle = L.circle([51.508, -0.11], 500, {
		color: '#fff',
		fillColor: '#fff',
		fillOpacity: 0.5,
		draggable: true
	}).addTo(map).bindPopup("<b>Hello world!</b><br /><input type=\"text\" id=\"testTextBox\" onkeyup=\"updateCircleColor(this.value)\">");

	const polygon = L.polygon([
		[51.509, -0.08],
		[51.503, -0.06],
		[51.51, -0.047]
	], {
		color: '#fff',
		fillColor: '#fff',
		fillOpacity: 0.5
	}).addTo(map).bindPopup("<b>Hydropower Plant</b><br />Water allocation: <span id=\"waterAlloc\">0</span><br /><input type=\"range\" min=\"0\" max=\"100\" value=\"0\" id=\"testSlider\" oninput=\"updatePolygonColor(this.value)\">");

	var popup = L.popup();

	function onMapClick(e) {
		popup
			.setLatLng(e.latlng)
			.setContent("You clicked the map at " + e.latlng.toString())
			.openOn(map);
	}

	map.on('click', onMapClick);

	
	// FUNCTIONS

	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}

	function updateCircleColor(value) {
		if(isNaN(value) || value < 0){
			return
		}

		let gb = (value > 255 ? 0 : 255 - value)
		let newColor = rgbToHex(255, gb, gb)
		circle.setStyle({color: newColor, fillColor: newColor});
	}

	function updatePolygonColor(value) {
		let colorValue = Math.floor(value * 2.55)
		// alert(colorValue)
		let rg = 255 - colorValue
		let newColor = rgbToHex(rg, rg, 255)
		polygon.setStyle({color: newColor, fillColor: newColor});

		document.getElementById("waterAlloc").innerHTML = value;
	}

	function onRightClick(e){

		var coord=e.latlng.toString().split(',');
        var lat=coord[0].split('(');
        var long=coord[1].split(')');
        //alert("you clicked the map at LAT: "+ lat[1]+" and LONG:"+long[0])
        marker = L.marker([lat[1], long[0]], {
            draggable: false,
        });

		marker.addTo(mymap).bindPopup("LAT: "+ lat[1]+" LONG:"+long[0]);

		var geojson = marker.toGeoJSON();
		alert(geojson)

		var collection = {
			"type": "FeatureCollection",
			"features": []
		};

		// Iterate the layers of the map
		mymap.eachLayer(function (layer) {
			// Check if layer is a marker
			if (layer instanceof L.Marker) {
				// Create GeoJSON object from marker
				var geojson = layer.toGeoJSON();
				// Push GeoJSON object to collection
				collection.features.push(geojson);
			}
		});

		var json = collection.features
		var fields = Object.keys(json[0])
		var replacer = function(key, value) { return value === null ? '' : value } 
		var csv = json.map(function(row){
		return fields.map(function(fieldName){
			return JSON.stringify(row[fieldName], replacer)
			}).join(',')
		})
		csv.unshift(fields.join(',')) // add header column
		csv = csv.join('\r\n');
			
		console.log(csv);

		marker.on('click', function(e){
			var hiddenElement = document.createElement('a');
			hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
			hiddenElement.target = '_blank';
			hiddenElement.download = 'people.csv';
			hiddenElement.click();
		})
	}