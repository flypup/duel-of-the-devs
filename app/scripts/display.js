(function(window) {
	'use strict';

	var ec = window.ec;
	var document = window.document;

	ec.resizeDisplay = function() {
		
		// pixel ratio (x2 = retina, reduce scale to improve performance of canvas rendering)
		var pixelRatioX, pixelRatioY;

		// viewport width and height
		var width, height;


		pixelRatioX =
		pixelRatioY = ec.forcePixelRatio || window.devicePixelRatio || 1;
		
		/* iPad 3 does not render full resultion well */
		// TODO: do same for iPhone 4
		if (ec.ipad && !ec.webgl) {
			pixelRatioY = Math.min(1.333333, pixelRatioX);
			pixelRatioX = Math.min(1,        pixelRatioX);
		}

		
		if (ec.mobile) {
			// fit to screen
			var screenWidth  = Math.max(window.screen.width, window.screen.height);
			var screenHeight = Math.min(window.screen.width, window.screen.height);
			width  = screenWidth;
			height = screenHeight;

		} else {
			// fit to browser window
			var x = 16;
			var y = 9;
			var maxWidth, maxHeight;

			width  = x;
			height = y;
			maxWidth  = window.innerWidth;
			maxHeight = window.innerHeight;

			while(width + x <= maxWidth && height + y <= maxHeight) {
				width  += x;
				height += y;
			}
			//center display in browser window
			document.body.style.left = Math.floor((maxWidth - width)/2) + 'px';
			document.body.style.top  = Math.floor((maxHeight - height)/2) + 'px';
		}

		if (ec.width !== width || ec.height !== height || ec.pixelRatio !== pixelRatioX || ec.pixelRatioY !== pixelRatioY) {
			ec.pixelRatio = pixelRatioX;
			ec.pixelRatioY = pixelRatioY;
			ec.width  = width;
			ec.height = height;
			document.body.style.width  = width + 'px';
	        document.body.style.height = height + 'px';

	        return true;
	    }

	    return false;
	};

})(window);