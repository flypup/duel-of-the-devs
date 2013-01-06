(function(window) {
	'use strict';

	var ec = window.ec;
	var createjs = window.createjs;
	
	ec.SpriteSheets = {
		init: function() {

			ec.SpriteSheets.monk = new createjs.SpriteSheet({
				images: ['img/sprite/minimonk_64.png?v=' + ec.version],
				frames: [[0,0,74,137,0,37,126],[74,0,64,142,0,36,125],[138,0,64,137,0,35,123],[202,0,72,136,0,35,126],[274,0,64,137,0,27,123],[338,0,64,142,0,26,125],[402,0,74,141,0,40,129],[0,142,61,139,0,32,126],[61,142,67,141,0,33,129],[128,142,65,140,0,33,127],[193,142,77,142,0,43,126],[270,142,48,143,0,26,125],[318,142,53,143,0,29,125],[371,142,64,135,0,32,126],[435,142,66,134,0,33,125],[0,285,51,136,0,26,123],[51,285,68,134,0,36,125],[119,285,66,136,0,39,123],[185,285,67,138,0,34,128],[252,285,64,140,0,30,126],[316,285,67,138,0,34,128],[383,285,64,140,0,33,126],[0,425,66,134,0,32,125],[66,425,51,136,0,24,123],[117,425,68,134,0,31,125],[185,425,66,136,0,26,123],[251,425,77,142,0,32,126],[328,425,48,143,0,20,125],[376,425,53,143,0,22,125],[429,425,64,135,0,30,126],[0,0,74,137,0,37,126],[0,568,74,138,0,41,116],[74,568,69,134,0,34,113],[143,568,73,144,0,40,100],[74,0,64,142,0,36,125],[216,568,48,142,0,43,124],[264,568,77,144,0,80,126],[341,568,91,135,0,108,116],[432,568,64,137,0,35,123],[0,712,68,139,0,38,126],[68,712,52,142,0,41,131],[120,712,47,140,0,54,131],[167,712,72,136,0,35,126],[239,712,64,137,0,30,136],[303,712,67,138,0,34,142],[370,712,61,138,0,34,144],[431,712,64,137,0,27,123],[0,854,68,139,0,28,126],[68,854,52,142,0,9,131],[120,854,47,140,0,-8,131],[338,0,64,142,0,26,125],[167,854,47,142,0,3,124],[214,854,77,144,0,-4,126],[291,854,91,135,0,-18,116]],
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
				images: ['img/sprite/ninja_64.png?v=' + ec.version],
				frames: [[0,0,74,137,0,37,126],[74,0,59,141,0,32,124],[133,0,69,138,0,35,124],[202,0,73,138,0,36,127],[275,0,69,138,0,32,124],[344,0,59,141,0,25,124],[403,0,96,85,0,42,93],[0,141,101,113,0,51,99],[101,141,89,105,0,42,91],[190,141,81,85,0,41,83],[271,141,78,32,0,41,57],[349,141,119,108,0,44,125],[0,254,127,78,0,47,93],[127,254,145,55,0,53,62],[272,254,140,43,0,58,31]],
				animations: {
					standing: 0,
					puff: 6,
					fall: 11
				}
			});

			ec.SpriteSheets.lion = new createjs.SpriteSheet({
				images: ['img/sprite/lion_64.png?v=' + ec.version],
				frames: [[0,0,80,212,0,40,180]]
			});

			ec.SpriteSheets.shadow = new createjs.SpriteSheet({
				images: ['img/sprite/shadow_64.png?v=' + ec.version],
				frames: [[0,0,80,54,0,40,26]]
			});

			ec.SpriteSheets.cauldron = new createjs.SpriteSheet({
				images: ['img/sprite/cauldron_64.png?v=' + ec.version],
				frames: [[0,0,256,255,0,128,148]]
			});
		}
	};

})(window);