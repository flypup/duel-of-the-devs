(function($) {
	'use strict';

	var ec = $.ec;
	var THREE = $.THREE;
	var v3 = function(x, y, z) {
		return new THREE.Vector3(x, y, z);
	};

	var ThreeJsWorldView = ec.ThreeJsWorldView = function() {
		var halfwidth = Math.floor(320 * ec.width / ec.height);
	    var camera =
		//this.camera = new THREE.PerspectiveCamera( 75, ec.width / ec.height, 1, 10000 );
		this.camera = new THREE.OrthographicCamera( -halfwidth, halfwidth, 320, -320, -1000, 5000 );
		//this.camera = new THREE.CombinedCamera( halfwidth*2, halfwidth*2, 75, 1, 10000, -1000, 5000 );
		camera.matrixAutoUpdate = false;
	    camera.position.x = -320;//-1000;
	    camera.position.y = -320;//-1000;
	    camera.position.z = 262;
	    camera.up = v3( 0, 0, 1 );
	    camera.lookAt(v3(0, 0, 0));

	    var scene =
	    this.scene = new THREE.Scene();

		// var pointLight = new THREE.DirectionalLight(0xFFFFFF);
		// pointLight.position.x = 10;
		// pointLight.position.y = 50;
		// pointLight.position.z = 130;
		// scene.add(pointLight);
		// scene.fog = new THREE.Fog( 0x000000, 1500, 2100 );

		var texture = new THREE.ImageUtils.loadTexture('img/tile/floor_8888_32.png');//THREE.Texture();//
		texture.wrapS =
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.x = 10;
		texture.repeat.y = 10;
		var floor = new THREE.Mesh(new THREE.PlaneGeometry(1280, 1280, 4, 4), new THREE.MeshBasicMaterial({
			//color: 0x666666,
			map: texture,
			wireframe: false,
			wireframeLinewidth: 16,
			shading: THREE.NoShading
		}));
		floor.matrixAutoUpdate = false;
		floor.frustumCulled = false;
		floor.renderDepth = -1000;
		scene.add(floor);

		var texture2 = THREE.ImageUtils.loadTexture('img/sprite/minipr.png');
		//var texture2 = THREE.ImageUtils.loadTexture('img/background/template_1080p.png');
		//var useScreenCoordinates = true;

		for (var i = 0; i < 20; i++) {
			var particle = new THREE.Particle(new THREE.ParticleBasicMaterial({
				color: 0xffffff,
				map: texture2,
				size: 100,
				sizeAttenuation: true,
				vertexColors: false,
				fog : false
			}));
			//var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programStroke } ) );
			particle.position.x = Math.random() * 800 - 400;
			particle.position.y = Math.random() * 800 - 400;
			particle.position.z = Math.random() * 800 - 400;
			particle.scale.x = particle.scale.y = Math.random() * 10 + 10;
			scene.add( particle );
		}
		
	    var renderer;
	    try {
			renderer = this.renderer = ec.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
			ec.webgl = renderer instanceof THREE.WebGLRenderer;
	    } catch(e) {
			renderer = this.renderer = new THREE.CanvasRenderer();
			ec.webgl = false;
			ec.resizeDisplay();
	    }

	    renderer.antialias = true;
	    renderer.sortObjects = false;
	    renderer.sortElements = false;
	    renderer.autoClear = false;
	    renderer.setClearColorHex( 0xefefff, 1 );

	    renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.left =
		renderer.domElement.style.top = '0px';
		this.resize();
	    document.body.appendChild( renderer.domElement );

	    this.updateShapeView = this.updateShape();
	};

	ThreeJsWorldView.prototype.updateShape = function() {
		var scene = this.scene;
		return function(shape) {
			if (shape.view) {
				shape.view.update(shape, scene);
			}
		};
	};

	ThreeJsWorldView.prototype.lookAt = function(x, y, z) {
		this.camera.lookAt(v3(x, y, z));
	};

	ThreeJsWorldView.prototype.draw = function(world) {
		if (world.space.activeShapes.count > 0) {// || redraw
			world.space.eachShape(this.updateShapeView);
			//redraw = false;
		}
		this.renderer.render( this.scene, this.camera );
	};

	ThreeJsWorldView.prototype.pause = function() {
		this.renderer.autoUpdateScene =
		this.renderer.autoUpdateObjects = false;
	};

	ThreeJsWorldView.prototype.resume = function() {
		this.renderer.autoUpdateScene =
		this.renderer.autoUpdateObjects = true;
	};

	ThreeJsWorldView.prototype.getDom = function() {
		return this.renderer.domElement;
	};

	ThreeJsWorldView.prototype.resize = function() {
		var ratioX = ec.pixelRatio;
		var ratioY = ec.pixelRatioY || ratioX;
		var renderer = this.renderer;
		renderer.setSize( ec.width * ratioX, ec.height * ratioY );
	    renderer.domElement.style.width = ec.width + 'px';
        renderer.domElement.style.height = ec.height + 'px';
        if (renderer.domElement.getContext( '2d' )) {
			renderer.domElement.getContext( '2d' ).scale(ratioX, ratioY);
        }
        //this.camera.updateMatrixWorld();
	};

	ThreeJsWorldView.prototype.debugGui = function(debugView) {
		var view = this;
		var lookAtCenter = function() {//e) {//e.object, e.property
			view.lookAt(0, 0, 0);
			//view.camera.position.y = view.camera.position.x;
		};
		var updateMatrix = function() {
			view.camera.updateProjectionMatrix();
		};
		var cameraProps = [];
		if (view.camera instanceof THREE.PerspectiveCamera || view.camera instanceof THREE.CombinedCamera) {
			cameraProps.push({name: 'fov',    listen: true, onChange: updateMatrix});
			cameraProps.push({name: 'aspect', listen: true, onChange: updateMatrix});
			cameraProps.push({name: 'near', onChange: updateMatrix, params:{step: 10, min: 1, max: 1000}});
			cameraProps.push({name: 'far',  onChange: updateMatrix, params:{step: 100, min: 1000, max: 10000}});
		}
		if (view.camera instanceof THREE.OrthographicCamera || view.camera instanceof THREE.CombinedCamera) {
			cameraProps.push({name: 'left',  onChange: updateMatrix, params:{min: -10000, max: -100}});
			cameraProps.push({name: 'right', onChange: updateMatrix, params:{min: 100, max: 10000}});
			cameraProps.push({name: 'bottom',  onChange: updateMatrix, params:{min: -10000, max: -100}});
			cameraProps.push({name: 'top', onChange: updateMatrix, params:{min: 100, max: 10000}});
			cameraProps.push({name: 'near', onChange: updateMatrix, params:{step: 10, min: -10000, max: 10000}});
			cameraProps.push({name: 'far',  onChange: updateMatrix, params:{step: 100, min: 1000, max: 10000}});
		}

		debugView.addGui([
			{
				name: 'camera position',
				remember: true,
				target: view.camera.position,
				props: [
					{name: 'x', listen: true, onChange: lookAtCenter, params:{step: 1, min: -320, max: -160}},
					{name: 'y', listen: true, onChange: lookAtCenter, params:{step: 1, min: -320, max: -160}},
					{name: 'z', listen: true, onChange: lookAtCenter, params:{step: 1, min: 240, max: 320}}
				]
			},
			{
				name: 'camera rotation',
				remember: true,
				target: view.camera.rotation,
				props: [
					{name: 'x', listen: true, onChange: lookAtCenter, params:{step: 0.01, min: -6, max: 6}},
					{name: 'y', listen: true, onChange: lookAtCenter, params:{step: 0.01, min: -6, max: 6}},
					{name: 'z', listen: true, onChange: lookAtCenter, params:{step: 0.01, min: -6, max: 6}}
				]
			}
		]);
		debugView.addGui([
			{
				name: 'camera',
				remember: true,
				target: view.camera,
				props: cameraProps
			}
	    ]);
	};

})(window);