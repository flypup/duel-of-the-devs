(function(window) {
heart_64 = function() {
	this.initialize();
}
heart_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[1,167,92,82,0,45,36],[297,185,92,82,0,45,36]]});
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
minimonk_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[147,110,76,101,0,36.099999999999994,90.1],[169,222,68,102,0,36.099999999999994,85.1],[415,483,64,94,0,35.099999999999994,80.1],[1,250,72,96,0,35.099999999999994,86.1],[945,486,64,94,0,27.099999999999994,80.1],[682,354,64,102,0,26.099999999999994,85.1],[497,185,70,103,0,32.099999999999994,91.1],[614,436,61,100,0,28.099999999999994,87.1],[785,257,67,103,0,33.099999999999994,91.1],[282,362,65,100,0,31.099999999999994,87.1],[909,95,77,102,0,43.099999999999994,86.1],[459,589,49,104,0,26.099999999999994,86.1],[346,551,53,104,0,29.099999999999994,86.1],[1,446,64,95,0,32.099999999999994,86.1],[545,494,66,91,0,33.099999999999994,82.1],[969,198,51,92,0,26.099999999999994,79.1],[877,485,67,90,0,36.099999999999994,81.1],[348,458,66,92,0,39.099999999999994,79.1],[1,347,67,98,0,31.099999999999994,88.1],[417,382,64,100,0,32.099999999999994,86.1],[214,354,67,98,0,31.099999999999994,88.1],[812,389,64,100,0,29.099999999999994,86.1],[66,513,66,91,0,32.099999999999994,82.1],[158,640,51,92,0,24.099999999999994,79.1],[210,453,68,90,0,31.099999999999994,81.1],[279,463,66,92,0,26.099999999999994,79.1],[597,107,77,102,0,32.099999999999994,86.1],[598,633,48,104,0,20.099999999999994,86.1],[673,553,52,104,0,22.099999999999994,86.1],[676,457,64,95,0,30.099999999999994,86.1],[147,110,76,101,0,36.099999999999994,90.1],[422,166,74,102,0,32.099999999999994,80.1],[74,307,69,98,0,34.099999999999994,77.1],[688,1,74,116,0,33.099999999999994,72.1],[643,224,68,102,0,36.099999999999994,85.1],[926,581,50,103,0,43.099999999999994,85.1],[342,80,79,104,0,80.1,86.1],[763,1,91,93,0,108.1,74.1],[802,490,64,94,0,35.099999999999994,80.1],[877,389,67,95,0,38.099999999999994,82.1],[786,585,52,99,0,41.099999999999994,88.1],[62,605,47,107,0,54.099999999999994,98.1],[712,257,72,96,0,35.099999999999994,86.1],[945,389,66,96,0,32.099999999999994,95.1],[144,325,69,98,0,33.099999999999994,102.1],[620,327,61,108,0,34.099999999999994,114.1],[480,494,64,94,0,27.099999999999994,80.1],[348,362,68,95,0,28.099999999999994,82.1],[545,586,52,99,0,9.099999999999994,88.1],[110,614,47,107,0,-8.900000000000006,98.1],[747,361,64,102,0,26.099999999999994,85.1],[1,638,47,103,0,3.0999999999999943,85.1],[519,80,77,104,0,-4.900000000000006,86.1],[855,1,91,93,0,-18.900000000000006,74.1],[1,1,118,109,0,44.099999999999994,125.1],[470,1,127,78,0,47.099999999999994,92.1],[1,111,145,55,0,47.099999999999994,63.099999999999994],[66,469,141,43,0,42.099999999999994,31.099999999999994]]});
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
minimonk_head_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[291,645,52,56,0,25.2,45.2],[977,638,45,54,0,21.2,44.2],[509,686,44,49,0,22.2,44.2],[726,655,49,51,0,23.2,44.2],[776,685,44,53,0,22.2,44.2],[839,666,45,54,0,21.2,44.2]]});
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
ninja_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[894,198,74,97,0,37.3,87.6],[741,464,60,101,0,31.299999999999997,83.6],[482,398,65,95,0,36.3,81.6],[395,269,74,92,0,37.3,86.6],[548,398,65,95,0,27.299999999999997,81.6],[133,513,60,100,0,27.299999999999997,82.6],[675,118,72,105,0,36.3,88.6],[748,151,72,105,0,36.3,87.6],[224,115,72,106,0,36.3,88.6],[821,151,72,105,0,36.3,87.6],[470,289,74,92,0,37.3,84.6],[568,210,74,94,0,37.3,83.6],[947,1,74,93,0,37.3,85.6],[853,296,74,92,0,37.3,81.6],[867,576,58,89,0,27.299999999999997,83.6],[255,556,59,88,0,28.299999999999997,81.6],[867,576,58,89,0,27.299999999999997,83.6],[255,556,59,88,0,28.299999999999997,81.6],[612,537,60,95,0,33.3,86.6],[1,542,60,95,0,33.3,85.6],[612,537,60,95,0,33.3,86.6],[194,544,60,95,0,33.3,85.6],[400,578,58,89,0,34.3,83.6],[726,566,59,88,0,34.3,81.6],[400,578,58,89,0,34.3,83.6],[726,566,59,88,0,34.3,81.6],[928,296,74,92,0,35.3,84.6],[94,212,74,94,0,35.3,83.6],[320,268,74,93,0,35.3,85.6],[545,305,74,92,0,35.3,81.6],[120,1,119,108,0,44.3,125.6],[342,1,127,78,0,47.3,93.6],[763,95,145,55,0,46.3,62.599999999999994],[69,424,140,44,0,41.3,32.599999999999994],[422,80,96,85,0,42.3,93.6],[240,1,101,113,0,51.3,99.6],[598,1,89,105,0,42.3,91.6],[238,268,81,85,0,41.3,83.6],[647,658,78,32,0,41.3,57.599999999999994]]});
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
ninja_head_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[977,581,45,56,0,22.7,45.1],[297,115,44,55,0,21.7,45.1],[885,685,44,53,0,21.7,44.1],[344,656,49,51,0,23.7,44.1],[930,685,44,53,0,21.7,44.1],[394,668,44,55,0,21.7,45.1]]});
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
shadow_24._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[94,167,50,32,0,23,13.65]]});
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
shadow_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[210,645,80,54,0,40,26]]});
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
throwingstar_64._SpriteSheet = new SpriteSheet({images: ["sprites2_64.png"], frames: [[987,95,34,26,0,17,13],[987,122,34,26,0,17,13],[812,361,32,26,0,16,13],[390,185,30,22,0,15,11],[987,176,26,20,0,13,10],[390,208,30,22,0,15,11],[509,589,32,26,0,16,13],[987,149,34,26,0,17,13],[238,222,34,26,0,17,13],[712,224,34,26,0,17,13],[509,616,32,26,0,16,13],[390,231,30,22,0,15,11],[568,185,26,20,0,13,10],[315,556,30,22,0,15,11],[509,643,32,26,0,16,13],[853,257,34,26,0,17,13]]});
var throwingstar_64_p = throwingstar_64.prototype = new BitmapAnimation();
throwingstar_64_p.BitmapAnimation_initialize = throwingstar_64_p.initialize;
throwingstar_64_p.initialize = function() {
	this.BitmapAnimation_initialize(throwingstar_64._SpriteSheet);
	this.paused = false;
}
window.throwingstar_64 = throwingstar_64;
}(window));

