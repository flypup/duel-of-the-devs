var ec = ec || {};
var Stats = Stats;
var dat = dat;
(function() {
	'use strict';

	ec.DebugView = function() {
		var stats =
		this.stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
	    document.body.appendChild( stats.domElement );
	};

	ec.DebugView.prototype.addGui = function(settings) {
	    var gui = new dat.GUI();
	    var folder = gui;
	    for(var i=0; i<settings.length; i++) {
			var object = settings[i];
			if (object.remember) {
				gui.remember(object.target);
			}
			if (object.name) {
				folder = gui.addFolder(object.name);
				folder.open();
			}
			for(var j=0; j<object.props.length; j++) {
				var prop = object.props[j];
				var name = prop;
				var params = null;
				var controller;
				if (prop.name) {
					params = prop.params;
					name = prop.name;
				}
				if (params) {
					if (params.min !== undefined && params.max !== undefined) {
						controller = folder.add(object.target, name, params.min, params.max, params.step);
					} else if (params.step) {
						controller = folder.add(object.target, name).step(params.step);
					}
				} else {
					controller = folder.add(object.target, name, params);
				}
				if (prop.listen) {
					controller.listen();
				}
				if (prop.onChange) {
					controller.onChange(prop.onChange);
				}
			}
	    }
	    return gui;
	};

})();