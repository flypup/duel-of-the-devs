(function(window) {
	'use strict';

	var ec = window.ec;

	ec.extend = function( target, source ) {
        for ( var prop in source ) {
			if ( source.hasOwnProperty( prop ) ) {
	            if ( !target.hasOwnProperty( prop ) ) {
					var copy = source[ prop ];
					if (copy !== undefined) {
						target[ prop ] = source[ prop ];
					}
	            }
	        }
        }
        return target;
    };

    ec.create = function(obj) {
		function F() {}
		F.prototype = obj;
		return new F();
    };

	ec.delegate = function(obj, func) {
		return function() {
			return func.apply(obj, arguments);
		};
	};

})(window);