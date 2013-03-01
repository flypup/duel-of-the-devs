(function(window) {
	
	window.ec = window.ec || {};
	var appCache = window.applicationCache;
	var timeoutAppCacheCheckAfter = 5000;

	ec.appCache = {
		loaded: 0,
		total: 0,
		complete: false,
		timedout: false
	};

	// handle app cache loading and refreshes
	if (appCache && appCache.status !== appCache.UNCACHED) {
		var toId = window.setTimeout(function(){
			ec.appCache.timedout = true;
		}, timeoutAppCacheCheckAfter);

		appCache.addEventListener('noupdate', function() {
			window.clearTimeout(toId);
			ec.appCache.progress = 100;
			ec.appCache.complete = true;
		}, false);

		appCache.addEventListener('downloading', function() {
			window.clearTimeout(toId);
		}, false);

		appCache.addEventListener('progress',  function(e) {
			ec.appCache.loaded = e.loaded;
			ec.appCache.total  = e.total;
		}, false);

		appCache.addEventListener('updateready', function() {
			if (appCache.status === appCache.UPDATEREADY) {
				ec.appCache.progress = 100;
				window.clearTimeout(toId);
				appCache.swapCache();
				window.location.reload();
			}
		}, false);

		appCache.addEventListener('cached', function() {
			ec.appCache.progress = 100;
			ec.appCache.complete = true;
			window.clearTimeout(toId);
		}, false);

	} else {
		ec.appCache.complete = true;
	}

})(window);