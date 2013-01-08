(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dMapView = ec.Canvas2dMapView = function() {
		this.layers = [];
	};

	var proto = Canvas2dMapView.prototype;

	proto.loadLayers = function(data) {
		var layers = this.layers = data.layers;
		// TODO: preload images
		for (var i=layers.length; i-- > 0;) {
			this.loadLayer(layers[i], data.path);
		}
	};

	proto.loadLayer = function(layer, path) {
		if (layer.visible !== false) {
			layer.visible = true;
		}
		for (var i=layer.elements.length; i-- > 0;) {
			layer.elements[i].loadImages(path);
		}
	};

	proto.getLayers = function() {
		return this.layers || [];
	};

	proto.getItemsInLayer = function(layer, entities, inLayer) {
		inLayer = inLayer || [];
		var elements = layer.elements;
		for (var i = entities.length; i-- > 0;) {
			var entity = entities[i];
			entity.layerNum = -1;
			for (var j=elements.length; j-- > 0;) {
				if (elements[j].isBehindEntity(entity)) {
					entity.layerNum = layer.layerNum;
					entity.layerName = layer.name;
					entities.splice(i, 1);
					inLayer.push(entity);
					break;
				}
			}
		}
		return inLayer;
	};

	proto.draw = function(context, viewport) {
		var layers = this.layers;
		for (var i=layers.length; i-- > 0;) {
			this.drawLayer(layers[i], context, viewport);
		}
	};

	proto.drawLayer = function(layer, context, viewport, delta) {
		if (!layer.visible) {
			return false;
		}
		var elements = layer.elements;
		for (var i=elements.length; i-- > 0;) {
			//elements[i].alpha = layer.alpha || 1;
			this.drawElement(elements[i], context, viewport, delta);
		}
		return true;
	};

	proto.drawElement = function(element, context, viewport, delta) {
		if (!element.visible) {
			return false;
		}
		if (!element.width || this.intersects(element, viewport)) {
			context.save();
			context.globalAlpha = element.alpha;
			var matrix = element.matrix;
			if (matrix) {
				context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx - element.regX*matrix.a, matrix.ty - element.regY*matrix.d);
			} else {
				context.transform(1, 0, 0, 1, element.drawX, element.drawY);
			}

			if (element.children) {
				var rendered = false;
				var children = element.children;
				for (var i=0; i<children.length; i++) {
					var child = children[i];
					if (element.width || this.intersects(child, viewport)) {
						if (child.image && child.imageData) {
							rendered |= this.drawImage(child, context);
						} else {
							rendered |= this.drawShape(child, context);
						}
					}
				}
			}
			if (element.imageData) {
				context.drawImage(element.imageData, 0, 0);
			}
			context.restore();
		}
		if (ec.debug > 1) {
			//draw sort bounds
			var bounds = element.getSortBounds();
			var debugColor = (element.mapType === 'floor') ? '#f00' : '#f0f';

			element.label = element.label || new ec.TextField(context, 0, 0, 512, debugColor);
			element.label.setPos(16+element.x-element.width/2, bounds.back+2);
			element.label.setText(element.name +': '+ element.mapType +' ('+ element.y +', '+ element.z +', '+ element.depth +', '+ element.height +', '+ element.mHeight +')' + bounds.back +','+bounds.front);

			context.strokeStyle = debugColor;
			context.lineWidth = 1;
			context.beginPath();
			//front/back
			context.rect(element.x-element.width/2, bounds.back, element.width, bounds.front-bounds.back);
			//top bottom(z)?
			//context.rect(element.x-element.width/2, element.y-bounds.top, element.width, element.y);
			context.stroke();
		}
		return true;
	};

	proto.drawShape = function(shape, context) {
		if (shape.fillImage) {
			context.fillStyle = context.createPattern(shape.imageData, 'repeat') ;
		} else {
			context.fillStyle = shape.fillColor || '#00f';
		}

		if (shape.polygons) {
			context.save();
			context.translate(shape.x, shape.y);
			for (var i=0; i<shape.polygons.length; i++) {
				this.drawPolygon(shape.polygons[i], context);
			}
			context.restore();

		} else if (shape.oval) {
			// TODO: oval and center x, y
			context.beginPath();
			context.arc(shape.x, shape.y, shape.width/2, 0, 2*Math.PI, false);
			context.fill();

		} else if (shape.rectangle) {
			// TODO: clip to context bounds
			context.fillRect(shape.x, shape.y, shape.width, shape.height);
		} else {
			throw('what kind of shape is this? '+ shape);
		}
		return true;
	};

	proto.drawPolygon = function(polygon, context) {
		// TODO: clip to context bounds
		context.beginPath();
		var i = 0;
		context.moveTo(polygon[i][0], polygon[i][1]);
		for (i=1; i<polygon.length; i++) {
			context.lineTo(polygon[i][0], polygon[i][1]);
		}
		context.fill();
		return true;
	};

	proto.drawImage = function(image, context) {
		context.drawImage(image.imageData, image.x, image.y, image.width, image.height);
		return true;
	};

	proto.intersects = function(element, viewport) {
		//return true;
		return (element.drawX <= viewport.r && viewport.l <= (element.drawX + element.width) &&
				element.drawY <= viewport.b && viewport.t <= (element.drawY + element.height));
	};

	proto.containsViewPort = function(element, viewport) {
		return (element.drawX <= viewport.l && viewport.r >= (element.drawX + element.width) &&
				element.drawY <= viewport.t && viewport.b >= (element.drawY + element.height));
	};

	proto.insideViewPort = function(element, viewport) {
		return (viewport.l <= element.drawX && (element.drawX + element.width) >= viewport.r &&
				viewport.t <= element.drawY && (element.drawY + element.height) >= viewport.b);
	};

})(window);
