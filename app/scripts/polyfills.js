!function(window) {

	if (!Date.now) {
		Date.now = function now() {
			return +(new Date());
		};
	}

	// requestAnimationFrame polyfill by Erik Möller
	// fixes from Paul Irish and Tino Zijdel
	var requestAnimationFrame = window.requestAnimationFrame || prefixed('RequestAnimationFrame', window);
	var cancelAnimationFrame = window.cancelAnimationFrame || prefixed('CancelAnimationFrame', window) || prefixed('CancelRequestAnimationFrame', window) || function ( id ) { window.clearTimeout( id ); };
	if (!requestAnimationFrame) {
		var lastTime = 0;
		requestAnimationFrame = function(callback) {
			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	var localStorage = window.localStorage ||
		{
			_data       : {},
			setItem     : function(id, val) { return this._data[id] = String(val); },
			getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
			removeItem  : function(id) { return delete this._data[id]; },
			clear       : function() { return this._data = {}; }
		};

}(window);