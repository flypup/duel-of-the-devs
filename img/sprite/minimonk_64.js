(function(window) {
minimonk_64 = function() {
	this.initialize();
}
minimonk_64._SpriteSheet = new SpriteSheet({images: ["minimonk_64.png"], frames: [[0,152,96,143,0,47.5,131.4],[165,0,64,141,0,36.5,124.4],[165,0,64,141,0,36.5,124.4],[96,0,69,139,0,35.5,124.4],[0,0,96,152,0,47.5,140.4],[96,139,69,139,0,32.5,124.4],[165,141,64,141,0,26.5,124.4],[165,141,64,141,0,26.5,124.4]]});
var minimonk_64_p = minimonk_64.prototype = new BitmapAnimation();
minimonk_64_p.BitmapAnimation_initialize = minimonk_64_p.initialize;
minimonk_64_p.initialize = function() {
	this.BitmapAnimation_initialize(minimonk_64._SpriteSheet);
	this.paused = false;
}
window.minimonk_64 = minimonk_64;
}(window));

