var ec = ec || {};

(function() {
	'use strict';

	ec.resizeDisplay = function() {
		//console.log('inner', window.innerWidth, window.innerHeight);
		//console.log('screen', window.screen.width, window.screen.height, 'x', window.devicePixelRatio);

		ec.pixelRatioY =
		ec.pixelRatio = window.devicePixelRatio || 1;
		/* iPad 3 does not render full resultion well */
		// TODO: do same for iPhone 4
		if (ec.ipad) {
			ec.pixelRatioY = Math.min(1.333333, ec.pixelRatio);
			ec.pixelRatio  = Math.min(1, ec.pixelRatio);
		}

		var screenWidth  = Math.max(window.screen.width, window.screen.height);
		var screenHeight = Math.min(window.screen.width, window.screen.height);

		var width, height, maxWidth, maxHeight;

		if (ec.mobile) {
			width  = screenWidth;
			height = screenHeight;

		} else {
			var x = 16;
			var y = 9;

			width  = x;
			height = y;
			maxWidth  = window.innerWidth;
			maxHeight = window.innerHeight;

			while(width + x <= maxWidth && height + y <= maxHeight) {
				width  += x;
				height += y;
			}
		}

		if (!ec.mobile) {
			document.body.style.left = Math.floor((maxWidth - width)/2) + 'px';
			document.body.style.top  = Math.floor((maxHeight - height)/2) + 'px';
		}
		if (ec.width === width && ec.height === height) {
			return false;
		}
		ec.width  = width;
		ec.height = height;
		document.body.style.width  = width + 'px';
        document.body.style.height = height + 'px';

        //console.log('display', width, height);
        return true;
	};

})();