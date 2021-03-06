(function(window) {

	var ec = window.ec;

	var Canvas2dWorldView = ec.Canvas2dWorldView = function(world) {
		
		this.world = world;

		this.mapRenderer = new ec.Canvas2dMapView();
		
		// TODO: add instances to graph for entities in world model
		this.entityRenderer = new ec.Canvas2dEntityView();
		this.entitiesInLayers = [];
	
		this.camera = {
			lookAt: function(x, y) {
				this.x = -this.width/this.scaleX/2 + x;
				this.y = -this.height/this.scaleY/2 + y;
			}
		};
		this.camera.x = this.camera.y = 16;
		this.camera.zoom = 1;
		this.viewport = { l: 0, t: 0, r: 0, b: 0 };

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	var errors = {};

	Canvas2dWorldView.prototype = {
		loadMap: function() {
			this.mapRenderer.loadLayers(this.world.map);
		},

		updateViewport: function(camera) {
			var viewport = this.viewport;
			viewport.l = camera.x;
			viewport.t = camera.y;
			viewport.r = viewport.l + camera.width/camera.scaleX;
			viewport.b = viewport.t + camera.height/camera.scaleY;
			return viewport;
		},

		draw: function(context, delta) {
			//console.log('world 2d draw');
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
			var i, j, len;
			var entitiesInLayers = this.entitiesInLayers;
			var layerEntities;

			// entities that do not have any map collisions
			for (i=layers.length; i-- > 0;) {
				layerEntities = this.mapRenderer.getItemsInLayer(layers[i], entities, entitiesInLayers[i]);
				//sort Entities in each layer
				layerEntities.sort(sortEntities);
				entitiesInLayers[i] = layerEntities;
			}
			// test
			if (entities.length) {
				var msg = entities.length + ' elements did not get placed in a layer';
				if (!errors[msg]) {
					console.error(msg);
					errors[msg] = 1;
				} else {
					errors[msg]++;
				}
				//entitiesInLayers[layers.length-1] = entitiesInLayers[layers.length-1].concat(entities);
				entities.length = 0;
			}

			var viewport = this.updateViewport(this.camera);
			for (i = 0, len = layers.length; i < len; i++) {
				this.mapRenderer.drawLayer(layers[i], context, viewport, delta);

				layerEntities = entitiesInLayers[i];
				for (j=0; j<layerEntities.length; j++) {
					if (layerEntities[j].hasShadow) {
						this.entityRenderer.drawShadow(context, layerEntities[j], viewport, delta);
					}
				}
				for (j=0; j<layerEntities.length; j++) {
					this.entityRenderer.drawEntity(context, layerEntities[j], viewport, delta);
				}
			}

			entitiesInLayers.length = 0;
			context.restore();
		},

		lookAt: function(x, y) {
			this.camera.lookAt(x, y);
		},

		resize: function(width, height, ratio) {
			this.camera.width  = width  * ratio;
			this.camera.height = height * ratio;
			this.camera.pixelRatio = ratio;
			this.zoom(this.camera.zoom);
		},

		zoom: function(amount) {
			// TODO: use device screen height for native pixel scale
			var verticalPixels = (ec.height <= 640) ? 640 : 720;
			this.camera.zoom = amount;
			amount = amount * ec.height / verticalPixels;
			this.camera.scaleX = this.camera.pixelRatio * amount;
			this.camera.scaleY = this.camera.pixelRatio * amount;
			console.log('zoom', this.camera.zoom, 'factor', amount, 'x,y:', this.camera.scaleX, this.camera.scaleY, 'w,h:', this.camera.width, this.camera.height, 'px:', this.camera.pixelRatio);
		}
	};

	var sortEntities = function(a, b) {
		var posA = a.getPos();
		var posB = b.getPos();
		if ( posA.y < posB.y ) {
			return -1;
		} else if ( posB.y < posA.y ) {
			return 1;
		}
		return 0;
	};

})(window);
