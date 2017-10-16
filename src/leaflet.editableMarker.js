/*
 Leaflet.orientedmarker, Provides dynamic orientation functionality for Leaflet markers.
 https://github.com/gismartwaredev/leaflet.orientedMarker
 (c) 2015, Alexandre DAVID (http://github.com/alexandreDavid), GiSmartware
 */
(function(window, document, undefined) {
    L.OrientedMarker = L.Marker.extend({
        options: {
            angle: 0,
            orientationLineColor: 'red',
            orientationLineWeight: 5,
            orientationLineOpacity: 0.8
        },
        /**
         * Set the angle.
         * @param {number} angle - some degree to set the angle
         * @returns {void}
         */
        setAngle: function(angle) {
            this.options.angle = angle;
            this._updateImg();
        },

        /**
         * Add degree to the angle.
         * @param {number} angle - some degree to add to the angle
         * @returns {number} The new angle
         */
        rotate: function(angle) {
            this.options.angle += angle;
            this._updateImg();
            return this.options.angle;
        },

        _setPos: function(pos) {
            L.Marker.prototype._setPos.call(this, pos);
            this._initIconStyle = this._icon.style[L.DomUtil.TRANSFORM] + '';
            this._updateImg();
        },
        _updateImg: function() {
            var anchor = this.options.icon.options.iconAnchor,
                icon, size;
            if (this._icon) {
                icon = this._icon;
                size = this.options.icon.options.iconSize;
                this.rotateIcon(icon, anchor, size)
            }
            if (this._shadow) {
                size = this.options.icon.options.shadowSize;
                icon = this._shadow;
                this.rotateIcon(icon, anchor, size)
            }
        },
        rotateIcon: function(icon, anchor, size) {
            if (!size) {
                icon.style[L.DomUtil.TRANSFORM] = this._initIconStyle + ' rotate(' + this.options.angle + 'deg)';
                return;
            }
            anchor = L.point(size).divideBy(2)._subtract(L.point(anchor));
            var transform = '';
            transform += ' translate(' + -anchor.x + 'px, ' + -anchor.y + 'px)';
            transform += ' rotate(' + this.options.angle + 'deg)';
            transform += ' translate(' + anchor.x + 'px, ' + anchor.y + 'px)';
            icon.style[L.DomUtil.TRANSFORM] = this._initIconStyle + ' ' + transform;
        },
        onRemove: function(map) {
            this._orientationLine.onRemove(this._map);
            this._orientationCircle.onRemove(this._map);
            L.Marker.prototype.onRemove.call(this, map);
            return this;
        },
        update: function() {
            L.Marker.prototype.update.call(this);
            if (this._orientationLine) {
                this.activateOrientation();
            }
            return this;
        },
        registerOrientationDragHandler: function() {
            var that = this;
            that.on('drag', function() {
                that.update();
            });
            that.on('dragend', function() {
                that.update();
            });
        },
        activateOrientation: function() {
            var that = this;
            if (!this.orientationActivated) {
                this.orientationActivated = true;
                this.registerOrientationDragHandler();
            }
            this.updateOrientation();
            return that;
        },
        updateOrientation: function() {
            var that = this;
            that._setOrientationDirectionLine();
            that._orientationMouseDown = false;
            that._orientationLine.addTo(that._map);
            that._orientationCircle.addTo(that._map);
            that._orientationLine.on('mousedown', beginOrientation);
            that._orientationCircle.on('mousedown', beginOrientation);
            that._map.on('mousemove', moveOrientation);
            document.onmouseup = stopOrientation;
            // Mobile controls
            that._orientationLine._container.ontouchstart = beginOrientation;
            that._orientationCircle._container.ontouchstart = beginOrientation;
            that._orientationCircle._container.ontouchmove = mobileMoveOrientation;
            that._orientationCircle._container.ontouchmove = mobileMoveOrientation;
            that._orientationCircle._container.ontouchend = stopOrientation;
            that._orientationCircle._container.ontouchend = stopOrientation;

            function beginOrientation() {
                that._savedDragging = that._map.dragging;
                that._savedMouseUp = document.onmouseup;
                that._map.dragging.disable();
                that._orientationMouseDown = true;
            }

            function mobileMoveOrientation(e) {
                if (that._orientationMouseDown) {
                    var touches = e.changedTouches,
                        lastTouch = touches[touches.length - 1];
                    newLatLng = that._map.layerPointToLatLng(
                        that._map.mouseEventToLayerPoint({ clientX: lastTouch.pageX, clientY: lastTouch.pageY })
                    );
                    moveOrientation({ latlng: newLatLng });
                }
            }

            function moveOrientation(e) {
                if (that._orientationMouseDown) {
                    var pointB = new L.LatLng(e.latlng.lat, e.latlng.lng);
                    that._orientationLine.setLatLngs([that._latlng, pointB]);
                    that._orientationCircle.setLatLng(pointB);
                    that._setAngle();
                    that.fire('rotateend');
                }
            }

            function stopOrientation() {
                if (that._orientationMouseDown) {
                    that._orientationMouseDown = false;
                    that._map.dragging.enable();
                    that._setAngle();
                    that.fire('rotateend');
                }
            }
        },
        _setOrientationDirectionLine: function() {
            if (this._orientationLine) {
                this._map.removeLayer(this._orientationLine);
                this._map.removeLayer(this._orientationCircle);
            }
            var transformation = new L.Transformation(
                    1, Math.sin(this.options.angle * Math.PI / 180) * 100,
                    1, Math.cos(this.options.angle * Math.PI / 180) * -100
                ),
                pointB = this._map.layerPointToLatLng(
                    transformation.transform(this._map.latLngToLayerPoint(this._latlng))
                );
            var pointList = [this._latlng, pointB];
            this._orientationLine = new L.Polyline(pointList, {
                color: this.options.orientationLineColor,
                weight: this.options.orientationLineWeight,
                opacity: this.options.orientationLineOpacity,
                smoothFactor: 1
            });
            this._orientationCircle = new L.circleMarker(pointB, {
                radius: this.options.orientationLineWeight * 2,
                color: this.options.orientationLineColor,
                fillColor: this.options.orientationLineColor,
                fillOpacity: this.options.orientationLineOpacity
            });
        },
        _orientationMouseDown: false,
        _savedDragging: false,
        _savedMouseUp: false,
        validateOrientation: function(callback) {
            if (!this._orientationLine) {
                return this;
            }
            this._map.dragging = this._savedDragging;
            document.onmouseup = this._savedMouseUp;
            this._orientationLine.onRemove(this._map);
            this._orientationCircle.onRemove(this._map);
            this._orientationLine = false;
            this._orientationCircle = false;
            return this;
        },
        _setAngle: function() {
            var A = this._orientationLine._parts[0][0],
                B = this._orientationLine._parts[0][1];
            this.options.angle = (Math.atan2(0, 1) - Math.atan2((B.x - A.x), (B.y - A.y))) * 180 / Math.PI + 180;
            this.options.correctedAngle = (Math.atan2(0, 1) - Math.atan2((B.y - A.y), (B.x - A.x))) * 180 / Math.PI;
            this._updateImg();
        },
        _initIconStyle: false,
        _orientationLine: false,
        _orientationCircle: false
    });
    L.orientedMarker = function(pos, options) {
        return new L.OrientedMarker(pos, options);
    };
}(window, document));
