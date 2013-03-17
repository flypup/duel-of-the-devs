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
			layerNum: 0,
			visible: true,
			body: null,
			imageData: null,
			sortBounds: {top:0, front:0, back:0, inited: false},
			label: null
		});

		ec.copy(this, element);
		this.init();
		
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
			if (this.mDepth) {
				this.depth = this.mDepth;
			}
			if (this.mHeight) {
				this.shapes = this.shapes || [{}];
				this.shapes[0].height = this.mHeight;
			}
			if (this.mWidth) {
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

		addMapElementBody: function(world) {
			var x = this.x;
			var y = this.y;
			//var z = this.z;
			var shapes = this.shapes,
				shape, verts, o, p, i;

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
								wall = world.addConvexHull(v(x, y), verts, this.body, v(shape.x-this.regX, this.regY-shape.y));
								wall.depth = this.depth;
								wall.collision_type = ec.Collisions.MAP;
								console.log('Wall Polygon verts "'+this.name+'" ['+this.x+','+this.y+']['+this.regY+','+this.regY+'] ['+shape.x+','+shape.y+']'+ verts);
							} catch (err) {
								console.error('Bad Wall Polygon in "'+this.name+'". '+err +' '+ verts);
							}
						}
					}
				} else {
					wall = world.addBox(v(x, y-(shapes[0].height/2)), shapes[0].width, shapes[0].height);
					wall.depth = this.depth;
					wall.collision_type = ec.Collisions.MAP;
					this.setBody(wall.body);
				}
				world.elements.push(this);

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
								floorShape = world.addConvexHull(v(x, y+this.depth), verts, this.body, v(shape.x-this.regX, this.regY-shape.y));
								floorShape.depth = this.depth;
								floorShape.collision_type = ec.Collisions.MAP;
								console.log('Floor Polygon verts "'+this.name+'" ['+this.x+','+this.y+'] '+ verts);
							} catch (err) {
								console.error('Bad Floor Polygon in "'+this.name+':'+p+'". '+err +' '+ verts);
							}
						}
					}
				} else if (this.shape === 'oval') {
					floorShape = world.addCircle(
						v(x + shapes[0].x, y + shapes[0].y + this.depth),
						(shapes[0].width + shapes[0].height)/4);
					floorShape.depth = this.depth;
					floorShape.collision_type = ec.Collisions.MAP;
					this.setBody(floorShape.body);
				} else {
					floorShape = world.addBox(v(x, y+this.depth), shapes[0].width, shapes[0].height);
					floorShape.depth = this.depth;
					floorShape.collision_type = ec.Collisions.MAP;
					this.setBody(floorShape.body);
				}
				world.elements.push(this);

			} else if (this.mapType === 'steps') {
				var steps = world.addBox(v(x, y-(shapes[0].height/2)), shapes[0].width, shapes[0].height);
				steps.depth = this.depth;
				steps.collision_type = ec.Collisions.MAP;
				this.setBody(steps.body);
				world.elements.push(this);

			} else if (this.mapType === 'container' || this.mapType === 'parallax') {
				// we're good here

			} else {
				throw(this +' World.addMapElementBody(): Invalid Map Type: '+ world.mapType);
			}
		},

		setBody: function(body) {
			this.body = body;
			body.userData = {
				parent: this
			};
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
			if (entity.z >= this.z && entityBounds.front > mapBounds.back) {
				return true;
			}

			return false;
		},

		isBehindEntity2: function(entity) {
			switch (this.mapType) {
			case 'container':
			case 'parallax':
				return false;
			}
			var mapBounds = this.getSortBounds();
			if (this.mapType === 'floor') {
				if (entity.mapCollision.length) {
					if (entity.mapCollision.indexOf(this) > -1) {
						if (entity.z >= mapBounds.top) {
							return true;
						}
					}
				} else if (entity.z >= mapBounds.top) {
					return true;
				}
			} else {
				var entityBounds = entity.getSortBounds();
				if (this.mapType === 'wall') {
					// TODO: raycast a->b normal
					if (entityBounds.front > mapBounds.front) {
						return true;
					}
				} else if (this.mapType === 'steps') {
					if (entity.z >= this.z && entityBounds.front > mapBounds.back) {
						return true;
					}
				} else {
					throw(this +' isBehindEntity(): Invalid Map Type: '+ this.mapType);
				}
			}
			return false;
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
				bounds.inited = true;
				bounds.top = this.z + this.depth;
				bounds.back = this.y - this.shapes[0].height;
				if (this.mapType === 'entity') {
					throw('entity sorting should not be handled by element instances');

				} else if (this.shape === 'polygons' && this.shapes) {
					var shapes = this.shapes;
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
					bounds.back = this.y + this.depth - this.shapes[0].height/2;
					bounds.front = bounds.back + this.shapes[0].height;
				} else if (this.mapType === 'parallax') {
					bounds.front = -1; // TODO: parallax sorting and depth
					bounds.back = -1;
				} else {
					//throw('unexpected element mapType: ' + this.mapType);
					//shape
					bounds.front = this.y + this.shapes[0].height;
				}
			}
			return bounds;
		}
	};

})(window);