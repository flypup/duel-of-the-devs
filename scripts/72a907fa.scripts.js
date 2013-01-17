(function(window) {
	'use strict';

	window.ec = window.ec || {};
	var appCache = window.applicationCache;

	if (appCache) {
		applicationCache.update();
		window.location.reload();
	}

})(window);