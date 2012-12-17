(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dView = ec.Canvas2dView = function() {
		this.children = [];
		
		var canvas = this.canvas = window.document.createElement( 'canvas' );
		canvas.style.position = 'absolute';

		this.context = canvas.getContext('2d');

		this.resize(ec.width, ec.height);

		window.document.body.appendChild( this.canvas );
	};

	var proto = Canvas2dView.prototype;

	proto.draw = function(delta) {
		var context = this.context;

        var children = this.children;
		for (var i = 0, len = children.length; i < len; i++) {
			children[i].draw(context, delta);
		}
	};

	proto.pause = function() {

	};

	proto.resume = function() {

	};

	proto.getDom = function() {
		return this.canvas;
	};

	proto.add = function(child) {
		if (this.children.indexOf(child) < 0) {
			child.resize(this.width, this.height);
			this.children.push(child);
			return child;
		}
		console.error('object already a child of world', child);
		return null;
	};

	proto.remove = function(child) {
		var index = this.children.indexOf(child);
		if (index > -1) {
			this.children.splice(index, 1);
			return child;
		}
		console.error('object not a child of world', child);
		return null;
	};

	proto.removeAll = function() {
		this.children.length = 0;
	};

	proto.resize = function(width, height) {
		var ratioX = ec.pixelRatio;
		var ratioY = ec.pixelRatioY || ratioX;
		var canvas = this.canvas;
		this.width = width;
		this.height = height;
		canvas.width  = width  * ratioX;
		canvas.height = height * ratioY;
		canvas.style.width  = this.width  + 'px';
		canvas.style.height = this.height + 'px';

		var children = this.children;
		for (var i = 0, len = children.length; i < len; i++) {
			children[i].resize(width, height);
		}
	};

	proto.copy  = function(otherView) {
		this.context.drawImage(otherView.canvas, parseInt(otherView.canvas.style.left, 10), parseInt(otherView.canvas.style.top, 10));
	};

	proto.debugGui = function(debugView) {
		var view = this;
		var resize = function() {
			var pixelRatioX = ec.pixelRatio;
			var pixelRatioY = ec.pixelRatioY;
			ec.resizeDisplay();
			ec.pixelRatio = pixelRatioX;
			ec.pixelRatioY = pixelRatioY;
			view.resize();
		};
		debugView.addGui([
			{
				name: 'view',
				remember: true,
				target: view[0], //worldView
				props: [
					{name: 'x', params:{min: -480, max: 1600}}, //lookAt()
					{name: 'y', params:{min: -320, max: 1600}}, //lookAt()
					{name: 'zoom', onChange: function(value){view.zoom(value);}, params:{step: 0.01, min: 0.25, max: 4}}
				]
			},
			{
				name: 'pixelRatio',
				target: ec,
				props: [
					{name: 'pixelRatio',  params:{min: 1, max: 2, step: 0.5}, onChange: resize},
					{name: 'pixelRatioY', params:{min: 1, max: 2, step: 0.5}, onChange: resize}
				]
			}
		]);
	};

})(window);