var ec = ec || {};
var cp = cp;
(function() {
	'use strict';
	var v = cp.v;

	var GRABABLE_MASK_BIT = 1<<31;
	var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

	var ChipmunkDebugView = ec.ChipmunkDebugView = function(space) {
		this.space = space;

		var canvas = this.canvas = document.createElement( 'canvas' );
		canvas.style.position = 'absolute';
		this.ctx = canvas.getContext('2d');
		this.resize();
		this.orthoPos = v.mult(this.orthoSize, 0.5);
		document.body.appendChild( canvas );

		this.mouse = v(0,0);

		var self = this;
		var canvas2point = this.canvas2point = function(x, y) {
			return v(x / self.scale - self.orthoPos.x, self.orthoPos.y - y / self.scale);
		};

		this.point2canvas = function(point) {
			return v((point.x + self.orthoPos.x) * self.scale, (self.orthoPos.y - point.y) * self.scale);
		};

		// HACK HACK HACK - its awful having this here, and its going to break when we
		// have multiple demos open at the same time.
		this.canvas.onmousemove = function(e) {
			self.mouse = canvas2point(e.offsetX, e.offsetY);
			if (self.mouseDown && !self.mouseJoint) {
				var mv = v(e.offsetX - self.mouseDown.x, e.offsetY - self.mouseDown.y).mult(1/self.scale);
				self.mouseDown.x = e.offsetX;
				self.mouseDown.y = e.offsetY;
				self.orthoPos.add(mv);
			}
		};

		/*
		this.canvas.onmousedown = function(e) {
			radius = 10;
			mass = 3;
			body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0, 0))));
			body.setPos(canvas2point(e.offsetX, e.offsetY));
			circle = space.addShape(new cp.CircleShape(body, radius, v(0, 0)));
			circle.setElasticity(0.5);
			return circle.setFriction(1);
		};*/

		var mouseBody = this.mouseBody = new cp.Body(Infinity, Infinity);

		this.canvas.onmousedown = function(e) {
			var rightclick = e.which === 3; // or e.button === 2;

			if(!rightclick && !self.mouseJoint) {
				var point = canvas2point(e.offsetX, e.offsetY);
				self.mouseDown = v(e.offsetX, e.offsetY);

				var shape = space.pointQueryFirst(point, GRABABLE_MASK_BIT, cp.NO_GROUP);
				if(shape){
					var body = shape.body;
					if (!body.isStatic()) {
						var mouseJoint = self.mouseJoint = new cp.PivotJoint(mouseBody, body, v(0,0), body.world2Local(point));

						mouseJoint.maxForce = 50000;
						mouseJoint.errorBias = Math.pow(1 - 0.15, 60);
						space.addConstraint(mouseJoint);
					}
				}
			}
		};

		this.canvas.onmouseup = function(e) {
			var rightclick = e.which === 3; // or e.button === 2;

			if(!rightclick) {
				if(self.mouseJoint) {
					space.removeConstraint(self.mouseJoint);
					self.mouseJoint = null;
				}
				self.mouseDown = null;
			}
		};

		this.canvas.onmousewheel = function(e) {
			var value = e.detail ? e.detail * -1 : (e.wheelDeltaY ? e.wheelDeltaY : e.wheelDelta) / 40;
			self.scale = Math.min(Math.max(0.005, self.scale + value / (-999*self.scale + 1000)), 1);
			var sizeDiff = v.sub(self.orthoSize, v(self.width, self.height).mult(1/self.scale));
			self.orthoSize.sub(sizeDiff);
			self.orthoPos.sub(sizeDiff.mult(0.5));
		};
	};

	ChipmunkDebugView.prototype.show = function() {
		this.canvas.style.display = 'block';
	};

	ChipmunkDebugView.prototype.hide = function() {
		this.canvas.style.display = 'none';
	};

	ChipmunkDebugView.prototype.resize = function() {
		var ratio = this.ratio = ec.pixelRatio;
		this.width  = Math.max(160 / ratio, Math.round(ec.width / 3));
		this.height = Math.max(90  / ratio, Math.round(ec.height / 3));
		this.scale = this.width  * 0.25 / ec.width;
		this.orthoSize = v(this.width, this.height).mult(1/this.scale);
		var canvas = this.canvas;
		canvas.width = this.width * ratio;
		canvas.height = this.height * ratio;
		canvas.style.width = this.width + 'px';
		canvas.style.height = this.height + 'px';
		canvas.style.left = (ec.width  - this.width  -1)+'px';
		canvas.style.top  = (ec.height - this.height -1)+'px';
		this.ctx.scale(ratio, ratio);
	};

	ChipmunkDebugView.prototype.drawInfo = function() {
		var space = this.space;

		var maxWidth = this.width - 20;

		this.ctx.textAlign = 'start';
		this.ctx.textBaseline = 'alphabetic';
		this.ctx.fillStyle = 'black';

		this.ctx.fillText(document.body.clientWidth+', '+document.body.clientHeight+' x '+this.ratio, 5, 15, maxWidth);

		this.ctx.fillText('Step: ' + space.stamp, 5, 30, maxWidth);

		var arbiters = space.arbiters.length;
		this.maxArbiters = this.maxArbiters ? Math.max(this.maxArbiters, arbiters) : arbiters;
		this.ctx.fillText('Arbiters: ' + arbiters + ' (Max: ' + this.maxArbiters + ')', 5, 45, maxWidth);

		var contacts = 0;
		for(var i = 0; i < arbiters; i++) {
			contacts += space.arbiters[i].contacts.length;
		}
		this.maxContacts = this.maxContacts ? Math.max(this.maxContacts, contacts) : contacts;
		this.ctx.fillText('Contact points: ' + contacts + ' (Max: ' + this.maxContacts + ')', 5, 60, maxWidth);

		this.ctx.fillText('Mouse: ' + this.mouse.x.toFixed(0) +', '+ this.mouse.y.toFixed(0), 5, 75, maxWidth);

		if (this.message) {
			this.ctx.fillText(this.message, 5, this.height - 50, maxWidth);
		}
	};

	ChipmunkDebugView.prototype.draw = function() {
		var ctx = this.ctx;

		var self = this;

		ctx.fillStyle = '#ACF';
		ctx.fillRect(0, 0, this.width, this.height);

		// Draw shapes
		ctx.strokeStyle = 'black';
		//ctx.clearRect(0, 0, this.width, this.height);
		
		this.ctx.font = '12px sans-serif';
		this.ctx.lineCap = 'round';

		this.space.eachShape(function(shape) {
			ctx.fillStyle = shape.style();
			shape.draw(ctx, self.scale, self.point2canvas);
		});

		// Draw collisions
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 2;

		var arbiters = this.space.arbiters;
		for (var i = 0; i < arbiters.length; i++) {
			var contacts = arbiters[i].contacts;
			for (var j = 0; j < contacts.length; j++) {
				var p = this.point2canvas(contacts[j].p);

				ctx.beginPath();
				ctx.moveTo(p.x - 2, p.y - 2);
				ctx.lineTo(p.x + 2, p.y + 2);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(p.x + 2, p.y - 2);
				ctx.lineTo(p.x - 2, p.y + 2);
				ctx.stroke();
			}
		}

		if (this.mouseJoint) {
			ctx.beginPath();
			var c = this.point2canvas(this.mouseBody.p);
			ctx.arc(c.x, c.y, this.scale * 5, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.stroke();
		}

		this.space.eachConstraint(function(c) {
			if(c.draw) {
				c.draw(ctx, self.scale, self.point2canvas);
			}
		});

		this.drawInfo();
	};

	ChipmunkDebugView.prototype.step = function() {
		// Move mouse body toward the mouse
		var newPoint = v.lerp(this.mouseBody.p, this.mouse, 0.25);
		this.mouseBody.v = v.mult(v.sub(newPoint, this.mouseBody.p), 60);
		this.mouseBody.p = newPoint;

		// var lastNumActiveShapes = this.space.activeShapes.count;

		// Only redraw if the simulation isn't asleep.
		// if (lastNumActiveShapes > 0 || ChipmunkDebugView.resized) {
		//	this.draw();
		//	ChipmunkDebugView.resized = false;
		// }
		this.draw();
	};

	// Drawing helper methods

	var drawCircle = function(ctx, scale, point2canvas, c, radius) {
		c = point2canvas(c);
		ctx.beginPath();
		ctx.arc(c.x, c.y, scale * radius, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.stroke();
	};

	var drawLine = function(ctx, point2canvas, a, b) {
		a = point2canvas(a); b = point2canvas(b);

		ctx.beginPath();
		ctx.moveTo(a.x, a.y);
		ctx.lineTo(b.x, b.y);
		ctx.stroke();
	};

	var springPoints = [
		v(0.00, 0.0),
		v(0.20, 0.0),
		v(0.25, 3.0),
		v(0.30,-6.0),
		v(0.35, 6.0),
		v(0.40,-6.0),
		v(0.45, 6.0),
		v(0.50,-6.0),
		v(0.55, 6.0),
		v(0.60,-6.0),
		v(0.65, 6.0),
		v(0.70,-3.0),
		v(0.75, 6.0),
		v(0.80, 0.0),
		v(1.00, 0.0)
	];

	var drawSpring = function(ctx, scale, point2canvas, a, b) {
		a = point2canvas(a); b = point2canvas(b);
		
		ctx.beginPath();
		ctx.moveTo(a.x, a.y);

		var delta = v.sub(b, a);
		var len = v.len(delta);
		var rot = v.mult(delta, 1/len);

		for(var i = 1; i < springPoints.length; i++) {

			var p = v.add(a, v.rotate(v(springPoints[i].x * len, springPoints[i].y * scale), rot));

			//var p = v.add(a, v.rotate(springPoints[i], delta));
			
			ctx.lineTo(p.x, p.y);
		}

		ctx.stroke();
	};


	// **** Draw methods for Shapes

	cp.PolyShape.prototype.draw = function(ctx, scale, point2canvas)
	{
		ctx.beginPath();

		var verts = this.tVerts;
		var len = verts.length;
		var lastPoint = point2canvas(new cp.Vect(verts[len - 2], verts[len - 1]));
		ctx.moveTo(lastPoint.x, lastPoint.y);

		for(var i = 0; i < len; i+=2){
			var p = point2canvas(new cp.Vect(verts[i], verts[i+1]));
			ctx.lineTo(p.x, p.y);
		}
		ctx.fill();
		ctx.stroke();
	};

	cp.SegmentShape.prototype.draw = function(ctx, scale, point2canvas) {
		var oldLineWidth = ctx.lineWidth;
		ctx.lineWidth = Math.max(1, this.r * scale * 2);
		drawLine(ctx, point2canvas, this.ta, this.tb);
		ctx.lineWidth = oldLineWidth;
	};

	cp.CircleShape.prototype.draw = function(ctx, scale, point2canvas) {
		drawCircle(ctx, scale, point2canvas, this.tc, this.r);

		// And draw a little radian so you can see the circle roll.
		drawLine(ctx, point2canvas, this.tc, cp.v.mult(this.body.rot, this.r).add(this.tc));
	};


	// Draw methods for constraints

	cp.PinJoint.prototype.draw = function(ctx, scale, point2canvas) {
		var a = this.a.local2World(this.anchr1);
		var b = this.b.local2World(this.anchr2);
		
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'grey';
		drawLine(ctx, point2canvas, a, b);
	};

	cp.SlideJoint.prototype.draw = function(ctx, scale, point2canvas) {
		var a = this.a.local2World(this.anchr1);
		var b = this.b.local2World(this.anchr2);
		var midpoint = v.add(a, v.clamp(v.sub(b, a), this.min));

		ctx.lineWidth = 2;
		ctx.strokeStyle = 'grey';
		drawLine(ctx, point2canvas, a, b);
		ctx.strokeStyle = 'red';
		drawLine(ctx, point2canvas, a, midpoint);
	};

	cp.PivotJoint.prototype.draw = function(ctx, scale, point2canvas) {
		var a = this.a.local2World(this.anchr1);
		var b = this.b.local2World(this.anchr2);
		ctx.strokeStyle = 'grey';
		ctx.fillStyle = 'grey';
		drawCircle(ctx, scale, point2canvas, a, 2);
		drawCircle(ctx, scale, point2canvas, b, 2);
	};

	cp.GrooveJoint.prototype.draw = function(ctx, scale, point2canvas) {
		var a = this.a.local2World(this.grv_a);
		var b = this.a.local2World(this.grv_b);
		var c = this.b.local2World(this.anchr2);
		
		ctx.strokeStyle = 'grey';
		drawLine(ctx, point2canvas, a, b);
		drawCircle(ctx, scale, point2canvas, c, 3);
	};

	cp.DampedSpring.prototype.draw = function(ctx, scale, point2canvas) {
		var a = this.a.local2World(this.anchr1);
		var b = this.b.local2World(this.anchr2);

		ctx.strokeStyle = 'grey';
		drawSpring(ctx, scale, point2canvas, a, b);
	};

	var randColor = function() {
	  return Math.floor(Math.random() * 256);
	};

	var styles = [];
	for (var i = 0; i < 100; i++) {
		styles.push('rgb(' + randColor() + ', ' + randColor() + ', ' + randColor() + ')');
	}

	//styles = ['rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.5)'];

	cp.Shape.prototype.style = function() {
	  var body;
	  if (this.sensor) {
	    return 'rgba(255,255,255,0)';
	  } else {
	    body = this.body;
	    if (body.isSleeping()) {
	      return 'rgb(50,50,50)';
	    } else if (body.nodeIdleTime > this.space.sleepTimeThreshold) {
	      return 'rgb(170,170,170)';
	    } else {
	      return styles[this.hashid % styles.length];
	    }
	  }
	};
})();
