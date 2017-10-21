# leaflet.editableMarker
==================

Leaflet EditableMarker is a [Leaflet](http://leafletjs.com/) plugin which allows to tarnsform size and angle of Markers interactively.
Forked from great plugin [Leaflet.orientedmarker](https://github.com/gismartwaredev/leaflet.orientedMarker) by [Alexandre DAVID](http://github.com/alexandreDavid)

Demo
----

[Simple example](https://yarsky-tgz.github.io/leaflet.editableMarker/examples/simple-example.html)

Installation
------------

`npm install leaflet-editable-marker`

Simple example
--------------

This example adds marker and turns on transformation mode:
```		
L.editableMarker([45.801104, 4.775398], {
    angle: 45,
    percent: 150
}).addTo(map).activateTransformation();
```

Methods
-------

**activateTransformation()** 

Activates transformation mode

**finishTransformation()** 

Exit transformation mode (finish editing with saved changes)

**setAngle(angle)** 

Set angle in deg, number

**setPercent(percent)**

Set size percentage, number