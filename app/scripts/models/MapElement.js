(function(window) {
	'use strict';

	var ec = window.ec;

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

	var proto = MapElement.prototype;

	proto.init = function() {
		// TODO: get rid of drawX,Y - should all work the same way
		if (this.regX) {
			this.drawX = this.x - this.regX;
			this.drawY = this.y - this.regY;
		} else {
			this.drawX = this.x || 0;
			this.drawY = this.y || 0;
			this.regX = 0;
			this.regY = 0;
		}
		// TODO: just use z and depth in MapComponent/editor
		this.z = this.mZ || this.z;
		this.y = this.y + this.z;
		this.depth = this.mDepth || this.depth;
		
		if (this.children) {
			for (var i=this.children.length; i-- > 0;) {
				var child = this.children[i];
				child.drawX = child.x;
				child.drawY = child.y;
			}
		}
	};

	proto.loadImages = function(path) {
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
	};

	proto.setBody = function(body) {
		this.body = body;
		body.userData = {
			parent: this
		};
	};

	proto.isBehindEntity = function(entity) {
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
	};

	proto.toString = function() {
		return '[MapElement "'+this.name+'"]';
	};

	proto.getTop = function(x, y) {
		if (this.mapType === 'steps') {
			var top = this.z + this.depth * (this.y-y) / this.mHeight;
			return Math.min(this.z + this.depth, Math.max(0, top));
		}
		return this.z + this.depth;
	};

	proto.getSortBounds = function() {
		var bounds = this.sortBounds;
		if (!bounds.inited) {
			bounds.inited = true;
			bounds.top = this.z + this.depth;
			bounds.back = this.y - this.mHeight;
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
					bounds.back = this.y + this.depth - this.mHeight/2;
					bounds.front = bounds.back + this.mHeight;
			} else if (this.mapType === 'parallax') {
					bounds.front = -1; // TODO: parallax sorting and depth
					bounds.back = -1;
			} else {
				//throw('unexpected element mapType: ' + this.mapType);
				//shape
				bounds.front = this.y + this.mHeight;
			}
		}
		return bounds;
	};

})(window);