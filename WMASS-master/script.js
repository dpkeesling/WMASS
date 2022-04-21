'use strict'

// Create the map object
var map = L.map('map').setView([51.505, -0.09], 13);
var markers = new Array();
var polylines = new Array();
var marker;

// Create a tile layer for the map images
// We couldn't find any way to do this other than via the Mapbox CDN
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
        iconSize: [38, 95]
    }
});

var greenIcon = new LeafIcon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Information_icon4_orange.svg'
});

// Load all of the Shapefile and Excel data.
async function loadShapefilesAndExcelFiles() {
    // Adds all shapefiles in countries.zip to the map
    // Todo: prompt the user for this zip file instead of hardcoding
    let shapefile = L.shapefile("http://localhost/shapefiles/countries.zip")
    shapefile.addTo(map)

    // Open the info popup when the shapefile is clicked
    shapefile.on('click', function (e) {
        let info = []
        shapefile.getLayers().forEach(layer => {
            info.push(JSON.stringify(layer.feature.properties))
        });
        shapefile.bindPopup(info.toString())
        shapefile.openPopup()
    })

    // Since we join the Excel data to the shapefile data, we need to ensure the shapefile data is loaded before we can continue.
    while (shapefile.getLayers().length == 0) {
        await new Promise(r => setTimeout(r, 1000));
    }

    // Get the Excel file
    let xlsxFile
    let countryExcelData
    let combinedCountryData = [] // Country data (excel + shapefile)
    let xlsxCellData = {}   // JSON object where each key is the column name and each value is an array of row values
    fetch("http://localhost/excel/WaterModule_ex.xlsx")
        .then(response => response.arrayBuffer())
        .then(buffer => {
            xlsxFile = XLSX.read(new Uint8Array(buffer, { type: 'array' }));
            // This is where we can specify which XLSX sheet we are grabbing
            countryExcelData = xlsxFile.Sheets.countries
            let currentPosition = [0, 0]    // Current position in Excel file (column, row)
            let parsedRow   // Parsed row number
            let headingRow  // Stores the number of the row that contains the column headings.  We are assuming that this is constant
            let columnHeadings = []     // String array of each of the column headings
            for (var key in countryExcelData) {
                if (!key.match(/\d+/)) {
                    // If the key from the Excel document does not contain an integer, skip this iteration
                    continue
                }
                parsedRow = key.match(/\d+/)[0]     // Grab the integer from the current row/column; this will be the row (e.g. A10 -> 10)
                if (parsedRow > currentPosition[1]) {
                    // If we moved to the next row, set our position as such
                    currentPosition = [1, parseInt(parsedRow)]
                }
                if (countryExcelData[key].w) {
                    if (countryExcelData[key].w.charAt(0) == 'n') {
                        // Todo: This is a BIG assumption.  We are assuming that the first column heading begins with a lowercase 'n'.
                        // This is how we are determining which row contains the column headings.  This seems like a safe assumption for now,
                        // but it certainly does not seem to be a futureproof solution.
                        headingRow = currentPosition[1]
                    }
                    if (headingRow) {
                        if (currentPosition[1] == headingRow) {
                            // If we found the heading row and we are currently navigating through the heading row, record each column heading.
                            xlsxCellData[countryExcelData[key].w] = []
                            columnHeadings[currentPosition[0]] = countryExcelData[key].w
                        }
                        else if (currentPosition[1] > headingRow) {
                            // If we have surpassed the row number that contains the column headings, then we know we are dealing with legit
                            // data that we need to record.
                            xlsxCellData[columnHeadings[currentPosition[0]]].push(countryExcelData[key].w)
                        }
                    }
                }
                // Increment the column position
                currentPosition[0]++
            }

            // Loop through all of our shapefile/excel data and join them together for each country
            for (var i = 0; i < xlsxCellData.ncountry.length; i++) {
                shapefile.getLayers().forEach(shapefileLayer => {
                    let curJson = shapefileLayer.feature.properties
                    if (curJson.ncountry == xlsxCellData.ncountry[i]) {
                        for (const [key, value] of Object.entries(xlsxCellData)) {
                            curJson[key] = value[i]
                        }
                        // Push the current JSON onto the combined array
                        combinedCountryData.push(curJson)
                    }
                });
            }
        })
        .catch(err => console.error(err));

    return combinedCountryData
}
loadShapefilesAndExcelFiles().then(function (results) {
    // This stores all of the country data.  It is a combination of the shapefile and Excel file data.
    // Any processing should be done here.
    let countryData = results
    console.log(countryData)
    // ...
})

