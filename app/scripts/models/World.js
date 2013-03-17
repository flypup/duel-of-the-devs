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

		setMap: function(data) {
			//clear space
			this.term();
			this.init();

			// TODO: remember / remove walls - AKA ViewPort Bounds
			this.addWalls(0, 0, data.width, data.height);

			// add mapElements, extract entities
			var entities = data.entities = data.entities || [];
			var layers = data.layers;
			var i, j;
			for (i=0; i<layers.length; i++) {
				var layer = layers[i];
				layer.layerNum = i;

				var elements = layer.elements || [];
				var shapes = layer.shapes || [];

				for (j=elements.length; j-- > 0;) {
					if (elements[j].mapType === 'entity') {
						entities.push(elements.splice(j, 1)[0]);
					} else {
						var mapElement = this.initMapElement(elements[j]);
						if (mapElement) {
							mapElement.layerNum = i;
							mapElement.visible = !!mapElement.image || !!mapElement.children;
							this.addMapElement(mapElement);

							// ew! updating the data we're parsing
							elements[j] = mapElement;
						}
					}
				}
				layer.elements = elements;
				layer.shapes = shapes;
			}
			// add entities
			var entity;
			for (i=entities.length; j-- > 0;) {
				entity = entities[j];
				console.log('Map Entity', entity);
				this.add(this.initMapEntity(entity));
				entity.layerNum = 0;
			}
			this.map = data;
		},

		initMapEntity: function(element) {
			var x = element.x;
			var y = element.y;
			var z = element.mZ;
			var EntityClass = ec[element.type];
			console.log('map entity', element.type, x, y, z);
			var entity = new EntityClass(
				element.mass,
				element.mWidth,
				element.mHeight
			).setPos(x, y, z);
			entity.depth = element.mDepth;
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
			shape.setLayers(ec.Collisions.NOT_GRABABLE_MASK);
			this.space.addShape(shape);
			return shape;
		},

		add: function(entity) {
			if (this.entities.indexOf(entity) < 0) {
				if (!entity.body.isStatic()) {
					this.space.addBody(entity.body);
				}
				this.space.addShape(entity.shape);
				this.entities.push(entity);
				return entity;
			}
			console.error('entity already a child of world', entity);
			return null;
		},

		addMapElement: function(mapElement) {
			this.elements.push(mapElement);
			for (var i in mapElement.shapes) {
				var shapeData = mapElement.shapes[i];
				var shape = shapeData.cpShape;
				if (shape) {
					this.space.addShape(shape);
				}
			}
		},				

		remove: function(entity) {
			var index = this.entities.indexOf(entity);
			if (index > -1) {
				if (!entity.body.isStatic()) {
					this.space.removeBody(entity.body);
				}
				this.space.removeShape(entity.shape);
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
			this.space.step(delta / 1000);
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
			this.space.step(delta / 1000);
			// TODO: if scenes hint map element collisions, this can work
			for(i = this.entities.length; i-- > 0;) {
				this.entities[i].postStepScene(delta);
			}
			this.time += delta;
		}
	};

})(window);