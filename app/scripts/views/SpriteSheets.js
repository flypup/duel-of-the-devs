(function(window) {
	'use strict';

	var ec = window.ec;

	ec.SpriteSheets = {
		init: function() {

			ec.SpriteSheets.monk = new window.createjs.SpriteSheet({
				images: ['img/sprite/minimonk_64.png'],
				frames: [[0,152,96,143,0,47.5,131.4],[165,0,64,141,0,36.5,124.4],[165,0,64,141,0,36.5,124.4],[96,0,69,139,0,35.5,124.4],[0,0,96,152,0,47.5,140.4],[96,139,69,139,0,32.5,124.4],[165,141,64,141,0,26.5,124.4],[165,141,64,141,0,26.5,124.4]],
				animations: {'standing': 0}
				//animations: {'standing': [first, last, next, frequency]}
				//animations: {'standing': {next: '', frequency: 1, frames: NumberOrArray}
			});

			ec.SpriteSheets.ninja = new window.createjs.SpriteSheet({
				images: ['img/sprite/ninja_64.png'],
				frames: [[0,138,74,137,0,37,126],[74,138,62,141,0,33,124],[74,138,62,141,0,33,124],[77,0,69,138,0,35,124],[0,0,77,138,0,38,127],[146,0,69,138,0,32,124],[136,138,62,141,0,27,124],[136,138,62,141,0,27,124]],
				animations: {'standing': 0}
			});

			ec.SpriteSheets.lion = new window.createjs.SpriteSheet({
				images: ['img/sprite/lion_64.png'],
				frames: [[0,0,80,212,0,40,180]]
			});
		}
	};

})(window);