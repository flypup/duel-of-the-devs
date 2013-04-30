(function(window) {

	var ec = window.ec;
	
	var _images = {};
	var _cache = {};
	var _loaded = {};

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
			_loaded[image.src] = false;
			image.onload = function() {
				_loaded[image.src] = true;
			};
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

		image = ec.getImage(image.src);

		//image loading
		if (!image.width || !image.height) {
			return image;
		}

		if (!_loaded[image.src]) {
			//console.warn('Caching unloaded image', image);
			return image;
		}

		//cache image
		return ec.appendCache(id, image);
	};

	ec.appendCache = function(id, image) {
		if (ec.debug === 1) {ec.core.traceTime('appendCache '+id);}

		var canvas = window.document.createElement('canvas');
		var context = canvas.getContext('2d');
		canvas.width  = image.width;
		canvas.height = image.height;
		context.drawImage(image, 0, 0);

		_cache[id] = canvas;

		if (ec.debug === 1) {ec.core.traceTimeEnd('appendCache '+id);}

		return canvas;
	};

})(window);