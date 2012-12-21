(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dMapView = ec.Canvas2dMapView = function() {
		this.data = null;
	};

	var proto = Canvas2dMapView.prototype;

	proto.loadLayers = function(data) {
		this.data = data;
		// TODO: preload images
		var layers = data.layers;
		for (var i=layers.length; i-- > 0;) {
			this.loadLayer(layers[i], data.path);
		}
	};

	proto.loadLayer = function(layer, path) {
		if (layer.visible !== false) {
			layer.visible = true;
		}
		var i;
		for (i=layer.elements.length; i-- > 0;) {
			// TODO: refactor loadImagessss
			layer.elements[i].loadImages(path);
		}
		for (i=layer.shapes.length; i-- > 0;) {
			// TODO: refactor loadImagessss
			layer.shapes[i].loadImages(path);
		}
	};

	proto.getLayers = function() {
		return this.data.layers;
	};

	proto.getItemsInLayer = function(layer, entities) {
		var inLayer = [];
		var elements = layer.elements;
		for (var i = entities.length; i-- > 0;) {
			var entity = entities[i];
			entity.layerNum = -1;
			var entityBounds = entity.getSortBounds();
			var j;
			for (j=elements.length; j-- > 0;) {
				var element = elements[j];
				var mapBounds = element.getSortBounds();
				if (element.mapType === 'floor') {
					if (entity.z >= mapBounds.top) {
						entity.layerNum = layer.layerNum;
					}
				} else if (element.mapType === 'wall') {
					if ( entityBounds.front > mapBounds.front) {
						entity.layerNum = layer.layerNum;
					}
				} else if (element.mapType === 'steps') {
					if (entity.z >= element.z && entityBounds.front > mapBounds.back) {
						entity.layerNum = layer.layerNum;
					}
				} else {
					console.error('can\'t test is element contains entity', element.mapType, element);
				}
				if (entity.layerNum === layer.layerNum) {//} && entityBounds.front > mapBounds.front) {
					entities.splice(i, 1);
					inLayer.push(entity);
					break;
				}
			}
		}
		return inLayer;
	};

	proto.draw = function(context, viewport) {
		var layers = this.data.layers;
		for (var i=layers.length; i-- > 0;) {
			this.drawLayer(layers[i], context, viewport);
		}
	};

	proto.drawLayer = function(layer, context, viewport) {
		if (!layer.visible) {
			return false;
		}
		var elements = layer.elements;
		var shapes = layer.shapes;
		var i;
		for (i=shapes.length; i-- > 0;) {
			if (this.intersects(shapes[i], viewport)) {
				this.drawShape(shapes[i], context);
			}
		}
		for (i=elements.length; i-- > 0;) {
			if (this.intersects(elements[i], viewport)) {
				this.drawElement(elements[i], context);
			}
		}
		return true;
	};

	proto.drawShape = function(shape, context) {
		if (shape.fillImage) {
			context.fillStyle = context.createPattern(shape.imageData, 'repeat') ;
		} else {
			context.fillStyle = shape.fillColor;
		}

		if (shape.rectangle) {
			// TODO: clip to context bounds
			context.fillRect(shape.x, shape.y, shape.width, shape.height);

		} else if (shape.oval) {
			// TODO: oval and center x, y
			context.beginPath();
			context.arc(shape.x, shape.y, shape.width/2, 0, 2*Math.PI, false);
			context.fill();

		} else if (shape.polygons) {
			context.save();
			context.translate(shape.x, shape.y);
			for (var i=0; i<shape.polygons.length; i++) {
				this.drawPolygon(shape.polygons[i], context);
			}
			context.restore();
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

	proto.drawElement = function(entity, context) {
		if (!entity.visible) {
			return false;
		}
		//entity.mapType === "wall", "floor", "steps", "parallax", "entity" (prop)
		//console.log('drawing', entity.name);
		if (entity.matrix.a !== 1) {
			context.save();
			context.transform(entity.matrix.a, entity.matrix.b, entity.matrix.c, entity.matrix.d, entity.matrix.tx + entity.regX, entity.matrix.ty - entity.regY);
			context.drawImage(entity.imageData, 0, 0);
			context.restore();
		} else {
			context.drawImage(entity.imageData, entity.drawX*entity.matrix.a, entity.drawY);//, entity.width, entity.height);
		}
		return true;
	};

	proto.intersects = function(entity, viewport) {
		//return true;
		return (entity.drawX <= viewport.r && viewport.l <= (entity.drawX + entity.width) &&
				entity.drawY <= viewport.b && viewport.t <= (entity.drawY + entity.height));
	};

	proto.containsViewPort = function(entity, viewport) {
		return (entity.drawX <= viewport.l && viewport.r >= (entity.drawX + entity.width) &&
				entity.drawY <= viewport.t && viewport.b >= (entity.drawY + entity.height));
	};

	proto.insideViewPort = function(entity, viewport) {
		return (viewport.l <= entity.drawX && (entity.drawX + entity.width) >= viewport.r &&
				viewport.t <= entity.drawY && (entity.drawY + entity.height) >= viewport.b);
	};

})(window);
