(function(window) {

	var ec = window.ec;
	var document = window.document;

	ec.resizeDisplay = function() {
		
		// pixel ratio (x2 = retina, reduce scale to improve performance of canvas rendering)
		var pixelRatio;

		// viewport width and height
		var width, height;


		pixelRatio = ec.forcePixelRatio || window.devicePixelRatio || 1;
		
		if (ec.mobile) {
			// fit to screen
			var screenWidth  = Math.max(window.screen.width, window.screen.height);
			var screenHeight = Math.min(window.screen.width, window.screen.height);
			width  = screenWidth;
			height = screenHeight;

			/* iPad 3 does not render full resultion well */
			// TODO: do same for iPhone 4
			if (ec.ipad) {//} && !ec.webgl) {
				pixelRatio = Math.min(1, pixelRatio);

				if (!ec.standalone) {
					height -= 96;
				}
			}

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

		if (ec.width !== width || ec.height !== height || ec.pixelRatio !== pixelRatio) {
			ec.pixelRatio = pixelRatio;
			ec.width  = width;
			ec.height = height;
			document.body.style.width  = width + 'px';
	        document.body.style.height = height + 'px';

	        return true;
	    }

	    return false;
	};

})(window);