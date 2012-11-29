(function(window) {
	'use strict';

	var ec = window.ec;

	ec.SpriteSheets = {
		init: function() {

			ec.SpriteSheets.monk = new window.createjs.SpriteSheet({
				images: ['img/sprite/minimonk_64.png'],
				frames: [[0,152,96,143,0,47,131],[96,0,62,141,0,33,124],[96,0,62,141,0,33,124],[0,295,69,139,0,35,124],[0,0,96,152,0,47,140],[69,295,69,139,0,32,124],[96,141,62,141,0,27,124],[96,141,62,141,0,27,124]],
				animations: {'standing': 0}
				//animations: {'standing': [first, last, next, frequency]}
				//animations: {'standing': {next: '', frequency: 1, frames: NumberOrArray}
			});

			ec.SpriteSheets.ninja = new window.createjs.SpriteSheet({
				images: ['img/sprite/ninja_64.png'],
				frames: [[0,138,74,137,0,37,126],[74,138,62,141,0,33,124],[74,138,62,141,0,33,124],[77,0,69,138,0,35,124],[0,0,77,138,0,38,127],[146,0,69,138,0,32,124],[136,138,62,141,0,27,124],[136,138,62,141,0,27,124]],
				animations: {'standing': 0}
				//animations: {'standing': [first, last, next, frequency]}
				//animations: {'standing': {next: '', frequency: 1, frames: NumberOrArray}
			});
		}
	};

})(window);