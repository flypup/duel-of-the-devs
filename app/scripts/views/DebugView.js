var ec = ec || {};
var Stats = Stats;
var dat = dat;
(function() {
	'use strict';
	var THREE = window.THREE;

	var DebugView = ec.DebugView = function() {
		var stats =
		this.stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
	    document.body.appendChild( stats.domElement );
	};

	DebugView.prototype.show = function() {
		this.stats.domElement.style.display = 'block';
	};

	DebugView.prototype.hide = function() {
		this.stats.domElement.style.display = 'none';
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

	DebugView.prototype.viewGui = function(view) {
		var lookAtCenter = function() {//e) {//e.object, e.property
			view.lookAt(0, 160, 0);
		};
		var updateMatrix = function() {
			view.camera.updateProjectionMatrix();
		};
		var cameraProps = [];
		if (view.camera instanceof THREE.PerspectiveCamera) {
			cameraProps.push({name: 'fov',    listen: true, onChange: updateMatrix});
			cameraProps.push({name: 'aspect', listen: true, onChange: updateMatrix});
			cameraProps.push({name: 'near', onChange: updateMatrix, params:{step: 10, min: 1, max: 1000}});
		} else {
			cameraProps.push({name: 'left',  onChange: updateMatrix, params:{min: -10000, max: -100}});
			cameraProps.push({name: 'right', onChange: updateMatrix, params:{min: 100, max: 10000}});
			cameraProps.push({name: 'bottom',  onChange: updateMatrix, params:{min: -10000, max: -100}});
			cameraProps.push({name: 'top', onChange: updateMatrix, params:{min: 100, max: 10000}});
			cameraProps.push({name: 'near', onChange: updateMatrix, params:{step: 10, min: -10000, max: 10000}});
		}
		cameraProps.push({name: 'far',  onChange: updateMatrix, params:{step: 100, min: 1000, max: 10000}});

		this.addGui([
			{
				name: 'camera position',
				remember: true,
				target: view.camera.position,
				props: [
					{name: 'x', listen: true, onChange: lookAtCenter, params:{step: 10, min: -5000, max: 5000}},
					{name: 'y', listen: true, onChange: lookAtCenter, params:{step: 10, min: -5000, max: 5000}},
					{name: 'z', listen: true, onChange: lookAtCenter}
				]
			}
		]);
		this.addGui([
			{
				name: 'camera',
				remember: true,
				target: view.camera,
				props: cameraProps
			}
	    ]);
	};

})();