var ec = ec || {};

(function() {
	'use strict';

	ec.initDisplay = function() {
		//console.log('inner', window.innerWidth, window.innerHeight);
		//console.log('screen', window.screen.width, window.screen.height, 'x', window.devicePixelRatio);

		ec.pixelRatio = window.devicePixelRatio || 1;

		var screenWidth  = Math.max(window.screen.width, window.screen.height);
		var screenHeight = Math.min(window.screen.width, window.screen.height);

		var width, height;

		if (ec.mobile) {
			width  = screenWidth;
			height = screenHeight;

		} else {
			var x = 16;
			var y = 9;

			var maxWidth  = window.innerWidth;
			var maxHeight = window.innerHeight;

			width  = x;
			height = y;

			while(width + x <= maxWidth && height + y <= maxHeight) {
				width  += x;
				height += y;
			}

			document.body.style.left = Math.floor((maxWidth - width)/2) + 'px';
			document.body.style.top  = Math.floor((maxHeight - height)/2) + 'px';
		}

		ec.width  = width;
		ec.height = height;
		document.body.style.width  = width + 'px';
        document.body.style.height = height + 'px';

        //console.log('display', width, height);
	};

})();