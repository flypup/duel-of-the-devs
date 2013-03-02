(function(window) {

	var ec = window.ec;
	var Stats = window.Stats;
	var dat = window.dat;

	var DebugView = ec.DebugView = function() {
		var stats =
		this.stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
	    //window.document.body.appendChild( stats.domElement );

	    if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	DebugView.prototype.begin = function() {
		this.stats.begin();
	};

	DebugView.prototype.end = function() {
		this.stats.end();
	};

	DebugView.prototype.show = function() {
		this.stats.domElement.style.display = 'block';
		window.document.body.appendChild( this.stats.domElement );
	};

	DebugView.prototype.hide = function() {
		this.stats.domElement.style.display = 'none';
		if (this.stats.domElement.parentNode) {
			window.document.body.removeChild( this.stats.domElement );
		}
	};

	DebugView.prototype.addGui = function(settings) {
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

	DebugView.prototype.worldGui = function(world) {
		this.addGui([
			{
				name: 'space',
				remember: true,
				target: world.space,
				props: [
					{name: 'iterations', params:{min: 1, max: 40}},
					{name: 'sleepTimeThreshold', params:{step: ec.TIME_STEP, min: ec.TIME_STEP, max: 1}},
					{name: 'collisionSlop', params:{step: 0.1, min: 0.1, max: 1}},
					'damping',
					{name: 'idleSpeedThreshold', listen: true, params:{min: 0, max: 50}},
					{name: 'collisionBias'},
					'enableContactGraph'
				]
			}
		]);
		this.addGui([
			{
				name: 'gravity',
				target: world.space.gravity,
				props: [
					{name: 'x', params:{step: 10, min: -1000, max: 1000}},
					{name: 'y', params:{step: 10, min: -1000, max: 1000}}
				]
			}
	    ]);
	};

})(window);