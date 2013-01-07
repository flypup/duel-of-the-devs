(function(window) {
	'use strict';

	var ec = window.ec;
	var createjs = window.createjs;
	
	ec.SpriteSheets = {
		init: function() {

			ec.SpriteSheets.monk = new createjs.SpriteSheet({
				images: ['img/sprite/minimonk_64.png'],
				frames: [[0,0,76,137,0,36,126],[77,0,68,142,0,36,125],[146,0,64,137,0,35,123],[211,0,72,136,0,35,126],[284,0,64,137,0,27,123],[349,0,64,142,0,26,125],[414,0,70,141,0,32,129],[485,0,61,139,0,28,126],[547,0,67,141,0,33,129],[615,0,65,140,0,31,127],[681,0,77,142,0,43,126],[759,0,49,143,0,26,125],[809,0,53,143,0,29,125],[863,0,64,135,0,32,126],[928,0,66,134,0,33,125],[0,144,51,136,0,26,123],[52,144,67,134,0,36,125],[120,144,66,136,0,39,123],[187,144,67,138,0,31,128],[255,144,64,140,0,32,126],[320,144,67,138,0,31,128],[388,144,64,140,0,29,126],[453,144,66,134,0,32,125],[520,144,51,136,0,24,123],[572,144,68,134,0,31,125],[641,144,66,136,0,26,123],[708,144,77,142,0,32,126],[786,144,48,143,0,20,125],[835,144,52,143,0,22,125],[888,144,64,135,0,30,126],[0,0,76,137,0,36,126],[0,288,74,138,0,32,116],[75,288,69,134,0,34,113],[145,288,74,144,0,33,100],[220,288,68,142,0,36,125],[289,288,50,142,0,43,124],[340,288,79,144,0,80,126],[420,288,91,135,0,108,116],[512,288,64,137,0,35,123],[577,288,67,139,0,38,126],[645,288,52,142,0,41,131],[698,288,47,140,0,54,131],[746,288,72,136,0,35,126],[819,288,66,137,0,32,136],[886,288,69,138,0,33,142],[956,288,61,138,0,34,144],[0,433,64,137,0,27,123],[65,433,68,139,0,28,126],[134,433,52,142,0,9,131],[187,433,47,140,0,-9,131],[235,433,64,142,0,26,125],[300,433,48,142,0,4,124],[349,433,77,144,0,-5,126],[427,433,91,135,0,-19,116]],
				animations: {
					standing: 0,
					walk_0: 6,
					walk_1: 10,
					walk_2: 14,
					walk_3: 18,
					walk_4: 22,
					walk_5: 26,
					punch_0: 30,
					punch_1: 34,
					punch_2: 38,
					punch_3: 42,
					punch_4: 46,
					punch_5: 50
				}
				//animations: {'standing': [first, last, next, frequency]}
				//animations: {'standing': {next: '', frequency: 1, frames: NumberOrArray}
			});

			ec.SpriteSheets.ninja = new createjs.SpriteSheet({
				images: ['img/sprite/ninja_64.png'],
				frames: [[0,0,74,137,0,37,126],[74,0,59,141,0,32,124],[133,0,69,138,0,35,124],[202,0,73,138,0,36,127],[275,0,69,138,0,32,124],[344,0,59,141,0,25,124],[403,0,96,85,0,42,93],[0,141,101,113,0,51,99],[101,141,89,105,0,42,91],[190,141,81,85,0,41,83],[271,141,78,32,0,41,57],[349,141,119,108,0,44,125],[0,254,127,78,0,47,93],[127,254,145,55,0,53,62],[272,254,140,43,0,58,31]],
				animations: {
					standing: 0,
					puff: 6,
					fall: 11
				}
			});

			ec.SpriteSheets.lion = new createjs.SpriteSheet({
				images: ['img/sprite/lion_64.png'],
				frames: [[0,0,80,212,0,40,180]]
			});

			ec.SpriteSheets.shadow = new createjs.SpriteSheet({
				images: ['img/sprite/shadow_64.png'],
				frames: [[0,0,80,54,0,40,26]]
			});

			ec.SpriteSheets.cauldron = new createjs.SpriteSheet({
				images: ['img/sprite/cauldron_64.png'],
				frames: [[0,0,256,255,0,128,148]]
			});
		}
	};

})(window);