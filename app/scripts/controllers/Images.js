(function(window) {
	'use strict';

	var ec = window.ec;
	var document = window.document;
	
	var _images = {};
	var _cache = {};

	ec.clearImages = function() {
		_images = {};
	};

	ec.clearCache = function() {
		_cache = {};
	};

	ec.getImage = function(src) {
		var image = _images[src];
		if (!image) {
			image = _images[src] = new Image();
			image.src = src;
		}
		return image;
	};

	ec.getCached = function(image, id) {
		id = id || image.src;
		
		//cached element
		var cached = _cache[id];
		if (cached) {
			return cached;
		}

		//image loading
		if (!image.width || !image.height) {
			return image;
		}

		//cache image
		return ec.appendCache(id, image);
	};

	ec.appendCache = function(id, image) {
		if (ec.debug === 1) {ec.core.traceTime('appendCache '+id);}

		var canvas = document.createElement('canvas');
		canvas.width  = image.width;
		canvas.height = image.height;
		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		_cache[id] = canvas;

		if (ec.debug === 1) {ec.core.traceTimeEnd('appendCache '+id);}

		return canvas;
	};

})(window);