// Create a FeatureGroup for any items the user draws
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Specifications for the toolbox at the right of the screen and what each option draws
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
        rect: {
            shapeOptions: {
                color: 'green'
            },
        },
        circle: {
            shapeOptions: {
                color: '#fff',
                fillColor: '#fff',
                fillOpacity: 0.5
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

// Converts an individual color component to a hex value
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

// Coverts the given RGB values to hex
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Real-time JSON blob of map data
let jsonMapData = {
    marker: {

    },
    circle: {
        hydroPowerPlants: []
    }
}

// Basic class for any map object
class MapObject {
    constructor(id, popupHtml, customProperties) {
        this.id = id
        this.popupHtml = popupHtml
        this.customProperties = customProperties
    }
}

/**
 * Creates a hydro power plant (circle) with relevant HTML for the popup.
 * Adds the MapObject to the map's JSON blob
 * @param {Layer} layer Leaflet Map Layer to add the object to
 * @returns the new MapObject
 */
function createHydroPowerPlant(layer) {
    // Create all the HTML for the popup
    let hydroPowerPlantId = Object.keys(jsonMapData.circle.hydroPowerPlants).length
    let waterAllocSpanId = "waterAllocSpan" + hydroPowerPlantId
    let waterAllocSliderId = "waterAllocSlider" + hydroPowerPlantId
    let contentDivId = "contentDiv" + hydroPowerPlantId

    let popupHtml = document.createElement("div")
    popupHtml.id = contentDivId

    let popupText = document.createElement("b")
    popupText.innerHTML = "Water allocation:  "
    popupHtml.appendChild(popupText)

    let waterAllocSpan = document.createElement("span")
    waterAllocSpan.id = waterAllocSpanId
    waterAllocSpan.innerHTML = "0"
    popupHtml.appendChild(waterAllocSpan)
    popupHtml.appendChild(document.createElement("br"))

    let waterAllocSlider = document.createElement("input")
    waterAllocSlider.type = "range"
    waterAllocSlider.min = "0"
    waterAllocSlider.max = "100"
    waterAllocSlider.value = "0"
    waterAllocSlider.id = waterAllocSliderId
    waterAllocSlider.oninput = function (e) {
        let colorValue = Math.floor(waterAllocSlider.value * 2.55)
        let rg = 255 - colorValue
        let newColor = rgbToHex(rg, rg, 255)
        layer.setStyle({ color: newColor, fillColor: newColor });

        document.getElementById(waterAllocSpanId).innerHTML = waterAllocSlider.value;
    }
    popupHtml.appendChild(waterAllocSlider)

    // Create a new MapObject and add it to our feature layer
    let newObject = new MapObject(hydroPowerPlantId, popupHtml.textContent, null)
    jsonMapData.circle.hydroPowerPlants[hydroPowerPlantId] = JSON.stringify(newObject)

    layer.addTo(map).bindPopup(popupHtml)

    return newObject
}

// Handle what happens when the user draws a shape on the map
map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;
    if (type === 'marker') {
        layer.bindPopup('A popup!');
    }
    else if (type === 'circle') {
        // Circles represent hydro power plants for now
        createHydroPowerPlant(layer)
    }

    // Add the new map layer to our collection of drawn items
    drawnItems.addLayer(layer);
});
map.on('click', function (e) {
    // Create a marker when the user clicks on the map
    marker = new L.Marker(e.latlng, {
        contextmenu: true,
        contextmenuItems: [{
            text: "remove marker",
            callback: function () {
                pullmarker();
            }
        }]
    });
    map.addLayer(marker);
    markers.push(marker);
    var longMarker = markers.length;
    var test = new Array();

    // create a red polyline from an array of LatLng points
    if (markers.length > 1) {
        for (let i = 0; i < markers.length; i++) {
            test.push(markers[i].getLatLng());
        }
        var polyline = L.polyline(test, { color: 'red', clickable: 'true' }).addTo(map);
        polylines.push(polyline);
    }
});

// Add option for user to remove a marker from the map
map.on('contextmenu', (e) => {
    L.popup()
        .setLatLng(e.latlng)
        .setContent('<button onclick="pullmarker()">Remove last marker</button>')
        .addTo(map)
        .openOn(map);
});
function pullmarker() {
    let m = markers.pop();
    map.removeLayer(m);
    let p = polylines.pop();
    map.removeLayer(p);
}

// When the user right-clicks, convert data on the map to a CSV file and download it
// Todo: this currently only converts the markers on the map to CSV data.
// This is currently unused, but the code might be useful for the future.
function onRightClick(e) {

    var coord = e.latlng.toString().split(',');
    var lat = coord[0].split('(');
    var long = coord[1].split(')');
    const marker = L.marker([lat[1], long[0]], {
        draggable: false,
    });

    marker.addTo(map).bindPopup("LAT: " + lat[1] + " LONG:" + long[0]);

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

    // Create and format the CSV
    var json = collection.features
    var fields = Object.keys(json[0])
    var replacer = function (key, value) { return value === null ? '' : value }
    var csv = json.map(function (row) {
        return fields.map(function (fieldName) {
            return JSON.stringify(row[fieldName], replacer)
        }).join(',')
    })
    csv.unshift(fields.join(',')) // add header column
    csv = csv.join('\r\n');

    console.log(csv);

    marker.on('click', function (e) {
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'data.csv';
        hiddenElement.click();
    })
}

// Set properties for the hydro power plant icon
var LeafIcon = L.Icon.extend({
    options: {
        // Set the size
        iconSize: [38, 95]
    }
});

// This image is just a placeholder.  It can be anything
var greenIcon = new LeafIcon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Information_icon4_orange.svg'
});

let objectsJson;

let prior_level = 13

$(document).ready(function () {
    // Acquire data from xlsx and shapefiles
    // use loops and if statements to determine how many of each type of object is needed, and whether we need more than one of those objects
    // Name using objectName#
    const reservoir0 = new Reservoir(/* read data from xlsx and shapefiles */ "ur mom", 69, 69, 69, 69, 69, 69, 69)

    // Loop through the properties of the object and put it into a readable string
    let reservoir0PopupString = ""
    let obj = reservoir0
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            reservoir0PopupString += prop + ": " + obj[prop] + "\n"
        }
    }
    // Puts the marker on the map
    let reservoir0Marker = new L.CircleMarker([-15.38, 28.32], {
        radius: reservoir0.radius,
        color: reservoir0.color,
        // Doesn't work draggable: true
    }).addTo(map).bindPopup(reservoir0PopupString).openPopup()

    // TODO: Improve zoom scaling
    map.on('zoomend', function () {
        var currentZoom = map.getZoom();
        console.log(currentZoom)
            (prior_level > currentZoom) ? (reservoir0.radius /= 2) : (reservoir0.radius *= 2)
        myMarker.setRadius(reservoir0.radius)
    });
});