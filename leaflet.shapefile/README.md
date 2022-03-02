leaflet.shapefile
=================

requires [shapefile-js](https://github.com/calvinmetcalf/shapefile-js) plus if you want it
to be done in a worker, you'll need [catiline](https://github.com/calvinmetcalf/catiline).

usage:

```javascript
new L.Shapefile(arrayBuffer or url[,options][,importUrl]);

L.shapefile(arrayBuffer or url[,options][,importUrl]);
```

Options are passed to L.Geojson as is. First argument is either an array buffer of a zipped shapefile,
the url to a zipped shapefile, or the url to file.shp (this assumes file.dbf exists). The importUrl parameter allows you to change where a worker loads in `shp.js` when using [catiline](https://github.com/calvinmetcalf/catiline) and defaults to `shp.js`.

To easily try this out using your own shapefile, see the demo at [leaflet.calvinmetcalf.com](http://leaflet.calvinmetcalf.com/), where you can drag-and-drop your own shapefile and have it displayed on the map.
