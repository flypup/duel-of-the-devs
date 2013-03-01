(function(window) {

	function prefixed(str, obj) {
		return obj[str] || obj['webkit' + str] || obj['moz' + str] || obj['o' + str] || obj['ms' + str];
	}

	var date = Date;
	if (!date.now) {
		date.now = function() {
			return +(new date());
		};
	}

	if (!window.requestAnimationFrame) {
		var lastTime = 0;
		window.requestAnimationFrame = prefixed('RequestAnimationFrame', window) || function(callback) {
			var currTime = date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = prefixed('CancelAnimationFrame', window) || prefixed('CancelRequestAnimationFrame', window) || function ( id ) { window.clearTimeout( id ); };
	}

	if (!window.localStorage) {
		window.localStorage = {
			_data       : {},
			setItem     : function(id, val) { return this._data[id] = String(val); },
			getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
			removeItem  : function(id) { return delete this._data[id]; },
			clear       : function() { return this._data = {}; }
		};
	}

	var document = window.document;
	var navigator = window.navigator;
	var body = document.body;

	if (!body.requestFullscreen) {
		body.requestFullscreen = body.requestFullscreen || prefixed('RequestFullScreen', body) || prefixed('RequestFullscreen', body);
		document.cancelFullScreen = prefixed('CancelFullScreen', document);
	}

	//tests
	if (!window.AudioContext) {
		window.AudioContext = prefixed('AudioContext', window);
	}

	if (!navigator.getGamepads) {
		navigator.getGamepads = prefixed('GetGamepads', navigator);
	}

})(window);
