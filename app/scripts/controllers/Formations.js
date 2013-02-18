(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var HG = window.Hungarian;
	var v = cp.v;

	var Formations = ec.Formations = function() {
		this.positions = [];
		//this.radialMove = 0;
	};

	var proto = Formations.prototype;

	// FORMATIONS

	proto.lineupPositions = function(headPos, targetPos, length, spacing, minDistance) {
		spacing = spacing || 96;
		minDistance = minDistance || 128;

		var vector = v.sub(headPos, targetPos);
		var distance = v.len(vector);
		if (distance === 0) {
			vector.x = 0;
			vector.y = minDistance;
		} else if  (distance < minDistance) {
			vector = v.normalize(vector).mult(minDistance);
		}

		var pos = v.mult(vector, 0.5);
		var perp = v.normalize(v.perp(vector)).mult(spacing);
		pos.sub(v.mult(perp, (length-1)/2));

		var angle = Math.atan2(-vector.y, vector.x) + Math.PI;

		var positions = this.getFormationVectors(length);
		for (var i=0; i<length; i++) {
			positions[i].x = pos.x;
			positions[i].y = pos.y;
			positions[i].angle = angle;

			pos.add(perp);
		}
		return positions;
	};

	proto.circlePositions = function(headPos, targetPos, length, radius) {
		//radius = Math.max(v.len(v.sub(headPos, targetPos)), radius);
		var pi = Math.PI;
		var pi2 = 2 * pi;
		//var circumference = pi2 * radius;
		//this.radialMove += 20 / circumference;

		var positions = this.getFormationVectors(length);
		for (var i=0; i<length; i++) {
			var radian = pi2 * i / length;
			//radian += this.radialMove;
			var pos = v.forangle(radian).mult(radius);
			positions[i].x = pos.x;
			positions[i].y = pos.y;
			positions[i].angle = Math.atan2(-pos.y, pos.x) + pi;
		}
		return positions;
	};

	// UNIT FORMATION PATH FINDING

	proto.updateUnitsHungarian = function(entities, positions, length) {
		length = length || positions.length;
		positions = positions.slice(0, length);
		// TODO: all this class needs is the positions of the entities
		entities  = entities.slice(0, length);
		// TODO: add 'length' param to HG so we don't have to clone arrays to slice down
		return HG.hungarianAlgortithm(positions, entities);
	};

	// FORMATION UTILS

	proto.getFormationVectors = function(length) {
		for (var i=0; i<length; i++) {
			this.positions[i] = this.positions[i] || v(0, 0);
		}
		return this.positions;
	};

	proto.newFormationVectors = function() {
		this.positions = [];
	};


})(window);
