(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dMapView = ec.Canvas2dMapView = function() {
		this.data = null;
		this.path = '';
		this.viewport = {
			l: 0, t: 0, r: 0, b: 0
		};
	};

	var proto = Canvas2dMapView.prototype;

	proto.draw = function(context, camera) {
		if (!this.data) {
			return;
		}
		context.save();
		context.translate(-this.data.width/2, -this.data.height/2);

		this.viewport.l = camera.x + this.data.width/2;
		this.viewport.t = camera.y + this.data.height/2;
		this.viewport.r = this.viewport.l + camera.width/camera.scaleX;
		this.viewport.b = this.viewport.t + camera.height/camera.scaleY;

		var layers = this.data.layers;
		for (var i=layers.length; i-- > 0;) {
			this.drawLayer(layers[i], context, this.viewport);
		}

		context.restore();
	};

	proto.drawLayer = function(layer, context, viewport) {
		if (!layer.visible) {
			return;
		}
		var entities = layer.entities;
		var shapes = layer.shapes;
		var images = layer.images;
		var i;
		if (shapes) {
			for (i=shapes.length; i-- > 0;) {
				this.drawShape(shapes[i], context, viewport);
			}
		}
		if (images) {
			for (i=images.length; i-- > 0;) {
				this.drawImage(images[i], context, viewport);
			}
		}
		if (entities) {
			for (i=entities.length; i-- > 0;) {
				this.drawEntity(entities[i], context, viewport);
			}
		}
	};

	proto.drawShape = function(shape, context, viewport) {
		if (this.intersects(shape, viewport)) {
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
					this.drawPolygon(shape.polygons[i], context, viewport);
				}
				context.restore();
			}
		}
	};

	proto.drawPolygon = function(polygon, context, viewport) {
		// TODO: clip to context bounds
		context.beginPath();
		var i = 0;
		context.moveTo(polygon[i][0], polygon[i][1]);
		for (i=1; i<polygon.length; i++) {
			context.lineTo(polygon[i][0], polygon[i][1]);
		}
		context.fill();
	};

	proto.drawImage = function(image, context, viewport) {
		if (this.intersects(image, viewport)) {
			context.drawImage(image.imageData, image.x, image.y, image.width, image.height);
		}
	};

	proto.drawEntity = function(entity, context, viewport) {
		//entity.mapType === "wall", "floor", "steps", "parallax", "entity" (prop)
		if (entity.imageData) {
			if (this.intersects(entity, viewport)) {
				//console.log('drawing', entity.name);
				context.drawImage(entity.imageData, entity.drawX, entity.drawY);//, entity.width, entity.height);
			}
		}
		
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

	proto.setMapData = function(data) {
		this.data = data;
		// TODO: preload images
		this.path = data.path;
		var layers = data.layers;
		for (var i=layers.length; i-- > 0;) {
			this.preloadLayer(layers[i]);
		}
	};

	proto.preloadLayer = function(layer) {
		if (layer.visible !== false) {
			layer.visible = true;
		}
		var entities = layer.entities;
		var shapes = layer.shapes;
		var images = layer.images;
		var i;
		if (entities) {
			for (i=entities.length; i-- > 0;) {
				this.preloadImages(entities[i]);
			}
		}
		if (shapes) {
			for (i=shapes.length; i-- > 0;) {
				this.preloadImages(shapes[i]);
			}
		}
		if (images) {
			for (i=images.length; i-- > 0;) {
				this.preloadImages(images[i]);
			}
		}
	};

	proto.preloadImages = function(element) {
		if (element.image || element.fillImage) {
			element.imageData = new Image();
			element.imageData.src = this.path +'/'+ (element.image || element.fillImage);
		}
		if (element.fillColor) {
			if (element.fillColor.length === 9) {
				element.fillAlpha = 255 / parseInt(element.fillColor.substr(7), 16);
				element.fillColor = element.fillColor.substr(0, 7);
			}
		}
		if (element.regX) {
			element.drawX = element.x - element.regX;
			element.drawY = element.y - element.regY;
		} else {
			element.drawX = element.x;
			element.drawY = element.y;
		}
	};

})(window);
