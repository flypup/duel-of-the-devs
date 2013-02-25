(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;

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

	//shape layers
	var GRABABLE_MASK_BIT = 1<<31;
	var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

	var proto = World.prototype;


	proto.init = function() {
		var space =
		this.space = new cp.Space();
		space.gravity = v(0, 0);
		space.iterations = 10;
		space.sleepTimeThreshold = ec.TIME_STEP * 9;//Infinity;//
		space.idleSpeedThreshold = 0.1;//5;//0.01;//
		space.collisionSlop = 0.025;
		space.collisionBias = Math.pow(1 - 0.75, 60);
		space.damping = 0.5;//0.95;//0.66;//1
	};

	proto.term = function() {
		// TODO: call remove on all entities > bodies > shapes
		this.entities.length = 0;
		this.elements.length = 0;
		var space = this.space;
		if (space) {
			space.locked = 0;
			space.collisionHandlers.length = 0;
			space.bodies.length = 0;
			space.sleepingComponents.length = 0;
			space.constraints.length = 0;
			space.arbiters.length = 0;
		}
		this.space = null;
		this.map = null;
	};

	proto.setMap = function(data) {
		//clear space
		this.term();
		this.init();

		// TODO: remember / remove walls - AKA ViewPort Bounds
		this.addWalls(0, 0, data.width, data.height);

		// add entities / mapElements
		var layers = data.layers;
		for (var i=0; i<layers.length; i++) {
			var layer = layers[i];
			layer.layerNum = i;

			var elements = layer.elements || [];
			var shapes = layer.shapes || [];

			var j, mapElement;
			for (j=elements.length; j-- > 0;) {
				if (elements[j].mapType === 'entity') {
					mapElement = this.add(this.initMapEntity(elements[j]));
				} else {
					mapElement = this.initMapElement(elements[j]);
					this.addMapElementBody(mapElement);
				}
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
			layer.elements = elements;
			layer.shapes = shapes;
		}

		this.map = data;
	};

	proto.initMapEntity = function(element) {
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
	};

	proto.initMapElement = function(element) {
		if (element instanceof ec.MapElement) {
			return element;
		}
		return new ec.MapElement(element);
	};

	proto.addMapElementBody = function(mapElement) {
		var x = mapElement.x;
		var y = mapElement.y;
		//var z = mapElement.z;
		var shapes, shape, verts, o, p, i;

		if (mapElement.mapType === 'wall') {
			var wall;
			shapes = mapElement.shapes;
			if (mapElement.shape === 'polygons' && shapes) {
				mapElement.setBody(new cp.Body(Infinity, Infinity));
				//poly to verts
				for (o in shapes) {
					verts = [];
					shape = shapes[o];
					for (p in shape.polygons) {
						verts = verts.concat.apply(verts, shape.polygons[p]);
						// reverse y
						for (i=1; i<verts.length; i+=2) {
							verts[i] = -verts[i];
						}
						try {
							wall = this.addPolygons(v(x, y), verts, mapElement.body, v(shape.x-mapElement.regX, mapElement.regY-shape.y));
							wall.depth = mapElement.depth;
							wall.collision_type = ec.Collisions.MAP;
							console.log('Wall Polygon verts "'+mapElement.name+'" ['+mapElement.x+','+mapElement.y+']['+mapElement.regY+','+mapElement.regY+'] ['+shape.x+','+shape.y+']'+ verts);
						} catch (err) {
							console.error('Bad Wall Polygon in "'+mapElement.name+'". '+err +' '+ verts);
						}
					}
				}
			} else {
				wall = this.addBox(v(x, y-(mapElement.mHeight/2)), mapElement.mWidth, mapElement.mHeight);
				wall.depth = mapElement.depth;
				wall.collision_type = ec.Collisions.MAP;
				mapElement.setBody(wall.body);
			}
			this.elements.push(mapElement);

		} else if (mapElement.mapType === 'floor') {
			var floorShape;
			shapes = mapElement.shapes;
			if (mapElement.shape === 'polygons' && shapes) {
				mapElement.setBody(new cp.Body(Infinity, Infinity));
				//poly to verts... 2d array to flat array
				for (o in shapes) {
					verts = [];
					shape = shapes[o];
					for (p in shape.polygons) {
						verts = verts.concat.apply(verts, shape.polygons[p]);
						// reverse y
						for (i=1; i<verts.length; i+=2) {
							verts[i] = -verts[i];
						}
						try {
							floorShape = this.addPolygons(v(x, y+mapElement.depth), verts, mapElement.body, v(shape.x-mapElement.regX, mapElement.regY-shape.y));
							floorShape.depth = mapElement.depth;
							floorShape.collision_type = ec.Collisions.MAP;
							console.log('Floor Polygon verts "'+mapElement.name+'" ['+mapElement.x+','+mapElement.y+'] '+ verts);
						} catch (err) {
							console.error('Bad Floor Polygon in "'+mapElement.name+':'+p+'". '+err +' '+ verts);
						}
					}
				}

			} else {
				floorShape = this.addBox(v(x, y+mapElement.depth), mapElement.mWidth, mapElement.mHeight);
				floorShape.depth = mapElement.depth;
				floorShape.collision_type = ec.Collisions.MAP;
				mapElement.setBody(floorShape.body);
			}
			this.elements.push(mapElement);

		} else if (mapElement.mapType === 'steps') {
			var steps = this.addBox(v(x, y-(mapElement.mHeight/2)), mapElement.mWidth, mapElement.mHeight);
			steps.depth = mapElement.depth;
			steps.collision_type = ec.Collisions.MAP;
			mapElement.setBody(steps.body);
			this.elements.push(mapElement);

		} else if (mapElement.mapType === 'container' || mapElement.mapType === 'parallax') {
			// we're good here

		} else {
			throw(mapElement +' World.addMapElementBody(): Invalid Map Type: '+ this.mapType);
		}
	};

	proto.addWalls = function(left, top, right, bottom) {
		this.addBox(v( (right-left)/2, top   -64), 256+right-left, 128);
		this.addBox(v( (right-left)/2, bottom+64), 256+right-left, 128);
		this.addBox(v(right +64,  (bottom-top)/2 ), 128, bottom-top);
		this.addBox(v(left  -64,  (bottom-top)/2 ), 128, bottom-top);
	};

	proto.addBox = function(v1, w, h) {
		var body = new cp.Body(Infinity, Infinity);
		body.nodeIdleTime = Infinity;
		v1.y = -v1.y;
		body.p = v1;
		var shape = this.space.addShape(new cp.BoxShape(body, w, h));
		shape.setElasticity(0);
		shape.setFriction(1);
		shape.setLayers(NOT_GRABABLE_MASK);
		return shape;
	};

	proto.addPolygons = function(v1, verts, body, offset) {
		body = body || new cp.Body(Infinity, Infinity);
		offset = offset || v(0,0);
		body.nodeIdleTime = Infinity;
		v1.y = -v1.y;
		body.p = v1;
		var shape = this.space.addShape(new cp.PolyShape(body, verts, offset));
		shape.setElasticity(0);
		shape.setFriction(1);
		shape.setLayers(NOT_GRABABLE_MASK);

		return shape;
	};

	proto.addLineSegment = function(v1, v2) {
		var shape = this.space.addShape(new cp.SegmentShape(this.space.staticBody, v1, v2, 0));
		shape.setElasticity(0);
		shape.setFriction(1);
		shape.setLayers(NOT_GRABABLE_MASK);
		return shape;
	};

	proto.add = function(entity) {
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
	};

	proto.remove = function(entity) {
		var index = this.entities.indexOf(entity);
		if (index > -1) {
			if (!entity.body.isStatic()) {
				this.space.removeBody(entity.body);
			}
			this.space.removeShape(entity.shape);
			this.entities.splice(index, 1);
			entity.mapCollision.length = 0;
			return entity;
		}
		console.error('entity not a child of world', entity);
		return null;
	};

	proto.contains = function(entity) {
		return (this.entities.indexOf(entity) > -1);
	};

	proto.entityForBody = function(body) {
		for(var i = this.entities.length; i-- > 0;) {
			if (this.entities[i].body === body) {
				return this.entities[i];
			}
		}
		console.error('no entity for body', body);
		return null;
	};

	proto.elementForBody = function(body) {
		for(var i = this.elements.length; i-- > 0;) {
			if (this.elements[i].body === body) {
				return this.elements[i];
			}
		}
		console.error('no elements for body', body);
		return null;
	};

	proto.createStaticBody = function() {
		var body = new cp.Body(Infinity, Infinity);
		body.nodeIdleTime = Infinity;
		return body;
	};

	proto.step = function(delta) {
		var i;
		for(i = this.entities.length; i-- > 0;) {
			this.entities[i].step(delta);
		}
		this.space.step(delta / 1000);
		for(i = this.entities.length; i-- > 0;) {
			this.entities[i].postStep(delta);
		}
		this.time += delta;
	};

	proto.stepScene = function(delta) {
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
	};

})(window);