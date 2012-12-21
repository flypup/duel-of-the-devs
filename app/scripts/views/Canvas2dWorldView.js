(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dWorldView = ec.Canvas2dWorldView = function(world) {
		
		this.world = world;

		this.mapRenderer = new ec.Canvas2dMapView();
		
		// TODO: add instances to graph for entities in world model
		this.entityRenderer = new ec.Canvas2dEntityView();
		
		this.camera = {};
		this.camera.x = this.camera.y = 16;
		this.camera.zoom = 1;
		this.viewport = {
			l: 0, t: 0, r: 0, b: 0
		};
	};

	var proto = Canvas2dWorldView.prototype;

	proto.setMapData = function(data) {
		// TODO: remember / remove walls - AKA ViewPort Bounds
		this.world.addWalls(0, 0, data.width, data.height);

		// add entities / mapElements
		var layers = data.layers;
		for (var i=0; i<layers.length; i++) {
			var layer = layers[i];
			layer.layerNum = i;

			var elements = layer.elements || [];
			var shapes = layer.shapes || [];

			var j, mapElement;
			for (j=elements.length; j-- > 0;) {
				mapElement = this.world.addMapElement(elements[j], 0, 0);
				mapElement.layerNum = i;
				if (mapElement.isEntity) {
					// entity
					elements.splice(j, 1);
				} else {
					mapElement.visible = !!mapElement.image || !!mapElement.children;
					// ew!
					elements[j] = mapElement;
				}

			}
			for (j=shapes.length; j-- > 0;) {
				mapElement = this.world.addMapElement(shapes[j], 0, 0);
				mapElement.layerNum = i;
				mapElement.name = layer.name +'_'+ j;
				// ew!
				shapes[j] = mapElement;
			}
			layer.elements = elements;
			layer.shapes = shapes;
		}

		this.mapRenderer.loadLayers(data);
	};

	proto.updateViewport = function(camera) {
		var viewport = this.viewport;
		viewport.l = camera.x;
		viewport.t = camera.y;
		viewport.r = viewport.l + camera.width/camera.scaleX;
		viewport.b = viewport.t + camera.height/camera.scaleY;
		return viewport;
	};

	proto.draw = function(context) {
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = '#888888';
		context.globalAlpha = 1;
		context.fillRect(0, 0, this.camera.width, this.camera.height);

		context.save();
		
		// translate by default to screen coordinates
		//context.scale(this.camera.scaleX, this.camera.scaleY);
		//context.translate(-this.camera.x, -this.camera.y);
		context.setTransform(this.camera.scaleX, 0, 0, this.camera.scaleY, -this.camera.x*this.camera.scaleX, -this.camera.y*this.camera.scaleY);
		
		// loop through layers and create a 2d array of entitiesInLayers
		var entities = this.world.entities.slice();
		var layers = this.mapRenderer.getLayers();
		var i, len;
		var entitiesInLayers = [];
		for (i=layers.length; i-- > 0;) {
			var inLayer = this.mapRenderer.getItemsInLayer(layers[i], entities);
			//sort Entities in each layer
			inLayer.sort(sortEntities);
			entitiesInLayers[i] = inLayer;
		}
		// test
		if (entities.length) {
			throw(entities.length + 'elements did not get placed in a layer');
		}

		var viewport = this.updateViewport(this.camera);
		for (i = 0, len = layers.length; i < len; i++) {
			this.mapRenderer.drawLayer(layers[i], context, viewport);

			var layerEntities = entitiesInLayers[i];
			for (var j=0; j<layerEntities.length; j++) {
				var item = layerEntities[j];
				this.entityRenderer.draw(context, item, viewport);
			}
		}

		context.restore();
	};

	proto.lookAt = function(x, y) {
		this.camera.x = -this.camera.width/this.camera.scaleX/2 + x;
		this.camera.y = -this.camera.height/this.camera.scaleY/2 + y - 64;
	};

	proto.resize = function(width, height, ratio) {
		this.camera.width  = width  * ratio;
		this.camera.height = height * ratio;
		this.camera.pixelRatio = ratio;
		this.zoom(this.camera.zoom);
	};

	proto.zoom = function(amount) {
		// TODO: use device screen height for native pixel scale
		var verticalPixels = (ec.height <= 640) ? 640 : 720;
		this.camera.zoom = amount;
		amount = amount * ec.height / verticalPixels;
		this.camera.scaleX = this.camera.pixelRatio * amount;
		this.camera.scaleY = this.camera.pixelRatio * amount;
		console.log('zoom', this.camera.zoom, 'factor', amount, 'x,y:', this.camera.scaleX, this.camera.scaleY);
	};

	var sortEntities = function(a, b) {
		if ( a.body.p.y > b.body.p.y ) {
			return -1;
		} else if ( b.body.p.y > a.body.p.y ) {
			return 1;
		}
		return 0;
	};

})(window);
