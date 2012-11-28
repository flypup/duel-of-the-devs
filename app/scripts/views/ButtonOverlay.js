(function(window) {
	'use strict';

	var ec = window.ec;

	//coordinates are relative to a container of this size:
	var CONTAINER_WIDTH  = 1136;
	var CONTAINER_HEIGHT = 640;

	var defaults = {
		type: 'circle',
		x: 0,
		y: 0,
		radius: 50
	};
	/*
	 *	{
	 *		type: 'rectangle',
	 *		left: 0,
	 *		top: 0,
	 *		bottom: 50,
	 *		right: 50
	 *	};
	 */

	var ButtonOverlay = ec.ButtonOverlay = function(options) {
		options = extend( options || {}, defaults );

		extend(this, options);
		this.radiusSq = this.radius ? this.radius*this.radius : 0;
	};

	var proto = ButtonOverlay.prototype;

	proto.hitTest = function(x, y, width, height) {
		if (this.type === 'circle') {
			var vx = this.x  - x * CONTAINER_WIDTH  / width;
			var vy = this.y  - y * CONTAINER_HEIGHT / height;
			if (vx*vx + vy*vy <= this.radiusSq) {
				return true;
			}
		} else if (this.type === 'rectangle') {
			if (x > this.left && x < this.right && y > this.top && y < this.buttom) {
				return true;
			}
		} else {
			console.error(this, 'invalid type:', this.type);
		}
		return false;
	};


	//proto.nob =  // gamepad stick

	//proto.slide =  // L/R slider

	var extend = function( target, source ) {
        for ( var prop in source ) {
			//if ( target[ prop ] === undefined ) {
            if ( !target.hasOwnProperty( prop ) ) {
                target[ prop ] = source[ prop ];
            }
        }
        return target;
    };

})(window);