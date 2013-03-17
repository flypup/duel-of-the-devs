(function(window) {

	var ec = window.ec;
	var v = window.cp.v;

	function assertSoft(value, message) {
		if (!value) {
			console.warn('Assertion failed: ' + message);
		}
		return value;
	}

	var MapElement = ec.MapElement = function(element) {
		// Base Props
		ec.extend(this, {
			// name: '',
			x: 0.0,
			y: 0.0,
			z: 0.0,
			width: 0,
			height: 0,
			depth: 0,
			regX: null,
			regY: null,
			matrix: null,
			mapType: 'notset',
			mass: 0,
			shape: null,
			type: null,
			image: null,
			layerNum: 0,
			visible: true,
			body: null,
			imageData: null,
			sortBounds: {top:0, front:0, back:0, inited: false},
			label: null
		});

		ec.copy(this, element);
		this.init();
		this.assignShapes();

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	MapElement.prototype = {
		init: function() {
			if (this.mZ) {
				this.z = this.mZ;
				this.y = this.y + this.z;
			}
			if (this.mDepth !== undefined) {
				this.depth = this.mDepth;
			}
			if (this.mHeight !== undefined) {
				this.shapes = this.shapes || [{}];
				this.shapes[0].height = this.mHeight;
			}
			if (this.mWidth !== undefined) {
				this.shapes = this.shapes || [{}];
				this.shapes[0].width = this.mWidth;
			}
			if (this.regX || this.regY) {
				this.drawX = this.x - this.regX;
				this.drawY = this.y - this.regY;
			} else {
				this.drawX = this.x || 0;
				this.drawY = this.y || 0;
				this.regX = 0;
				this.regY = 0;
			}
			this.drawY -= this.z;
			
			if (this.children) {
				for (var i=this.children.length; i-- > 0;) {
					var child = this.children[i];
					child.drawX = child.x;
					child.drawY = child.y;
				}
			}
		},

		loadImages: function(path) {
			if (this.image || this.fillImage) {
				this.imageData = ec.getImage(path +'/'+ (this.image || this.fillImage));
			}
			if (this.fillColor) {
				if (this.fillColor.length === 9) {
					this.fillAlpha = 255 / parseInt(this.fillColor.substr(7), 16);
					this.fillColor = this.fillColor.substr(0, 7);
				}
			}
			if (this.children) {
				for (var i=this.children.length; i-- > 0;) {
					this.loadImages.apply(this.children[i], [path]);
				}
			}
		},

		isBehindEntity: function(entity) {
			switch (this.mapType) {
			case 'container':
			case 'parallax':
				return false;
			}

			// -- CHECK IF ENTITY IS IN FRONT --
			var mapBounds = this.getSortBounds();

			// Entity is above Element
			if (entity.z >= mapBounds.top) {
				return true;
			}

			var entityBounds = entity.getSortBounds();

			// Entity is in front of Element
			if (entityBounds.back > mapBounds.front) {
				return true;
			}

			// -- CHECK IF ENTITY IS BEHIND --

			// Entity is under Element
			if (entityBounds.top < this.z) {//mapBounds.bottom? or z?
				return false;
			}

			//Entity is behind Element
			if (entityBounds.front < mapBounds.back) {
				return false;
			}

			// -- ENTITY IS TO THE SIDE OF OVERLAPS --

			// TODO: Inside Horizontal Space
			

			// TODO: Inside Horizontal Box
			

			// TODO: raycast a->b normal
			
			//steps ~ inside == infront
			// if (entity.z >= this.z && entityBounds.front > mapBounds.back) {
			// 	return true;
			// }

			return false;
		},

		// TODO: subclass these map types
		assignShapes: function() {
			var x = this.x;
			var y = this.y;
			//var z = this.z;
			var shapes = this.shapes,
				shape, verts, o, p, i, pos;

			if (this.mapType === 'wall') {
				var wall;
				if (this.shape === 'polygons' && shapes) {
					this.setBody(new cp.Body(Infinity, Infinity));
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
								// WALL - SHAPE IS BOTTOM OF OBJECT (COLLISION BASE) - DEPTH IS HOW TALL THE WALL IS
								pos = v(x, y);
								wall = shape.cpShape = this.addConvexHull(pos, verts, this.body, v(shape.x-this.regX, this.regY-shape.y));
								wall.depth = this.depth;
								wall.collision_type = ec.Collisions.MAP;
								console.log('Wall Polygon verts "'+this.name+'" ['+this.x+','+this.y+']['+this.regY+','+this.regY+'] ['+shape.x+','+shape.y+']'+ verts);
							} catch (err) {
								console.error('Bad Wall Polygon in "'+this.name+'". '+err +' '+ verts);
							}
						}
					}
				} else {
					shape = shapes[0];
					pos = v(x, y-(shape.height/2));
					wall = shape.cpShape = this.addBox(pos, shape.width, shape.height);
					if (wall) {
						wall.depth = this.depth;
						wall.collision_type = ec.Collisions.MAP;
						this.setBody(wall.body);
					}
				}

			} else if (this.mapType === 'floor') {
				var floorShape;
				if (this.shape === 'polygons' && shapes) {
					this.setBody(new cp.Body(Infinity, Infinity));
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
								// FLOOR - SHAPE IS TOP OF OBJECT SO WE ADD DEPTH - DEPTH IS HOW THICK/DEEP THE FLOOR IS
								pos = v(x, y+this.depth);
								floorShape = shape.cpShape = this.addConvexHull(pos, verts, this.body, v(shape.x-this.regX, this.regY-shape.y));
								floorShape.depth = this.depth;
								floorShape.collision_type = ec.Collisions.MAP;
								console.log('Floor Polygon verts "'+this.name+'" ['+this.x+','+this.y+'] '+ verts);
							} catch (err) {
								console.error('Bad Floor Polygon in "'+this.name+':'+p+'". '+err +' '+ verts);
							}
						}
					}
				} else if (this.shape === 'oval') {
					shape = shapes[0];
					pos = v(x + shape.x, y + shape.y + this.depth);
					var radius = (shape.width + shape.height)/4;
					floorShape = shape.cpShape = this.addCircle(pos, radius);
					floorShape.depth = this.depth;
					floorShape.collision_type = ec.Collisions.MAP;
					this.setBody(floorShape.body);
				} else {
					shape = shapes[0];
					pos = v(x, y+this.depth);
					floorShape = shape.cpShape = this.addBox(pos, shape.width, shape.height);
					floorShape.depth = this.depth;
					floorShape.collision_type = ec.Collisions.MAP;
					this.setBody(floorShape.body);
				}

			} else if (this.mapType === 'steps') {
				shape = shapes[0];
				pos = v(x, y-(shape.height/2));
				var steps = shape.cpShape = this.addBox(pos, shape.width, shape.height);
				steps.depth = this.depth;
				steps.collision_type = ec.Collisions.MAP;
				this.setBody(steps.body);

			} else if (this.mapType === 'container' || this.mapType === 'parallax') {
				// we're good here

			} else {
				throw(this +'.addMapElementBody(): Invalid Map Type: '+ this.mapType);
			}
			return this;
		},

		addBox: function(v1, w, h) {
			if (!assertSoft(w > 0 && h > 0, 'addBox width and height must be positive and non-zero')) {
				return;
			}
			var body = new cp.Body(Infinity, Infinity);
			body.nodeIdleTime = Infinity;
			v1.y = -v1.y;
			body.p = v1;
			var shape = new cp.BoxShape(body, w, h);
			shape.setElasticity(0);
			shape.setFriction(1);
			shape.setLayers(ec.Collisions.NOT_GRABABLE_MASK);
			return shape;
		},

		addCircle: function(v1, r) { // TODO: Oval
			if (!assertSoft(r > 0, 'addCircle radius must be positive and non-zero')) {
				return;
			}
			var body = new cp.Body(Infinity, Infinity);
			body.nodeIdleTime = Infinity;
			v1.y = -v1.y;
			body.p = v1;
			var shape = new cp.CircleShape(body, r, v(0, 0));
			shape.setElasticity(0);
			shape.setFriction(1);
			shape.setLayers(ec.Collisions.NOT_GRABABLE_MASK);
			return shape;
		},

		addPolygons: function(v1, verts, body, offset) {
			body = body || new cp.Body(Infinity, Infinity);
			offset = offset || v(0,0);
			body.nodeIdleTime = Infinity;
			v1.y = -v1.y;
			body.p = v1;
			var shape = new cp.PolyShape(body, verts, offset);
			shape.setElasticity(0);
			shape.setFriction(1);
			shape.setLayers(ec.Collisions.NOT_GRABABLE_MASK);

			return shape;
		},

		addConvexHull: function(v1, verts, body, offset) {
			cp.convexHull(verts, null, 2);
			return this.addPolygons(v1, verts, body, offset);
		},

		addLineSegment: function(v1, v2) {
			var shape = new cp.SegmentShape(this.space.staticBody, v1, v2, 0);
			shape.setElasticity(0);
			shape.setFriction(1);
			shape.setLayers(ec.Collisions.NOT_GRABABLE_MASK);
			return shape;
		},

		setBody: function(body) {
			this.body = body;
			body.userData = {
				parent: this
			};
		},

		toString: function() {
			return '[MapElement "'+this.name+'"]';
		},

		getTop: function(x, y) {
			if (this.mapType === 'steps') {
				var top = this.z + this.depth * (this.y-y) / this.shapes[0].height;
				return Math.min(this.z + this.depth, Math.max(0, top));
			}
			return this.z + this.depth;
		},

		getSortBounds: function() {
			var bounds = this.sortBounds;
			if (!bounds.inited) {
				var shapes = this.shapes;
				bounds.inited = true;
				bounds.top = this.z + this.depth;
				if (shapes) {
					bounds.back = this.y - shapes[0].height;
				} else {
					bounds.back = this.y;
				}
				if (this.mapType === 'entity') {
					throw('entity sorting should not be handled by element instances');

				} else if (this.shape === 'polygons') {
					bounds.front = -Infinity;
					bounds.back  = Infinity;
					var offsetY;
					for (var o in shapes) {
						offsetY = this.y - (this.regY - shapes[o].y);
						if (this.mapType === 'floor') {
							offsetY += this.depth;
						}
						for (var p in shapes[o].polygons) {
							var polys = shapes[o].polygons[p];
							for (var i=0; i<polys.length; i++) {
								var vert = polys[i];
								bounds.front = Math.max(bounds.front, offsetY+vert[1]);
								bounds.back  = Math.min(bounds.back,  offsetY+vert[1]);
							}
						}
					}
					console.log(this.mapType, this.name, 'yd', this.y+this.depth, 'r', this.regY, 'offsetY', offsetY);

				} else if (this.mapType === 'wall') {
					bounds.front = this.y;
					//bounds.back = this.y;
				} else if (this.mapType === 'steps') {
					bounds.front = this.y;
					bounds.top = this.z;
				} else if (this.mapType === 'floor') {
					bounds.back = this.y + this.depth - shapes[0].height/2;
					bounds.front = bounds.back + shapes[0].height;
				} else if (this.mapType === 'parallax') {
					bounds.front = -1; // TODO: parallax sorting and depth
					bounds.back = -1;
				} else {
					//throw('unexpected element mapType: ' + this.mapType);
					if (shapes) {
						bounds.front = this.y + shapes[0].height;
					} else {
						bounds.front = this.y;
					}
				}
			}
			return bounds;
		}
	};

})(window);