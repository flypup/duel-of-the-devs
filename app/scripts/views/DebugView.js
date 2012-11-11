var ec = ec || {};
var Stats = Stats;

ec.DebugView = function() {
	'use strict';
	var stats =
	this.stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );
};