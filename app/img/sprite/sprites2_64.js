(function(window) {
heart_64 = function() {
	this.initialize();
}
heart_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[1,1,92,82,0,45,36],[94,1,92,82,0,45,36]]});
var heart_64_p = heart_64.prototype = new BitmapAnimation();
heart_64_p.BitmapAnimation_initialize = heart_64_p.initialize;
heart_64_p.initialize = function() {
	this.BitmapAnimation_initialize(heart_64._SpriteSheet);
	this.paused = false;
}
window.heart_64 = heart_64;
minimonk_64 = function() {
	this.initialize();
}
minimonk_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[187,1,76,101,0,36.099999999999994,91],[264,1,68,102,0,36.099999999999994,86],[333,1,64,94,0,35.099999999999994,81],[398,1,72,96,0,35.099999999999994,87],[471,1,64,94,0,27.099999999999994,81],[536,1,64,102,0,26.099999999999994,86],[601,1,70,103,0,32.099999999999994,92],[672,1,61,100,0,28.099999999999994,88],[734,1,67,103,0,33.099999999999994,92],[802,1,65,100,0,31.099999999999994,88],[868,1,77,102,0,43.099999999999994,87],[946,1,49,104,0,26.099999999999994,87],[1,106,53,104,0,29.099999999999994,87],[55,106,64,95,0,32.099999999999994,87],[120,106,66,91,0,33.099999999999994,83],[187,106,51,92,0,26.099999999999994,80],[239,106,67,90,0,36.099999999999994,82],[307,106,66,92,0,39.099999999999994,80],[374,106,67,98,0,31.099999999999994,89],[442,106,64,100,0,32.099999999999994,87],[507,106,67,98,0,31.099999999999994,89],[575,106,64,100,0,29.099999999999994,87],[640,106,66,91,0,32.099999999999994,83],[707,106,51,92,0,24.099999999999994,80],[759,106,68,90,0,31.099999999999994,82],[828,106,66,92,0,26.099999999999994,80],[895,106,77,102,0,32.099999999999994,87],[973,106,48,104,0,20.099999999999994,87],[1,211,52,104,0,22.099999999999994,87],[54,211,64,95,0,30.099999999999994,87],[187,1,76,101,0,36.099999999999994,91],[119,211,74,102,0,32.099999999999994,81],[194,211,69,98,0,34.099999999999994,78],[264,211,74,116,0,33.099999999999994,73],[339,211,68,102,0,36.099999999999994,86],[408,211,50,103,0,43.099999999999994,86],[459,211,79,104,0,80.1,87],[539,211,91,93,0,108.1,75],[631,211,64,94,0,35.099999999999994,81],[696,211,67,95,0,38.099999999999994,83],[764,211,52,99,0,41.099999999999994,89],[817,211,47,107,0,54.099999999999994,99],[865,211,72,96,0,35.099999999999994,87],[938,211,66,96,0,32.099999999999994,96],[1,328,69,98,0,33.099999999999994,103],[71,328,61,108,0,34.099999999999994,115],[133,328,64,94,0,27.099999999999994,81],[198,328,68,95,0,28.099999999999994,83],[267,328,52,99,0,9.099999999999994,89],[320,328,47,107,0,-8.900000000000006,99],[368,328,64,102,0,26.099999999999994,86],[433,328,47,103,0,3.0999999999999943,86],[481,328,77,104,0,-4.900000000000006,87],[559,328,91,93,0,-18.900000000000006,75]]});
var minimonk_64_p = minimonk_64.prototype = new BitmapAnimation();
minimonk_64_p.BitmapAnimation_initialize = minimonk_64_p.initialize;
minimonk_64_p.initialize = function() {
	this.BitmapAnimation_initialize(minimonk_64._SpriteSheet);
	this.paused = false;
}
window.minimonk_64 = minimonk_64;
minimonk_head_64 = function() {
	this.initialize();
}
minimonk_head_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[651,328,52,56,0,25.2,45.2],[704,328,45,54,0,21.2,44.2],[750,328,44,49,0,22.2,44.2],[795,328,49,51,0,23.2,44.2],[845,328,44,53,0,22.2,44.2],[890,328,45,54,0,21.2,44.2]]});
var minimonk_head_64_p = minimonk_head_64.prototype = new BitmapAnimation();
minimonk_head_64_p.BitmapAnimation_initialize = minimonk_head_64_p.initialize;
minimonk_head_64_p.initialize = function() {
	this.BitmapAnimation_initialize(minimonk_head_64._SpriteSheet);
	this.paused = false;
}
window.minimonk_head_64 = minimonk_head_64;
ninja_64 = function() {
	this.initialize();
}
ninja_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[936,328,74,97,0,37.3,87.6],[1,437,60,101,0,31.299999999999997,83.6],[62,437,65,95,0,36.3,81.6],[128,437,74,92,0,37.3,86.6],[203,437,65,95,0,27.299999999999997,81.6],[269,437,60,100,0,27.299999999999997,82.6],[330,437,72,105,0,36.3,88.6],[403,437,72,105,0,36.3,87.6],[476,437,72,106,0,36.3,88.6],[549,437,72,105,0,36.3,87.6],[622,437,74,92,0,37.3,84.6],[697,437,74,94,0,37.3,83.6],[772,437,74,93,0,37.3,85.6],[847,437,74,92,0,37.3,81.6],[922,437,58,89,0,27.299999999999997,83.6],[1,544,59,88,0,28.299999999999997,81.6],[922,437,58,89,0,27.299999999999997,83.6],[1,544,59,88,0,28.299999999999997,81.6],[61,544,60,95,0,33.3,86.6],[122,544,60,95,0,33.3,85.6],[61,544,60,95,0,33.3,86.6],[183,544,60,95,0,33.3,85.6],[244,544,58,89,0,34.3,83.6],[303,544,59,88,0,34.3,81.6],[244,544,58,89,0,34.3,83.6],[303,544,59,88,0,34.3,81.6],[363,544,74,92,0,35.3,84.6],[438,544,74,94,0,35.3,83.6],[513,544,74,93,0,35.3,85.6],[588,544,74,92,0,35.3,81.6],[663,544,119,108,0,44.3,125.6],[783,544,127,78,0,47.3,93.6],[1,653,145,55,0,46.3,62.599999999999994],[147,653,140,44,0,41.3,32.599999999999994],[288,653,96,85,0,42.3,93.6],[385,653,101,113,0,51.3,99.6],[487,653,89,105,0,42.3,91.6],[577,653,81,85,0,41.3,83.6],[659,653,78,32,0,41.3,57.599999999999994]]});
var ninja_64_p = ninja_64.prototype = new BitmapAnimation();
ninja_64_p.BitmapAnimation_initialize = ninja_64_p.initialize;
ninja_64_p.initialize = function() {
	this.BitmapAnimation_initialize(ninja_64._SpriteSheet);
	this.paused = false;
}
window.ninja_64 = ninja_64;
ninja_head_64 = function() {
	this.initialize();
}
ninja_head_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[738,653,45,56,0,22.7,45.1],[784,653,44,55,0,21.7,45.1],[829,653,44,53,0,21.7,44.1],[874,653,49,51,0,23.7,44.1],[924,653,44,53,0,21.7,44.1],[969,653,44,55,0,21.7,45.1]]});
var ninja_head_64_p = ninja_head_64.prototype = new BitmapAnimation();
ninja_head_64_p.BitmapAnimation_initialize = ninja_head_64_p.initialize;
ninja_head_64_p.initialize = function() {
	this.BitmapAnimation_initialize(ninja_head_64._SpriteSheet);
	this.paused = false;
}
window.ninja_head_64 = ninja_head_64;
shadow_24 = function() {
	this.initialize();
}
shadow_24._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[1,767,50,32,0,23,13.65]]});
var shadow_24_p = shadow_24.prototype = new BitmapAnimation();
shadow_24_p.BitmapAnimation_initialize = shadow_24_p.initialize;
shadow_24_p.initialize = function() {
	this.BitmapAnimation_initialize(shadow_24._SpriteSheet);
	this.paused = false;
}
window.shadow_24 = shadow_24;
shadow_64 = function() {
	this.initialize();
}
shadow_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[52,767,80,54,0,40,26]]});
var shadow_64_p = shadow_64.prototype = new BitmapAnimation();
shadow_64_p.BitmapAnimation_initialize = shadow_64_p.initialize;
shadow_64_p.initialize = function() {
	this.BitmapAnimation_initialize(shadow_64._SpriteSheet);
	this.paused = false;
}
window.shadow_64 = shadow_64;
throwingstar_64 = function() {
	this.initialize();
}
throwingstar_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[133,767,34,26,0,17,13],[168,767,34,26,0,17,13],[203,767,32,26,0,16,13],[236,767,30,22,0,15,11],[267,767,26,20,0,13,10],[294,767,30,22,0,15,11],[325,767,32,26,0,16,13],[358,767,34,26,0,17,13],[393,767,34,26,0,17,13],[428,767,34,26,0,17,13],[463,767,32,26,0,16,13],[496,767,30,22,0,15,11],[527,767,26,20,0,13,10],[554,767,30,22,0,15,11],[585,767,32,26,0,16,13],[618,767,34,26,0,17,13]]});
var throwingstar_64_p = throwingstar_64.prototype = new BitmapAnimation();
throwingstar_64_p.BitmapAnimation_initialize = throwingstar_64_p.initialize;
throwingstar_64_p.initialize = function() {
	this.BitmapAnimation_initialize(throwingstar_64._SpriteSheet);
	this.paused = false;
}
window.throwingstar_64 = throwingstar_64;
}(window));

