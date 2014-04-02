(function(window) {

	var ec = window.ec;

	var Canvas2dView = ec.Canvas2dView = function() {
		this.children = [];
		
		var canvas = this.canvas = window.document.createElement( 'canvas' );
		canvas.style.position = 'absolute';

		if (/Firefox\//.test(navigator.userAgent)) {
			var mozOpaque = document.createAttribute('moz-opaque');
			canvas.setAttributeNode(mozOpaque);
		}

		this.context = canvas.getContext('2d');

		this.resize(ec.width, ec.height, ec.pixelRatio);

		window.document.body.appendChild( this.canvas );

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Canvas2dView.prototype = {

		draw: function(delta) {
			var context = this.context;

	        var children = this.children;
			for (var i = 0, len = children.length; i < len; i++) {
				children[i].draw(context, delta);
			}
		},

		pause: function() {

		},

		resume: function() {

		},

		getDom: function() {
			return this.canvas;
		},

		add: function(child) {
			if (this.children.indexOf(child) < 0) {
				child.resize(this.width, this.height, this.pixelRatio);
				this.children.push(child);
				return child;
			}
			console.error('object already a child of world', child);
			return null;
		},

		remove: function(child) {
			var index = this.children.indexOf(child);
			if (index > -1) {
				this.children.splice(index, 1);
				return child;
			}
			console.error('object not a child of world', child);
			return null;
		},

		removeAll: function() {
			this.children.length = 0;
		},

		resize: function(width, height, ratio) {
			var canvas = this.canvas;
			this.width = width;
			this.height = height;
			this.pixelRatio = ratio;
			canvas.width  = width  * ratio;
			canvas.height = height * ratio;
			canvas.style.width  = this.width  + 'px';
			canvas.style.height = this.height + 'px';

			var children = this.children;
			for (var i = 0, len = children.length; i < len; i++) {
				children[i].resize(width, height, ratio);
			}
		},

		debugGui: function(debugView) {
			var view = this;
			var resize = function() {
				var pixelRatio = ec.pixelRatio;
				ec.resizeDisplay();
				ec.pixelRatio = pixelRatio;
				view.resize(ec.width, ec.height, pixelRatio);
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
						{name: 'pixelRatio',  params:{min: 1, max: 2, step: 0.5}, onChange: resize}
					]
				}
			]);
		}
	};

})(window);