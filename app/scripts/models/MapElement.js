(function(window) {

	var ec = window.ec;
	var v = window.cp.v;

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
			alpha: null,
			layerNum: 0,
			visible: true,
			body: null,
			imageData: null,
			sortBounds: {top:0, bottom: 0, front:0, back:0, left: 0, right: 0, inited: false},
			spawnPoints: null, // []
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

		intersectsEntity: function (entity) {
			// TODO: subclass mapType(s)
			switch (this.mapType) {
			case 'container':
			case 'parallax':
				return false;
			}

			var mapBounds = this.getSortBounds();
			var entityBounds = entity.getSortBounds();

			// Entity is under Element
			if (entityBounds.top < this.z) {//mapBounds.bottom? or z?
				return false;
			}

			// Entity is behind Element
			if (entityBounds.front < mapBounds.back) {
				return false;
			}

			// Entity is above Element
			if (entity.z >= mapBounds.top) {
				return false;
			}

			// Entity is in front of Element
			if (entityBounds.back > mapBounds.front) {
				return false;
			}

			// Entity is to the right or left of Element
			if (entityBounds.right < mapBounds.left || entityBounds.left > mapBounds.right) {
				// Entity is outside the left or right of Element
				return false;
			}

			// Entity BB overlaps with Element BB
			switch (this.shape) {
			case 'box':
				// if rotated fall through to polygon check
				if (!this.body || this.body.a === 0) {
					return false;
				}
			/*falls through*/
			case 'polygons':
				// test all shape edges
				var point,
					distance = Infinity,
					bodyPos = entity.getBodyPos();
				for (var i = this.shapes.length; i-- > 0;) {
					var shape = this.shapes[i];
					var cpShape = shape.cpShape;
					var info = cpShape.nearestPointQuery(bodyPos);
					if (info.d < distance) {
						distance = info.d;
						point = info.p;
					}
				}
				if (distance > 0) {
					// Entity is outside Element shape
					return false;
				}
				break;

			case 'circle':
				// TODO: test distance from center
				break;

			default:
				throw('Invalid map shape type: '+ this.shape);
			}

			return true;
		},

		isBehindEntity: function(entity) {
			// TODO: subclass mapType(s)
			switch (this.mapType) {
			case 'container':
			case 'parallax':
				return false;
			}

			var mapBounds = this.getSortBounds();
			var entityBounds = entity.getSortBounds();

			// -- CHECK IF ENTITY IS BEHIND --

			// Entity is under Element
			if (entityBounds.top < this.z) {//mapBounds.bottom? or z?
				return false;
			}

			// Entity is behind Element
			if (entityBounds.front < mapBounds.back) {
				return false;
			}

			// -- CHECK IF ENTITY IS IN FRONT --
			
			// Entity is above Element
			if (entity.z >= mapBounds.top) {
				// Entity is not behind Element
				if (entityBounds.front > mapBounds.back) {
					if (ec.debug > 0) {
						entity.sortReason = 'above '+this.name;
					}
					return true;
				}
				return false;
			}

			// Entity is in front of Element
			if (entityBounds.back > mapBounds.front) {
				// Entity is not under Element
				if (entityBounds.top > this.z) {
					if (ec.debug > 0) {
						entity.sortReason = 'before '+this.name;
					}
					return true;
				}
				return false;
			}

			// -- ENTITY IS TO THE SIDE OF OVERLAPS --

			if (entityBounds.right < mapBounds.left || entityBounds.left > mapBounds.right) {
				// Entity is outside the left or right of Element

			}
			else {
				// Entity BB overlaps with Element BB

				switch (this.shape) {
				case 'box':
					// if rotated fall through to polygon check
					if (!this.body || this.body.a === 0) {
						return false;
					}
					/*falls through*/
				case 'polygons':
					// test all shape edges
					var point,
						distance = Infinity,
						bodyPos = entity.getBodyPos();
					for (var i = this.shapes.length; i-- > 0;) {
						var shape = this.shapes[i];
						var cpShape = shape.cpShape;
						var info = cpShape.nearestPointQuery(bodyPos);
						if (info.d < distance) {
							distance = info.d;
							point = info.p;
						}
					}
					// get Y direction of vector from entity to point ('normal')
					var direction = point.y - bodyPos.y;
					if (distance > 0) { // Entity is outside Element shape
						// Entity is in front of edge
						if (direction > 0) {
							if (ec.debug > 0) {
								entity.sortReason = 'edge '+this.name;
							}
							return true;
						}
					} else { // Entity is inside Element shape
						/// console.error(entity +' is inside '+ this);
						entity.z = mapBounds.top; //hack
					}
					break;

				case 'circle':
					// Entity is in front of Element
					if ((entityBounds.front + entityBounds.back)/2 > (mapBounds.front + mapBounds.back)/2) {
						if (ec.debug > 0) {
							entity.sortReason = 'center '+this.name;
						}
						return true;
					}
					break;

				default:
					throw('Invalid map shape type: '+ this.shape);
				}
			}

			return false;
		},

		// TODO: subclass mapType(s)
		assignShapes: function() {
			var x = this.x;
			var y = this.y;
			//var z = this.z;
			var shapes = this.shapes,
				shape, verts, o, p, i, pos, radius;

			if (this.mapType === 'wall' || this.mapType === 'bounds') {
				if (this.shape === 'polygons') {
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
								this.addConvexHull(pos, verts, this.body, v(shape.x-this.regX, this.regY-shape.y), shape);
								console.log('Wall Polygon verts "'+this.name+'" ['+this.x+','+this.y+']['+this.regY+','+this.regY+'] ['+shape.x+','+shape.y+']'+ verts);
							} catch (err) {
								console.error('Bad Wall Polygon in "'+this.name+'". '+err +' '+ verts);
							}
						}
					}
				} else if (this.shape === 'circle') {
					shape = shapes[0];
					pos = v(x + (shape.x|0), y + (shape.y|0));
					radius = (shape.width + shape.height)/4;
					this.addCircle(pos, radius, shape);
				} else { // TEST BOX?
					shape = shapes[0];
					pos = v(x, y-(shape.height/2));
					this.addBox(pos, shape.width, shape.height, shape);
				}

			} else if (this.mapType === 'floor') {
				if (this.shape === 'polygons') {
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
								this.addConvexHull(pos, verts, this.body, v(shape.x-this.regX, this.regY-shape.y), shape);
								console.log('Floor Polygon verts "'+this.name+'" ['+this.x+','+this.y+'] '+ verts);
							} catch (err) {
								console.error('Bad Floor Polygon in "'+this.name+':'+p+'". '+err +' '+ verts);
							}
						}
					}
				} else if (this.shape === 'circle') {
					shape = shapes[0];
					pos = v(x + shape.x, y + shape.y + this.depth);
					radius = (shape.width + shape.height)/4;
					this.addCircle(pos, radius, shape);
				} else { // TEST BOX?
					shape = shapes[0];
					pos = v(x, y+this.depth);
					this.addBox(pos, shape.width, shape.height, shape);
				}

			} else if (this.mapType === 'steps') {
				shape = shapes[0];
				pos = v(x, y-(shape.height/2));
				this.addBox(pos, shape.width, shape.height, shape);

			} else if (this.mapType === 'container' || this.mapType === 'parallax') {
				// we're good here

			} else {
				throw(this +'.assignShapes(): Invalid Map Type: '+ this.mapType);
			}
			return this;
		},

		addBox: function(v1, w, h, mapShape) {
			if (!assertSoft(w > 0 && h > 0, this +' addBox width and height must be positive and non-zero')) {
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
			this.addShape(shape, mapShape);
			return shape;
		},

		addCircle: function(v1, r, mapShape) { // TODO: Oval
			if (!assertSoft(r > 0, this +' addCircle radius must be positive and non-zero')) {
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
			this.addShape(shape, mapShape);
			return shape;
		},

		addPolygons: function(v1, verts, body, offset, mapShape) {
			body = body || new cp.Body(Infinity, Infinity);
			offset = offset || v(0,0);
			body.nodeIdleTime = Infinity;
			v1.y = -v1.y;
			body.p = v1;
			var shape = new cp.PolyShape(body, verts, offset);
			shape.setElasticity(0);
			shape.setFriction(1);
			shape.setLayers(ec.Collisions.NOT_GRABABLE_MASK);
			this.addShape(shape, mapShape);
			return shape;
		},

		addConvexHull: function(v1, verts, body, offset, mapShape) {
			cp.convexHull(verts, null, 2);
			return this.addPolygons(v1, verts, body, offset, mapShape);
		},

		addLineSegment: function(v1, v2, mapShape) {
			var shape = new cp.SegmentShape(this.space.staticBody, v1, v2, 0);
			shape.setElasticity(0);
			shape.setFriction(1);
			shape.setLayers(ec.Collisions.NOT_GRABABLE_MASK);
			this.addShape(shape, mapShape);
			return shape;
		},

		addShape: function(shape, mapShape) {
			//negative depth implies impassable bounds
			if (this.depth >= 0) {
				shape.depth = this.depth;
				shape.collision_type = ec.Collisions.MAP;
			}
			mapShape.cpShape = shape;
			this.setBody(shape.body);
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

		getPos: function() {
			return {
				x: this.x,
				y: this.y,
				z: this.z
			};
		},

		// TODO: subclass mapType(s)
		getSortBounds: function() {
			var bounds = this.sortBounds;
			if (!bounds.inited) {
				var shapes = this.shapes;
				bounds.inited = true;
				bounds.bottom = this.z;
				bounds.top = this.z + this.depth;
				if (shapes) {
					bounds.back = this.y - shapes[0].height;
					bounds.left  = this.x - shapes[0].width/2;
					bounds.right = this.x + shapes[0].width/2;
				} else {
					bounds.back = this.y;
					bounds.left  = this.x;
					bounds.right = this.x;
				}
				if (this.shape === 'polygons') {
					bounds.front = -Infinity;
					bounds.back  = Infinity;
					bounds.left  = Infinity;
					bounds.right = -Infinity;

					var offsetX, offsetY;
					for (var i = this.shapes.length; i-- > 0;) {
						var shape = this.shapes[i];
						offsetX = this.x - (this.regX - shape.x);
						offsetY = this.y - (this.regY - shape.y);
						if (this.mapType === 'floor') {
							offsetY += this.depth;
						}
						for (var p in shape.polygons) {
							var polys = shape.polygons[p];
							for (var j = polys.length; j-- > 0;) {
								var vert = polys[j];
								bounds.front = Math.max(bounds.front, offsetY+vert[1]);
								bounds.back  = Math.min(bounds.back,  offsetY+vert[1]);
								bounds.left  = Math.min(bounds.left,  offsetX+vert[0]);
								bounds.right = Math.max(bounds.right, offsetX+vert[0]);
							}
						}
					}
					console.log(this.mapType, this.name, 'yd', this.y+this.depth, 'r', this.regY, 'offsetY', offsetY);

				} else {
					switch (this.mapType) {
					case 'wall':
						bounds.front = this.y;
						break;

					case 'steps':
						bounds.front = this.y;
						bounds.top = this.z;
						bounds.bottom = this.z - this.depth;
						break;

					case 'floor':
						bounds.back = this.y + this.depth - shapes[0].height/2;
						bounds.front = bounds.back + shapes[0].height;
						break;

					case 'container': // TODO: create bounds for containers?
					case 'parallax':  // TODO: parallax sorting and depth
						bounds.front = -1;
						bounds.back  = -1;
						bounds.left  = -1;
						bounds.right = -1;
						return bounds; // no tests

					case 'entity':
						throw('entity sorting should not be handled by element instances');

					default:
						//throw('unexpected element mapType: ' + this.mapType);
						if (shapes) {
							bounds.front = this.y + shapes[0].height;
						} else {
							bounds.front = this.y;
						}
					}
				}

				//test bounds:
				if (ec.debug > 0) {
					var dimension = bounds.right - bounds.left;
					if (!assertSoft(dimension > 0, this +' bounds width '+ dimension)) {
						throw('bounds width should be greater than 0');
					}
					dimension = bounds.front - bounds.back;
					if (!assertSoft(dimension > 0, this +' bounds height '+ dimension)) {
						if (dimension < 0) {
							throw('bounds height cannot be a negative number');
						} 
					}
					dimension = bounds.top - bounds.bottom;
					if (!assertSoft(dimension > 0, this +' bounds depth '+ dimension)) {
						if (dimension < 0) {
							throw('bounds depth cannot be a negative number');
						}
					}
					if (!assertSoft(
						bounds.front !== -Infinity &&
						bounds.back  !== Infinity &&
						bounds.left  !== -Infinity &&
						bounds.right !== Infinity,
						this +' bounds not set')) {
						throw('bounds cannot be infinite');
					}
				}
			}
			return bounds;
		}
	};

	function assertSoft(value, message) {
		if (!value) {
			console.warn('Assertion failed: ' + message);
		}
		return value;
	}

})(window);