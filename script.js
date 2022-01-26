'use strict'

// Create the map object
var map = L.map('map').setView([51.505, -0.09], 13);
        
// Create a tile layer for the map images
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

var LeafIcon = L.Icon.extend({
    options: {
         iconSize:     [38, 95]
    }
});

var greenIcon = new LeafIcon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Information_icon4_orange.svg'
    });

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
        polygon: {
            shapeOptions: {
                color: 'purple'
            },
            allowIntersection: false,
            drawError: {
                color: 'orange',
                timeout: 1000
            },
            showArea: true,
            metric: false,
            repeatMode: true
        },
        polyline: {
            shapeOptions: {
                color: 'red'
            },
        },
polyline: {
  shapeOptions: {
    color: 'blue'
  },
},
        rect: {
            shapeOptions: {
                color: 'green'
            },
        },
        circle: {
            shapeOptions: {
                color: 'steelblue'
            },
        },
        marker: {
            icon: greenIcon
        },
    },
    edit: {
        featureGroup: drawnItems
    }
});
map.addControl(drawControl);

map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'marker') {
        layer.bindPopup('A popup!');
    }

    drawnItems.addLayer(layer);
});

// Create a circle that is colored based on the numerical value in its text box
const circle = L.circle([51.508, -0.11], 500, {
    color: '#fff',
    fillColor: '#fff',
    fillOpacity: 0.5,
    draggable: true
}).addTo(map).bindPopup("<b>Hello world!</b><br /><input type=\"text\" id=\"testTextBox\" onkeyup=\"updateCircleColor(this.value)\">");

// Create a polygon that is colored based on the value slider
const polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
], {
    color: '#fff',
    fillColor: '#fff',
    fillOpacity: 0.5
}).addTo(map).bindPopup("<b>Hydropower Plant</b><br />Water allocation: <span id=\"waterAlloc\">0</span><br /><input type=\"range\" min=\"0\" max=\"100\" value=\"0\" id=\"testSlider\" oninput=\"updatePolygonState(this.value)\">");

// Converts an individual color component to a hex value
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// Coverts the given RGB values to hex
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Changes the color of the circle
function updateCircleColor(value) {
    if(isNaN(value) || value < 0){
        return
    }

    let gb = (value > 255 ? 0 : 255 - value)
    let newColor = rgbToHex(255, gb, gb)
    circle.setStyle({color: newColor, fillColor: newColor});
}

// Update the polygon color and update the text that displays the numerical value in the slider
function updatePolygonState(value) {
    let colorValue = Math.floor(value * 2.55)
    let rg = 255 - colorValue
    let newColor = rgbToHex(rg, rg, 255)
    polygon.setStyle({color: newColor, fillColor: newColor});

    document.getElementById("waterAlloc").innerHTML = value;
}

// When the user right-clicks, convert data on the map to a CSV file and download it
function onRightClick(e){

    var coord=e.latlng.toString().split(',');
    var lat=coord[0].split('(');
    var long=coord[1].split(')');
    //alert("you clicked the map at LAT: "+ lat[1]+" and LONG:"+long[0])
    const marker = L.marker([lat[1], long[0]], {
        draggable: false,
    });

    marker.addTo(map).bindPopup("LAT: "+ lat[1]+" LONG:"+long[0]);

    var geojson = marker.toGeoJSON();
    alert(geojson)

    var collection = {
        "type": "FeatureCollection",
        "features": []
    };

    // Iterate the layers of the map
    map.eachLayer(function (layer) {
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

// Create a popup
var popup = L.popup();

// Display the popup with the coordinates of the user's mouse pointer when they click the map
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

let objectsJson;

$(document).ready(function(){
    
    $.getJSON("objects.json", function(data){
        console.log(data.HydroPowerPlant.imgPath);

        // Reading in JSON data from a server that represents a hydropower plant
        objectsJson = JSON.parse(JSON.stringify(data));

        var powerPlantIcon = L.icon({
            iconUrl: objectsJson.HydroPowerPlant.imgPath,
        
            iconSize:     objectsJson.HydroPowerPlant.iconSize, // size of the icon
            iconAnchor:   objectsJson.HydroPowerPlant.iconAnchor, // point of the icon which will correspond to marker's location
            popupAnchor:  objectsJson.HydroPowerPlant.popupAnchor // point from which the popup should open relative to the iconAnchor
        });

        var reservoirIcon = L.icon({
            iconUrl:      objectsJson.Reservoir.imgPath, 

            iconSize:     objectsJson.Reservoir.iconSize,
            iconAnchor:   objectsJson.Reservoir.iconAnchor, // point of the icon which will correspond to marker's location
            popupAnchor:  objectsJson.Reservoir.popupAnchor // point from which the popup should open relative to the iconAnchor
        });
        

        // The marker that represents the power plant from the JSON data
        L.marker([51.5, -0.09], {
            draggable: true,
            icon: powerPlantIcon
        }).addTo(map)
            .bindPopup("I am a dam that produces " + objectsJson.HydroPowerPlant.powerProduction + " in electricity").openPopup();

        // Marker that represents reservoir data from JSON
        L.marker([51.5, -0.04], {
            draggable: true,
            icon: reservoirIcon
        }).addTo(map)
            .bindPopup("<b>Reservoir Info</b><br/>"+ objectsJson.Reservoir.resCatch + 
            "<br /><input type=\"text\" value=\"\" id=\"reservoirInput\">" + "<br/><input type=\"button\" value=\"Submit\" id=\"submitInfo\">").openPopup();
        

        
        // function setResType(value){
        //     objectsJson.Reservoir.resCatch = value;
        //     document.getElementById("reservoirInput").value =  objectsJson.Reservoir.resCatch;
        //     window.alert(objectsJson.Reservoir.resCatch);
        // }

    }).fail(function(){
        console.log("An error has occurred.");
    });

    // function setResType(value){
    //     objectsJson.Reservoir.resCatch = value;
    //     document.getElementById("reservoirInput").value =  objectsJson.Reservoir.resCatch;
    //     window.alert(objectsJson.Reservoir.resCatch);
    // }

});






