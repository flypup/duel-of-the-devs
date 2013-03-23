(function(window) {

	var ec = window.ec;
	var THREE = window.THREE;
	var v3 = function(x, y, z) {
		return new THREE.Vector3(x, y, z);
	};

	var ThreeJsWorldView = ec.ThreeJsWorldView = function() {
		//var halfwidth = Math.floor(320 * ec.width / ec.height);
		this.datGUIs = [];
		this.lookV3 = v3(0, 0, 0);
	    var camera =
		this.camera = new THREE.PerspectiveCamera( 35, ec.width / ec.height, 1, 10000 );
		//this.camera = new THREE.OrthographicCamera( -halfwidth, halfwidth, 320, -320, -1000, 5000 );
		//this.camera = new THREE.CombinedCamera( halfwidth*2, halfwidth*2, 75, 1, 10000, -1000, 5000 );
	    camera.position.set(1200, 1000, 5000);
	    camera.up = v3( 0, 1, 0 );
	    camera.lookAt(this.lookV3);

	    var scene =
	    this.scene = new THREE.Scene();

	    var light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 1, 1 );
		light.position.normalize();
		scene.add( light );

		// var pointLight = new THREE.DirectionalLight(0xFFFFFF);
		// pointLight.position.x = 10;
		// pointLight.position.y = 50;
		// pointLight.position.z = 130;
		// scene.add(pointLight);
		// scene.fog = new THREE.Fog( 0x000000, 1500, 2100 );

		// var texture = new THREE.ImageUtils.loadTexture('img/tile/floor_8888_32.png');//THREE.Texture();//
		// texture.wrapS =
		// texture.wrapT = THREE.RepeatWrapping;
		// texture.repeat.x = 10;
		// texture.repeat.y = 10;
		var floor = new THREE.Mesh(new THREE.PlaneGeometry(2560, 4096, 40, 64), new THREE.MeshBasicMaterial({
			color: 0x666666,
			// map: texture,
			wireframe: true
			//wireframeLinewidth: 1
			//shading: THREE.NoShading
		}));
		floor.renderDepth = -1000;
		floor.position.set(1280,0,2048);
		floor.rotation.x = Math.PI/2;
		scene.add(floor);

		// var texture2 = THREE.ImageUtils.loadTexture('img/sprite/minipr.png');
		//var texture2 = THREE.ImageUtils.loadTexture('img/background/template_1080p.png');
		//var useScreenCoordinates = true;

		// for (var i = 0; i < 20; i++) {
		// 	var particle = new THREE.Particle(new THREE.ParticleBasicMaterial({
		// 		color: 0xffffff,
		// 		// map: texture2,
		// 		size: 100,
		// 		sizeAttenuation: true,
		// 		vertexColors: false,
		// 		fog : false
		// 	}));
		// 	//var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programStroke } ) );
		// 	particle.position.x = Math.random() * 800 - 400;
		// 	particle.position.y = Math.random() * 800 - 400;
		// 	particle.position.z = Math.random() * 800 - 400;
		// 	particle.scale.x = particle.scale.y = Math.random() * 10 + 10;
		// 	scene.add( particle );
		// }

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

	    var materials = {};
	    var shapes = this.shapes = [];
		this.updateShapeView = (function(scene) {
			var getMaterial = function(name, color, wireframeOnly) {
				if (!materials[name]) {
					var multi = [new THREE.MeshBasicMaterial( { color: color, wireframe: true, transparent: true } )];
					if (!wireframeOnly) {
						multi.unshift(new THREE.MeshLambertMaterial( { color: color } ));
					}
					materials[name] = multi;
					//materials[name] = new THREE.MeshBasicMaterial( {color: color, wireframe: true} );
				}
				return materials[name];
			};
			var getEntityMaterial = function(entity) {
				if (entity) {
					if (entity instanceof ec.Player) {
						return getMaterial('player', 0xff8800);
					} else if (entity instanceof ec.Ninja) {
						if (entity.isShadowClone) {
							return getMaterial('shadowClone', 0x662266);
						} else {
							return getMaterial('ninja', 0x880088);
						}
						
					} else if (entity instanceof ec.Circle) {
						return getMaterial('circle', 0x222222);
					} else if (entity instanceof ec.Box) {
						return getMaterial('box', 0x444444);
					} else if (entity instanceof ec.EmptyHand) {
						return getMaterial('palm', 0xffff00);
					} else if (entity instanceof ec.Projectile) {
						return getMaterial('star', 0x882222);
					} else if (entity instanceof ec.Puff) {
						return getMaterial('puff', 0xcccccc);
					} else if (entity instanceof ec.MapElement) {
						if (entity.mapType === 'floor') {
							return getMaterial('floor', 0x446644);
						} else if (entity.mapType === 'wall') {
							return getMaterial('wall', 0x228800);
						} else if (entity.mapType === 'steps') {
							return getMaterial('steps', 0x009900);
						} else if (entity.mapType === 'bounds') {
							return getMaterial('map', 0x00ff00, true);
						} else {
							return getMaterial('map', 0x00ff00);
						}
					} else {
						return getMaterial('entity', 0xffff00);
					}

				}
				return getMaterial('other', 0xff0000);
			};

			var getShapeObject3d = function(shape, depth, material) {
				var geometry;
				var xRotation = 0;

				if (shape instanceof cp.PolyShape) {
					var vects = [], vert;
					for (var i=0, len=shape.getNumVerts(); i<len; i++) {
						vert = shape.getVert(i);
						vects.push( new THREE.Vector2 ( vert.x, -vert.y ) );
					}
					vert = shape.getVert(0);
					vects.push( new THREE.Vector2 ( vert.x, -vert.y ) );

					var tshape = new THREE.Shape( vects );
					geometry = tshape.extrude({ amount: depth, bevelEnabled: false, steps: 1 });
					xRotation = Math.PI/2;

				} else if (shape instanceof cp.CircleShape) {
					geometry = new THREE.CylinderGeometry( shape.r, shape.r, depth, 6, 1, null);
					
				} else {
					console.log('shape cp type?', shape);
					shape.mesh = -1;
					return;
				}

				var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, material );//new THREE.Mesh( geometry, material );
				mesh.rotation.x = xRotation;
				return mesh;
			};

			return function(shape) {
				var body = shape.body;
				var entity = body.userData && body.userData.parent;
				var depth = entity ? entity.depth : 1;
				var mesh = shape.mesh;
				if (!mesh) {
					var material = getEntityMaterial(entity);
					shape.mesh = mesh = getShapeObject3d(shape, depth, material);
					//console.log('new mesh', entity);
				} 
				if (!mesh.parent) {
					shapes.push(shape);
					scene.add( mesh );
				}

				if (mesh && mesh !== -1) {
					var zOffset = ((mesh.geometry || mesh.children[0].geometry) instanceof THREE.ExtrudeGeometry) ? depth : depth/2;
					if (entity && entity.isEntity) {
						// TODO: is it in the world?
						var pos = entity.getPos();
						mesh.position.set(pos.x, pos.z + zOffset, pos.y);
						mesh.rotation.y = body.a;
					} else if (entity instanceof ec.MapElement) {
						//var bounds = entity.getSortBounds();
						mesh.position.set(entity.x, entity.z + zOffset, -body.p.y);
						
					} else if (body && !body.isSleeping()) {
						mesh.position.set(body.p.x, body.z + zOffset, -body.p.y);
						mesh.rotation.y = body.a;
						// TODO: mesh.renderDepth - custom (faster) depth sorting
					} else {
						//sleeping?
						mesh.position.set(body.p.x, body.z + zOffset, -body.p.y);
						mesh.rotation.y = body.a;
					}
					mesh.updateMatrix();
				}
				// if (shape.view) {
				// 	shape.view.update(shape, scene);
				// }
			};
		})(this.scene);
	};

	ThreeJsWorldView.prototype = {

		lookAt: function(x, y, z) {
			this.lookV3.x = x;
			this.lookV3.y = z;
			this.lookV3.z = y;
			this.camera.lookAt(this.lookV3);
		},

		draw: function(world) {
			if (world.space.activeShapes.count > 0) {// || redraw
				world.space.eachShape(this.updateShapeView);
				//redraw = false;
			}
			// remove shapes no longer in the world
			for (var i=this.shapes.length; i-- > 0;) {
				var shape = this.shapes[i];
				if (shape.mesh && !world.space.containsShape(shape)) {
					//remove mesh and shape
					this.scene.remove(shape.mesh);
					//shape.mesh = null;
					this.shapes.splice(i, 1);
				}
			}
			this.renderer.render( this.scene, this.camera );
		},

		pause: function() {
			this.renderer.autoUpdateScene =
			this.renderer.autoUpdateObjects = false;
		},

		resume: function() {
			this.renderer.autoUpdateScene =
			this.renderer.autoUpdateObjects = true;
		},

		getDom: function() {
			return this.renderer.domElement;
		},

		resize: function(reduce) {
			reduce = reduce || 2.5;
			var width = ec.width / reduce;
			var height = ec.height / reduce;
			var ratioX = ec.pixelRatio;
			var ratioY = ec.pixelRatioY || ratioX;
			var renderer = this.renderer;
			renderer.setSize( width * ratioX, height * ratioY );
		    renderer.domElement.style.width = width + 'px';
	        renderer.domElement.style.height = height + 'px';
	        if (renderer.domElement.getContext( '2d' )) {
				renderer.domElement.getContext( '2d' ).scale(ratioX, ratioY);
	        }
	        //this.camera.updateMatrixWorld();
		},

		show: function(fullsize) {
			this.renderer.domElement.style.display = 'block';
			window.document.body.appendChild( this.renderer.domElement );
			this.resize(fullsize ? 1 : 2.5);
		},

		hide: function() {
			this.renderer.domElement.style.display = 'none';
			if (this.renderer.domElement.parentNode) {
				window.document.body.appendChild( this.renderer.domElement );
			}
			this.removeDebugGuis();
		},

		debugGui: function(debugView) {
			this.removeDebugGuis();
			var view = this;
			var updateMatrix = function() {
				view.camera.updateProjectionMatrix();
				view.renderer.render( view.scene, view.camera );
			};
			var lookAtCenter = function() {//e) {//e.object, e.property
				view.camera.lookAt(view.lookV3);
				updateMatrix();
			};
			var cameraProps = [];
			if (view.camera instanceof THREE.PerspectiveCamera || view.camera instanceof THREE.CombinedCamera) {
				cameraProps.push({name: 'fov',    listen: true, onChange: updateMatrix});
				cameraProps.push({name: 'aspect', listen: true, onChange: updateMatrix});
				// cameraProps.push({name: 'near', onChange: updateMatrix, params:{step: 10, min: 1, max: 1000}});
				// cameraProps.push({name: 'far',  onChange: updateMatrix, params:{step: 100, min: 1000, max: 10000}});
			}
			if (view.camera instanceof THREE.OrthographicCamera || view.camera instanceof THREE.CombinedCamera) {
				cameraProps.push({name: 'left',  onChange: updateMatrix, params:{min: -10000, max: -100}});
				cameraProps.push({name: 'right', onChange: updateMatrix, params:{min: 100, max: 10000}});
				cameraProps.push({name: 'bottom',  onChange: updateMatrix, params:{min: -10000, max: -100}});
				cameraProps.push({name: 'top', onChange: updateMatrix, params:{min: 100, max: 10000}});
				cameraProps.push({name: 'near', onChange: updateMatrix, params:{step: 10, min: -10000, max: 10000}});
				cameraProps.push({name: 'far',  onChange: updateMatrix, params:{step: 100, min: 1000, max: 10000}});
			}

			this.datGUIs.push(debugView.addGui([
				{
					name: 'camera position',
					remember: true,
					target: view.camera.position,
					props: [
						{name: 'x', listen: true, onChange: lookAtCenter, params:{step: 1, min: -2000, max: 4500}},
						{name: 'y', listen: true, onChange: lookAtCenter, params:{step: 1, min: -500,  max: 5000}},
						{name: 'z', listen: true, onChange: lookAtCenter, params:{step: 1, min: -2000, max: 8000}}
					]
				}
				// ,{
				// 	name: 'camera rotation',
				// 	remember: true,
				// 	target: view.camera.rotation,
				// 	props: [
				// 		{name: 'x', listen: true, onChange: lookAtCenter, params:{step: 0.01, min: -6, max: 6}},
				// 		{name: 'y', listen: true, onChange: lookAtCenter, params:{step: 0.01, min: -6, max: 6}},
				// 		{name: 'z', listen: true, onChange: lookAtCenter, params:{step: 0.01, min: -6, max: 6}}
				// 	]
				// }
			]));
			this.datGUIs.push(debugView.addGui([
				{
					name: 'camera',
					remember: true,
					target: view.camera,
					props: cameraProps
				}
		    ]));
		},

		removeDebugGuis: function() {
			while (this.datGUIs.length) {
				var datGui = this.datGUIs.pop();
				datGui.destroy();
			}
		}
	};

})(window);