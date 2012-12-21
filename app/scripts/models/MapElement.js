(function(window) {
	'use strict';

	var ec = window.ec;

	var MapElement = ec.MapElement = function() {

	};

	var proto = MapElement.prototype;
	proto.z = 0;
	proto.depth = 0;
	proto.layerNum = 0;

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
		this.depth = this.mDepth || this.depth;
		//visible
		
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
			this.imageData = new Image();
			this.imageData.src = path +'/'+ (this.image || this.fillImage);
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

	proto.getSortBounds = function() {
		this.sortBounds = this.sortBounds || {top:0, front:0, back:0};
		this.sortBounds.top = this.z + this.depth;
		this.sortBounds.back = this.y - this.mHeight;
		if (this.mapType === 'entity') {
			throw('entity sorting should not be handled by element instances');
		} else if (this.mapType === 'wall') {
			this.sortBounds.front = this.y;
			//this.sortBounds.back = this.y;
		} else if (this.mapType === 'steps') {
			this.sortBounds.top = this.z;
			this.sortBounds.front = this.y;
		} else if (this.mapType === 'floor') {
			this.sortBounds.front = this.y - this.height/2;
		} else if (this.mapType === 'parallax') {
			this.sortBounds.front = -1; // TODO: parallax sorting and depth
			this.sortBounds.back = -1;
		} else {
			//throw('unexpected element mapType: ' + this.mapType);
			//shape
			this.sortBounds.front = this.y + this.height;
		}
		return this.sortBounds;
	};

})(window);