
var can = document.getElementById("can");
var ctx = can.getContext('2d');

var linesIntersect = function(lineA, lineB) {
	var A = { X: lineA[0], Y: lineA[1] },
		B = { X: lineA[2], Y: lineA[3] },
		C = { X: lineB[0], Y: lineB[1] },
		D = { X: lineB[2], Y: lineB[3] },
		CmP = { X: C.X - A.X, Y: C.Y - A.Y },
		r =   { X: B.X - A.X, Y: B.Y - A.Y },
		s =   { X: D.X - C.X, Y: D.Y - C.Y },
		CmPxr = CmP.X * r.Y - CmP.Y * r.X,
		CmPxs = CmP.X * s.Y - CmP.Y * s.X,
		rxs = r.X * s.Y - r.Y * s.X;

	if (CmPxr === 0) {
		return ((C.X - A.X < 0) != (C.X - B.X < 0)) ||
			((C.Y - A.Y < 0) != (C.Y - B.Y < 0));
	}

	if (rxs == 0) { return false; }
	var rxsr = 1 / rxs,
		t = CmPxs * rxsr,
		u = CmPxr * rxsr;

	return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
};

var Bar = function(x, y, radius, rotation, thickness, ctx) {
	var ang = rotation * (Math.PI / 180),
		ly = parseInt(Math.ceil(y - Math.sin(ang) * radius), 10),
		lx = parseInt(Math.ceil(x - Math.cos(ang) * radius), 10),
		rx = parseInt(Math.ceil(x + Math.cos(ang) * radius), 10),
		ry = parseInt(Math.ceil(y + Math.sin(ang) * radius), 10);

	this.draw = function() {
		ctx.beginPath();
		ctx.lineWidth = thickness;
		ctx.moveTo(lx, ly + thickness);
		ctx.lineTo(rx, ry + thickness);
		ctx.stroke();
	};

	this.getLineVector = function() {
		return [lx, ly, rx, ry];
	};
	
	this.getAngle = function() {
		return ang;
	}
};

var Marble = function(x, y, angle, bars, ctx) {
	var _x = x, _y = y, x1 = x, y1 = y, 
		rad90 = 90 * (Math.PI / 180),
		rad180 = Math.PI,
		rad360 = 360 * (Math.PI / 180),
		acc = 0,
		ang = angle,
		wasFlying = true;
	
	function gravAcceleration() {
		return  ang > rad90
			? (rad180 - ang) * 0.008
			: ang * 0.008
			;
	}
	
	function downwardCollision() {
		for (var i = 0; i < bars.length; i++) {
			var collides = linesIntersect(
				bars[i].getLineVector(),
				[_x, _y, _x + Math.cos(rad90) * acc, _y + Math.sin(rad90) * acc ]
			);
			if (collides) {
				return {
					collides: true,
					angle: bars[i].getAngle()
				};
			}
		}
		return {
			collides: false
		};
	}
	
	function blocked() {
		// collidesWithCurrentDirectionVector
		return false;
	}
	
	this.accelerate = function() {
		_y += Math.sin(ang) * acc;
		_x += Math.cos(ang) * acc;
		x1 = parseInt(Math.ceil(_x), 10);
		y1 = parseInt(Math.ceil(_y), 10);
		
		if (blocked()) {
			acc = 0;
		} else {
			acc += gravAcceleration();
		}
		
		var collision = downwardCollision()
		if (collision.collides) {
			ang = collision.angle;

		} else {
			wasFlying = true;
			if (ang < rad90) {
				ang += 0.05;
			} else if (ang > rad90) {
				ang -= 0.05;
			}
		}
	};

	this.draw = function() {
		ctx.arc(
			x1,y1,
			4,  0, 2 * Math.PI, false
		)
	};
};

var bars = [
	new Bar(255, 250, 250, 25, 3, ctx),
	new Bar(350, 500, 250, 350 - 180, 3, ctx)
];

var marbles = [
	new Marble(260, 10, 20 * (Math.PI / 180), bars, ctx), 
	new Marble(250, 10, 140 * (Math.PI / 180), bars, ctx),
	new Marble(265, 10, 22 * (Math.PI / 180), bars, ctx), 
	new Marble(240, 10, 138 * (Math.PI / 180), bars, ctx),
];



var frameRenderer = (function(ctx) {
	var width, height;
	this.onResize = function(w, h) {
		width = w;
		height = h;
	};
	
	function render() {
		ctx.clearRect(0,0,width,height);
		for (var i = 0; i < marbles.length; i++) {
			ctx.beginPath();
			marbles[i].draw();
			ctx.fill();
		}
		for (var i = 0; i < bars.length; i++) {
			bars[i].draw();
		}
		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
	return this;
})(ctx);

window.setInterval(function() {
	for (var i = 0; i < marbles.length; i++) {
		marbles[i].accelerate();
	}
}, 10);

var resizeListeners = (function(canvas) {
	function log() { console.log(arguments); }
	function rescaleGame(width, height) {
		canvas.width = width;
		canvas.height = height;
	}

	return [log, rescaleGame, frameRenderer.onResize];
})(can);

var viewPort = (function(listeners) {
	function onResize() {
		resizeListeners.forEach(function (listener) { 
			listener(window.innerWidth, window.innerHeight);
		});
	}
	
	onResize();
	window.addEventListener("resize", onResize);
	return this;
})(resizeListeners);

