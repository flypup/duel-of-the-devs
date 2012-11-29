(function(window) {
	'use strict';

	var ec = window.ec;

	//coordinates are relative to a container of this size:
	var REF_WIDTH  = 1136;
	var REF_HEIGHT = 640;

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

		this.touches = [];
		this.pressed = false;
		this.vx =
		this.vy = 0;
	};

	var proto = ButtonOverlay.prototype;
	proto.containerWidth = REF_WIDTH;
	proto.containerHeight = REF_HEIGHT;

	proto.hitTest = function(x, y, width, height) {
		this.containerWidth = width;
		this.containerHeight = height;
		if (this.type === 'circle') {
			var vx = x * REF_WIDTH  / width - this.x;
			var vy = y * REF_HEIGHT / height - this.y;
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

	proto.addTouch = function(id) {
		if (this.touches.indexOf(id) < 0) {
			this.touches.push(id);
		}
	};

	proto.removeTouch = function(id) {
		var index = this.touches.indexOf(id);
		if (index > -1) {
			this.touches.splice(index, 1);
			this.vx =
			this.vy = 0;
		}
	};

	proto.hasTouch = function(id) {
		return (this.touches.indexOf(id) > -1);
	};

	proto.updateTouch = function(id, x, y) {
		var vx = x * REF_WIDTH  / this.containerWidth - this.x;
		var vy = y * REF_HEIGHT / this.containerHeight -this.y;
		//normalize and cap at 100 ?//
		var length = Math.sqrt(vx*vx + vy*vy);
		if (Math.abs(vx) > Math.abs(vx*100/length)) {
			vx = vx*100/length;
		}
		if (Math.abs(vy) > Math.abs(vy*100/length)) {
			vy = vy*100/length;
		}
		this.vx = vx;
		this.vy = vy;
	};

	proto.touchStart = function(data, id) {
		console.log('touchStart', this);
		this.addTouch(id);
		this.pressed = true;
		this.updateTouch(id, data.clientX, data.clientY);
	};

	proto.touchEnd = function(data, id) {
		if (this.hasTouch(id)) {
			console.log('touchEnd', this);
			this.removeTouch(id);
			this.pressed = false;
		}
	};

	proto.draw = function(context, width, height) {
		//if (context instanceof window.CanvasRenderingContext2D) {
		if (this.type === 'circle') {
			context.beginPath();
			context.setFillColor(0, 0.05);
			context.arc(this.x * REF_WIDTH/width, this.y * REF_HEIGHT/height, this.radius * REF_WIDTH/width, 0, 2*Math.PI, false);
			context.fill();
			if (this.pressed) {
				context.beginPath();
				context.setFillColor(0, 0.1);
				context.arc((this.x + this.vx) * REF_WIDTH/width, (this.y + this.vy) * REF_HEIGHT/height, 80*REF_WIDTH/width, 0, 2*Math.PI, false);
				context.fill();
			}
		}
	};

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