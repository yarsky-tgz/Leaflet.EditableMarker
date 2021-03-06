/*
 Leaflet.orientedmarker, Provides dynamic transformation functionality for Leaflet markers.
 https://github.com/gismartwaredev/leaflet.orientedMarker
 (c) 2015, Alexandre DAVID (http://github.com/alexandreDavid), GiSmartware

 Leaflet.editableMarker, Provides dynamic rotate & resize functionality for Leaflet markers
 https://github.com/yarsky-tgz/leaflet.editableMarker
 (c) 2017, Yaroslav Dobzhanskij (http://github.com/yarsky-tgz)
 */
(function (window, document) {
  var RESIZE_ICON = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 26 26"><style>path {fill:@color@;}</style><g><path d="m 4.87875,16 c 0.553,0 1,-0.448 1,-1 0,-0.552 -0.447,-1 -1,-1 h -1.465 l 3.293,-3.293 c 0.391,-0.391 0.391,-1.023 0,-1.414 C 6.51175,9.098 6.25575,9 5.99975,9 c -0.256,0 -0.512,0.098 -0.707,0.293 l -3.414,3.414 V 11 c 0,-0.552 -0.447,-1 -1,-1 -0.553,0 -0.879,0.448 -0.879,1 v 5 z"/><path d="M 3.1780031,7.0961372 C 3.7286584,7.0576316 4.1443163,6.579472 4.1058106,6.0288167 L 3.9662977,4.0336885 5.9614258,3.8941756 C 6.5130787,3.8556002 6.9277389,3.3775105 6.8892334,2.8268551 6.8507278,2.2761997 6.3735658,1.8604722 5.8219129,1.8990475 L 1.8326542,2.1780037 2.1106826,6.1683296 c 0.038506,0.5506553 0.5156676,0.9663829 1.0673205,0.9278076 z"/><path d="m 13.173162,9.110767 c -0.551652,-0.038575 -1.028815,0.3771522 -1.06732,0.927808 l -0.139514,1.995127 -1.9951282,-0.139514 c -0.5516529,-0.03857 -1.028815,0.377153 -1.0673205,0.927808 -0.038505,0.550655 0.3761547,1.028745 0.9278075,1.067321 l 3.9902562,0.279026 0.279026,-3.990256 c 0.03851,-0.5506548 -0.376154,-1.0287447 -0.927807,-1.06732 z"/><path d="m 10.70725,6.7072496 3.293,-3.293 v 1.586 c 0,0.552 0.447,1 1,1 0.553,0 1,-0.448 1,-1 V 2.4944035e-4 h -5 c -0.552,0 -1,0.44799999965 -1,1.00000015965 0,0.552 0.447,1 1,1 h 1.586 l -3.2929999,3.292 c -0.391,0.391 -0.391,1.023 0,1.414 0.391,0.391 1.0229999,0.392 1.4139999,0.001 z"/></g></svg>';
  var RULER_ZINDEX_OFFSET = 2002;
  var origin = L.Marker;
  L.EditableMarker = L.Marker.extend({
    options: {
      angle: 0,
      percent: 100,
      rulerSize: [32, 32],
      rulerColor: '#4286f4',
      rulerBackground: '#dadada',
      rulerOpacity: 0.5,
      rulerBorderWidth: 2
    },
    /**
     * Set the angle.
     * @param {number} angle - some degree to set the angle
     * @returns {void}
     */
    setAngle: function (angle) {
      this.options.angle = angle;
      this._updateImg();
    },
    /**
     * Set the size percents
     * @param {number} percent
     * @returns {void}
     */
    setPercent: function (percent) {
      this.options.percent = percent;
      this._updateImg();
    },
    /**
     * Add degree to the angle.
     * @param {number} angle - some degree to add to the angle
     * @returns {number} The new angle
     */
    rotate: function (angle) {
      this.options.angle += angle;
      this._updateImg();
      return this.options.angle;
    },
    _setPos: function (pos) {
      origin.prototype._setPos.call(this, pos);
      this._initIconStyle = this._icon.style[L.DomUtil.TRANSFORM] + '';
      this._updateImg();
    },
    _updateImg: function () {
      var anchor = this.getAnchor(), icon = this._icon, size = this.getSize();
      icon.style['width'] = size[0] + 'px';
      icon.style['height'] = size[1] + 'px';
      icon.style['marginLeft'] = '-' + anchor[0] + 'px';
      icon.style['marginTop'] = '-' + anchor[1] + 'px';
      icon.style[L.DomUtil.TRANSFORM] = this._initIconStyle + ' rotate(' + this.options.angle + 'deg)';
      this._updateRuler();
    },
    _updateRuler: function () {
      if (!this._rulerIconElement) {
        return;
      }
      var rulerInitialTransform = this._rulerIconElement.style[L.DomUtil.TRANSFORM];
      rulerInitialTransform = rulerInitialTransform.replace(/rotate\(.+\)/, '');
      var angle = ((this.options.angle - 45) < 0) ? 360 + this.options.angle - 45 : this.options.angle - 45;
      this._rulerIconElement.style[L.DomUtil.TRANSFORM] = rulerInitialTransform + 'rotate(' + angle + 'deg)';
    },
    _initRulerElement: function () {
      this._rulerIconElement = this._transformationRuler.getIcon();
      this._renderRulerInit();
      this._transformationRuler.setZIndexOffset(RULER_ZINDEX_OFFSET);
      this._updateRuler();
    },
    _renderRulerInit: function () {
      this._rulerIconElement.style.borderRadius = '50%';
      this._rulerIconElement.style.backgroundColor = this.options.rulerBackground;
      this._rulerIconElement.style.transformOrigin = '50% 50%';
      this._rulerIconElement.style.borderWidth = this.options.rulerBorderWidth + 'px';
      this._rulerIconElement.style.borderColor = this.options.rulerColor;
      this._rulerIconElement.style.borderStyle = 'solid';
      this._rulerIconElement.style.opacity = this.options.rulerOpacity;
    },
    getSize: function () {
      var mul = this.options.percent / 100;
      var iconOptions = this.options.icon.options;
      return [
        iconOptions.iconSize[0] * mul, iconOptions.iconSize[1] * mul
      ];
    },
    getAnchor: function () {
      var mul = this.options.percent / 100;
      var iconOptions = this.options.icon.options;
      return [
        iconOptions.iconAnchor[0] * mul, iconOptions.iconAnchor[1] * mul
      ];
    },
    onAdd: function (map) {
      origin.prototype.onAdd.call(this, map);
      var rulerUri = encodeURI("data:image/svg+xml," + RESIZE_ICON.replace('@color@', this.options.rulerColor)).replace('#', '%23');
      this._rulerIcon = new L.Icon({
        iconUrl: rulerUri,
        iconSize: this.options.rulerSize
      });
    },
    onRemove: function (map) {
      this._transformationRuler.onRemove(this._map);
      origin.prototype.onRemove.call(this, map);
      return this;
    },
    update: function () {
      origin.prototype.update.call(this);
      if (this._transformationRuler) {
        this.activateTransformation();
      }
      return this;
    },
    registerTransformationDragHandler: function () {
      var that = this;
      that.on('drag', function () {
        that.update();
      });
      that.on('dragend', function () {
        that.update();
      });
    },
    activateTransformation: function () {
      var iconOptions = this.options.icon.options;
      var xPercent = ((iconOptions.iconAnchor[0] / iconOptions.iconSize[0]) * 100);
      var yPercent = ((iconOptions.iconAnchor[1] / iconOptions.iconSize[1]) * 100);
      var that = this;
      this._icon.style.transformOrigin = xPercent + "% " + yPercent + "%";
      if (!this.transformationActivated) {
        this.transformationActivated = true;
        this.registerTransformationDragHandler();
      }
      this.updateTransformation();
      return that;
    },
    updateTransformation: function () {
      var that = this;
      that._setTransformationRuler();
      that._transformationMouseDown = false;
      that._transformationRuler.addTo(that._map);
      that._transformationRuler.on('mousedown', beginTransformation);
      that._transformationRuler.on('mouseup', stopTransformation);
      that._initRulerElement();
      that._map.on('mousemove', moveTransformation);
      function beginTransformation() {
        that._savedDragging = that._map.dragging;
        that._map.dragging.disable();
        that._transformationMouseDown = true;
      }
      function mobileMoveTransformation(e) {
        if (that._transformationMouseDown) {
          var touches = e.changedTouches, lastTouch = touches[touches.length - 1];
          var newLatLng = that._map.layerPointToLatLng(that._map.mouseEventToLayerPoint({
            clientX: lastTouch.pageX,
            clientY: lastTouch.pageY
          }));
          moveTransformation({ latlng: newLatLng });
        }
      }
      function moveTransformation(e) {
        if (that._transformationMouseDown) {
          var pointB = new L.LatLng(e.latlng.lat, e.latlng.lng);
          that._transformationRuler.setLatLng(pointB);
          that._setAngle();
          that.fire('rotateend');
        }
      }
      function stopTransformation() {
        if (that._transformationMouseDown) {
          that._transformationMouseDown = false;
          that._map.dragging.enable();
          that._setAngle();
          that.fire('rotateend');
        }
      }
    },
    _setTransformationRuler: function () {
      if (this._transformationRuler) {
        this._map.removeLayer(this._transformationRuler);
      }
      var size = this.getSize();
      var transformation = new L.Transformation(1, Math.sin(this.options.angle * Math.PI / 180) * (size[1]), 1, Math.cos(this.options.angle * Math.PI / 180) * (0 - size[1]));
      var pointB = this._map.layerPointToLatLng(transformation.transform(this._map.latLngToLayerPoint(this._latlng)));
      this._transformationRuler = new origin(pointB, {
        icon: this._rulerIcon
      });
    },
    finishTransformation: function () {
      if (!this._transformationRuler) {
        return this;
      }
      this._map.dragging = this._savedDragging;
      this._transformationRuler.onRemove(this._map);
      this._transformationRuler = false;
      return this;
    },
    _setAngle: function () {
      var A = this._map.latLngToLayerPoint(this._latlng);
      var B = this._map.latLngToLayerPoint(this._transformationRuler.getLatLng());
      var distance = A.distanceTo(B);
      this.options.percent = (distance / this.options.icon.options.iconSize[1]) * 100;
      this.options.angle = (Math.atan2(0, 1) - Math.atan2((B.x - A.x), (B.y - A.y))) * 180 / Math.PI + 180;
      this._updateImg();
    },
    _transformationMouseDown: false,
    _savedDragging: false,
    _initIconStyle: false,
    _transformationRuler: false,
    _rulerIcon: false,
    _rulerIconElement: false
  });
  origin.include({
    getIcon: function () {
      return this._icon;
    }
  });
  L.editableMarker = function (pos, options) {
    return new L.EditableMarker(pos, options);
  };
}(window, document));
