(function(window) {
	'use strict';

	window.ec = ec || {};
	var appCache = window.applicationCache;

	if (appCache) {
		applicationCache.update();
		window.location.reload();
	}

})(window);