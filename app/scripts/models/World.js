(function(window) {

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;

	function assert(value, message) {
		if (!value) {
			throw new Error('Assertion failed: ' + message);
		}
	}

	var World = ec.World = function() {
		this.time = 0;
		this.entities = [];
		this.elements = [];
		this.space = null;
		this.map = null;

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	World.prototype = {

		init: function() {
			var space =
			this.space = new cp.Space();
			space.gravity = v(0, 0);
			space.iterations = 10;
			space.sleepTimeThreshold = ec.TIME_STEP * 9;//Infinity;//
			space.idleSpeedThreshold = 0.1;//5;//0.01;//
			space.collisionSlop = 0.025;
			space.collisionBias = Math.pow(1 - 0.75, 60);
			space.damping = 0.5;//0.95;//0.66;//1
		},

		term: function() {
			// TODO: -> call remove on all entities > bodies > shapes
			for(var i = this.entities.length; i-- > 0;) {
				this.entities[i].deactivate();
			}
			this.entities.length = 0;
			this.elements.length = 0;
			var space = this.space;
			if (space) {
				space.locked = 0;
				space.staticShapes.each(function(shape){space.removeStaticShape(shape);});
				space.activeShapes.each(function(shape){space.removeShape(shape);});
				var hash;
				for(hash in space.collisionHandlers) {
					delete space.collisionHandlers[hash];
				}
				for(hash in space.cachedArbiters) {
					delete space.cachedArbiters[hash];
				}
				space.bodies.length = 0;
				space.rousedBodies.length = 0;
				space.sleepingComponents.length = 0;
				space.constraints.length = 0;
				space.arbiters.length = 0;
				space.postStepCallbacks.length = 0;
			}
			this.space = null;
			this.map = null;
		},

		getRandomMapPosition: function() {
			if (this.map && this.map.points) {
				var index = Math.floor(Math.random()*this.map.points.length);
				return this.map.points[index];
			}
			console.error('getRandomMapPosition: no map points.', this.map);
			return v(Math.random() * 1000, Math.random() * 1000 + 1000);
		},

		setMap: function(data) {
			//clear space
			this.term();
			this.init();

			// TODO: remember / remove walls - AKA ViewPort Bounds
			this.addWalls(0, 0, data.width, data.height);

			// add mapElements, extract entities and bounds, add points for AI
			var layers = data.layers;
			var entities = data.entities = data.entities || [];
			var bounds = data.bounds = data.bounds || [];
			var points = data.points = data.points || [];

			var i, j;
			// add mapElements
			for (i=0; i<layers.length; i++) {
				var layer = layers[i];
				layer.layerNum = i;

				var elements = layer.elements || [];
				//var shapes = layer.shapes || [];
				var layerBounds = layer.bounds;
				if (layerBounds) {
					// ew! updating the data we're parsing
					layerBounds.mapType = 'bounds';
					layer.bounds = this.initMapElement(layerBounds);
					this.addMapElement(layer.bounds);
				}
				
				for (j=elements.length; j-- > 0;) {
					if (elements[j].mapType === 'entity') {
						entities.push(elements.splice(j, 1)[0]);
					} else if (elements[j].depth < 0) {
						//negative depth implies impassable bounds
						bounds.push(elements.splice(j, 1)[0]);
					} else {
						var mapElement = this.initMapElement(elements[j]);
						if (mapElement) {
							mapElement.layerNum = i;
							mapElement.visible = !!mapElement.image || !!mapElement.children;
							this.addMapElement(mapElement);

							switch (mapElement.mapType) {
							case 'wall':
							case 'floor':
							case 'steps':
								points.push(v(mapElement.x, mapElement.y));
							}

							// ew! updating the data we're parsing
							elements[j] = mapElement;
						}
					}
				}
				layer.elements = elements;
				//layer.shapes = shapes;
			}
			// add entities
			var entityData;
			for (i=entities.length; i-- > 0;) {
				entityData = entities[i];
				console.log('Map Entity', entityData);
				this.add(this.initMapEntity(entityData));
			}
			//add bounds
			var boundsElement;
			for (i=bounds.length; i-- > 0;) {
				boundsElement = bounds[i];
				console.log('Map Bounds', boundsElement);
				this.addMapElement(this.initMapElement(boundsElement));
			}
			this.map = data;
		},

		initMapEntity: function(entityData) {
			if (entityData.mZ !== undefined) {
				entityData.z = entityData.mZ;
			}
			if (entityData.mWidth) {
				entityData.width = entityData.mWidth;
			}
			if (entityData.mHeight) {
				entityData.height = entityData.mHeight;
			}
			if (entityData.mDepth) {
				entityData.depth = entityData.mDepth;
			}
			var x = entityData.x;
			var y = entityData.y;
			var z = entityData.z;
			var EntityClass = ec[entityData.type];
			console.log('map entity', entityData.type, x, y, z);
			var entity = new EntityClass(
				entityData.mass,
				entityData.width,
				entityData.height
			).setPos(x, y, z);
			entity.depth = entityData.depth;
			return entity;
		},

		initMapElement: function(element) {
			if (element instanceof ec.MapElement) {
				return element;
			}
			return new ec.MapElement(element);
		},

		addWalls: function(left, top, right, bottom) {
			this.addBox(v( (right-left)/2, top   -64), 256+right-left, 128);
			this.addBox(v( (right-left)/2, bottom+64), 256+right-left, 128);
			this.addBox(v(right +64,  (bottom-top)/2 ), 128, bottom-top);
			this.addBox(v(left  -64,  (bottom-top)/2 ), 128, bottom-top);
		},

		addBox: function(v1, w, h) {
			assert(w > 0 && h > 0, 'addBox width and height must be positive and non-zero');
			var body = new cp.Body(Infinity, Infinity);
			body.nodeIdleTime = Infinity;
			v1.y = -v1.y;
			body.p = v1;
			var shape = new cp.BoxShape(body, w, h);
			shape.setElasticity(0);
			shape.setFriction(1);
			this.space.addShape(shape);
			return shape;
		},

		add: function(entity) {
			if (this.entities.indexOf(entity) < 0) {
				if (!entity.isStatic()) {
					this.space.addBody(entity.body);
				}
				entity.activate();
				if (entity.shape !== null) {
					this.space.addShape(entity.shape);
				}
				this.entities.push(entity);
				return entity;
			}
			console.error('entity already a child of world', entity);
			return null;
		},

		addMapElement: function(mapElement) {
			//negative depth implies impassable bounds
			var isLayerBounds = mapElement.mapType === 'bounds';
			if (mapElement.depth >= 0 && !isLayerBounds) {
				this.elements.push(mapElement);
			}
			for (var i in mapElement.shapes) {
				var shapeData = mapElement.shapes[i];
				var shape = shapeData.cpShape;
				if (shape) {
					if (isLayerBounds) {
						shape.sensor = true;
					}
					this.space.addShape(shape);
				}
			}
		},				

		remove: function(entity) {
			var index = this.entities.indexOf(entity);
			if (index > -1) {
				if (!entity.isStatic()) {
					this.space.removeBody(entity.body);
				}
				entity.deactivate();
				if (entity.shape !== null) {
					this.space.removeShape(entity.shape);
				}
				this.entities.splice(index, 1);
				entity.removed();
				return entity;
			}
			console.error('entity not a child of world', entity);
			return null;
		},

		contains: function(entity) {
			return (this.entities.indexOf(entity) > -1);
		},

		entityForBody: function(body) {
			for(var i = this.entities.length; i-- > 0;) {
				if (this.entities[i].body === body) {
					return this.entities[i];
				}
			}
			console.error('no entity for body', body);
			return null;
		},

		elementForBody: function(body) {
			for(var i = this.elements.length; i-- > 0;) {
				if (this.elements[i].body === body) {
					return this.elements[i];
				}
			}
			console.error('no elements for body', body);
			return null;
		},

		createStaticBody: function() {
			var body = new cp.Body(Infinity, Infinity);
			body.nodeIdleTime = Infinity;
			return body;
		},

		step: function(delta) {
			var i;
			for(i = this.entities.length; i-- > 0;) {
				this.entities[i].step(delta);
			}
			if (ec.debug === 1) {ec.core.traceTime('space.step');}
			this.space.step(delta / 1000);
			if (ec.debug === 1) {ec.core.traceTimeEnd('space.step');}
			for(i = this.entities.length; i-- > 0;) {
				this.entities[i].postStep(delta);
			}
			this.time += delta;
		},

		stepScene: function(delta) {
			var i;
			// for(i = this.entities.length; i-- > 0;) {
			//	this.entities[i].step(delta);
			// }
			if (ec.debug === 1) {ec.core.traceTime('space.step');}
			this.space.step(delta / 1000);
			if (ec.debug === 1) {ec.core.traceTimeEnd('space.step');}
			// TODO: if scenes hint map element collisions, this can work
			for(i = this.entities.length; i-- > 0;) {
				this.entities[i].postStepScene(delta);
			}
			this.time += delta;
		}
	};

})(window);