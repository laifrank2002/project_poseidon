/*
	A NOTE
	We are operating in a 2D plane, with 3D cheating in.
	There is a z height for all objects.
	All objects are sorted according to z in graphics.
	It is also a cheat for cannonballs to fly.
 */

/**
	Special map with special objects!
	This is basically da world.
 */
 
function Map(width, height, image, viewport = new Viewport(0,0,width,height))
{
	this.x = 0;
	this.y = 0;
	this.width = width;
	this.height = height;
	this.background_image = image;
	this.viewport = viewport;
	this.objects = [];
}

Map.prototype.GRAVITY = -9.81;

Map.prototype.draw = function(context, x, y)
{	
	this.objects = this.objects.filter(object => object.active);
	if(this.background_image)
	{
		context.drawImage(this.background_image
			,this.viewport.x
			,this.viewport.y
			,this.viewport.width
			,this.viewport.height
			,x
			,y
			,this.viewport.width
			,this.viewport.height);
	}
	
	// only draw images in frame 
	// order matters! (customers will always be in front of furniture for example!)
	var objects_in_frame = this.objects.filter(object => this.viewport.isInBounds(object));
	objects_in_frame = objects_in_frame.sort((a,b) => a.z - b.z);
	
	for(var i = 0; i < objects_in_frame.length; i++)
	{
		objects_in_frame[i].draw(context,x - this.viewport.x,y - this.viewport.y)
	}
}

Map.prototype.tick = function(lapse)
{
	this.restituteViewport();
	for(var i = 0; i < this.objects.length; i++)
	{
		this.objects[i].tick(lapse);
		this.restitute(this.objects[i]);
	}
	
	for(var i = 0; i < this.objects.length; i++)
	{
		this.checkForCollision(this.objects[i]);
	}
}

Map.prototype.addObject = function(object)
{
	this.objects.push(object);
}

Map.prototype.removeObject = function(object)
{
	object.active = false;
}

Map.prototype.isObjectInBounds = function(object)
{
	if(object.x + object.width > this.x
		&& object.y + object.height > this.y 
		&& object.x < this.x + this.width 
		&& object.y < this.y + this.height)
	{
		return true;
	}
	return false;
}

Map.prototype.setViewportPosition = function(x,y)
{
	this.viewport.setPosition(x,y);
}

Map.prototype.centerViewportAt = function(x,y)
{
	this.viewport.setPosition(x - this.viewport.width / 2, y - this.viewport.height / 2);
}

Map.prototype.getViewportOffset = function()
{
	return {x:this.viewport.x,y:this.viewport.y};
}

Map.prototype.restituteViewport = function()
{
	if(this.viewport.x < this.x) this.viewport.x = this.x;
	if(this.viewport.y < this.y) this.viewport.y = this.y;
	if(this.viewport.width + this.viewport.x > this.x + this.width) this.viewport.x = this.x + this.width - this.viewport.width;
	if(this.viewport.height + this.viewport.y > this.y + this.height) this.viewport.y = this.y + this.height - this.viewport.height;
}
/**
	Since we made EVERYTHING into a map object, this is the easy part: restitution!
 */
Map.prototype.restitute = function(object)
{
	if(object.x < this.x)
	{
		object.move(this.x - object.x,0);
	}
	
	if(object.y < this.y)
	{
		object.move(0,this.y - object.y,0);
	}
	
	if(object.x + object.width > this.x + this.width)
	{
		object.move(-(object.x + object.width - this.x - this.width))
	}
	
	if(object.y + object.height > this.x + this.height)
	{
		object.move(0,-(object.y + object.height - this.y - this.height));
	}
}

/**
	Naive N! to check if object x collides w/ object y, then performances operation to check it.
	Also cleans up a few... things. Like cannonballs, if they go off screen: POOF!
 */
Map.prototype.checkForCollision = function(object)
{
	switch(object.type)
	{
		case "ship":
			for(var o = 0; o < this.objects.length; o++)
			{
				//duh.
				if(this.objects[o] === object) break;
				switch(this.objects[o].type)
				{
					case "ship":
					default:
						var collidingPoint = this.objects[o].getPolygonCollidingPoint(object);
						if(collidingPoint)
						{
							object.collide(this.objects[o],collidingPoint);
							this.objects[o].collide(object,collidingPoint);
						}
						break;
				}
			}
			break;
		case "cannonball":
			if(!this.isObjectInBounds(object)) 
			{
				object.active = false;
				return;
			}
			for(var o = 0; o < this.objects.length; o++)
			{
				//duh.
				if(this.objects[o] === object) break;
				switch(this.objects[o].type)
				{
					case "ship":
						if(this.objects[o] === object.origin) break;
						if(this.objects[o].isInBounds(object.x,object.y) && object.z <= this.objects[o].z)
						{
							this.objects[o].collide(object,object.position);
							object.collide(this.objects[o],object.position);
							return;
						}
						break;
					default:
						break;
				}
			}
			if(object.isCollideWithSea()) 
			{
				object.collide(this);
				return;
			}
			break;
		default:
			// default for collision detection is OFF! collision is expensive!
			break;
	}
}

/**
	Viewport object allows further 
	custom functions in the future made generic
	Cuts down on code overhead.
		Ex: getting objects in frame
 */
function Viewport(x,y,width,height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

/**
	Viewport's isInBounds takes the WHOLE object
	instead of just an x,y point into consideration
 */
Viewport.prototype.isInBounds = function(object)
{
	if(object.x + object.width > this.x
		&& object.y + object.height > this.y 
		&& object.x < this.x + this.width 
		&& object.y < this.y + this.height)
	{
		return true;
	}
	return false;
}

Viewport.prototype.move = function(x,y)
{
	this.x += x;
	this.y += y;
}

Viewport.prototype.setPosition = function(x,y)
{
	this.x = x;
	this.y = y;
}

Viewport.prototype.resize = function(width,height)
{
	if(!isNaN(width)) this.width = width;
	if(!isNaN(height)) this.height = height;
}

/**
	For all their glory, here they are: map objects!
	They all simplify down to rectanglers, every one of 'em (though NOT in collision)
 */
function MapObject(x,y,width,height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	
	this.center_x = x + width/2;
	this.center_y = y + height/2;
	
	this.active = true;
	this.type = "generic";
	this.z = 0;
}

MapObject.prototype.draw = function(context,x,y)
{
	context.beginPath();
	context.lineTo(this.x + x, this.y + y);
	context.lineTo(this.x + this.width + x, this.y + y);
	context.lineTo(this.x + this.width + x, this.y + this.height + y);
	context.lineTo(this.x + x, this.y + this.height + y);
	context.closePath();
	context.stroke();
}

MapObject.prototype.isInBounds = function(x,y)
{
	if(x > this.x && x < this.x + this.width 
		&& y > this.y && y < this.y + this.height)
	{
		return true; 
	}
	return false;
}

MapObject.prototype.move = function(x=0,y=0,z=0)
{
	this.x += x;
	this.y += y;
	this.z += z;
	
	this.center_x += x;
	this.center_y += y;
}

// we ain't gonna implement, but it's here just to be safe.
MapObject.prototype.collide = function(){}

/**
	A polygonal based MapObject!
	That's right, it's both a polygon and a MapObject!
 */
function PolygonObject(points)
{
	MapObject.call(this
		,Math.min.apply(Math, points.map(function(object){return object.x}))
		,Math.min.apply(Math, points.map(function(object){return object.y}))
		,Math.max.apply(Math, points.map(function(object){return object.x})) - Math.min.apply(Math, points.map(function(object){return object.x}))
		,Math.max.apply(Math, points.map(function(object){return object.y})) - Math.min.apply(Math, points.map(function(object){return object.y})));
	
	// we do this because points are bloody objects, and so they only shallow copy...
	this.points = [];
	for(var i = 0; i < points.length; i++)
	{
		this.points.push(new Point(points[i].x,points[i].y,points[i].z));
	}
}

PolygonObject.prototype = Object.create(MapObject.prototype);
Object.defineProperty(PolygonObject.prototype, 'constructor', {
	value: PolygonObject,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

PolygonObject.prototype.draw = function(context,x,y)
{
	MapObject.prototype.draw.call(this,context,x,y);
	context.beginPath();
	for(var i = 0; i < this.points.length; i++)
	{
		context.lineTo(this.points[i].x + x, this.points[i].y + y);
	}
	context.closePath();
	context.fillStyle = "black";
	if(this.isInBounds(Engine.mouseX - x,Engine.mouseY - y)) context.fill();
	
	context.stroke();
}

/* 	
	stolen shamelessly from here https://github.com/substack/point-in-polygon/blob/master/index.js which was further
	stolen shamelessly from this very good site: https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
	good lord, this code is older than I am!
*/
PolygonObject.prototype.isInBounds = function(x,y)
{
	var inside = false;
	
	for(var i = 0, j = this.points.length - 1; i < this.points.length; j = i++)
	{
		var xi = this.points[i].x, yi = this.points[i].y;
		var xj = this.points[j].x, yj = this.points[j].y;
		
		var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;

	}
	return inside;
}

/**
	Takes another polygon object and checks if IT is in bounds by check each point.
	Then, takes the OTHER polygon and checks if any of THIS points are in it.
	Naive. Not the fastest algorithm.
	
	@return the offending point, usually only one, for later uses. Returns null if there is no collision.
 */
PolygonObject.prototype.getPolygonCollidingPoint = function(polygon)
{
	for(var index = 0; index < polygon.points.length; index++)
	{
		if(this.isInBounds(polygon.points[index].x,polygon.points[index].y)) 
		{
			return polygon.points[index];
		}
	}
	
	for(var index = 0; index < this.points.length; index++)
	{
		if(polygon.isInBounds(this.points[index].x,this.points[index].y))
		{
			return this.points[index];
		}
	}
	
	return null;
}

PolygonObject.prototype.isPolygonInBounds = function(polygon)
{
	if(this.getPolygonCollidingPoint(polygon)) return true;
	return false;
}

PolygonObject.prototype.move = function(x=0,y=0,z=0)
{
	MapObject.prototype.move.call(this,x,y,z);
	for(var i = 0; i < this.points.length; i++)
	{
		this.points[i].x += x;
		this.points[i].y += y;
	}
}

/**
	Relatively pointed object. Takes an x and y as center, and points relative to it so that we can ROTATE it! Funf!
 */
function RelativePolygonObject(points,x = 0, y = 0, z = 0)
{
	PolygonObject.call(this,points);
	
	this.center_x = x;
	this.center_y = y;
	this.z = z;
	
	this.relative_points = [];
	for(var i = 0; i < points.length; i++)
	{
		this.relative_points.push(new Point(points[i].x,points[i].y));
		this.points[i].x += x;
		this.points[i].y += y;
	}
	
	this.angle = 0;
	this.recalculatePoints();
}

RelativePolygonObject.prototype = Object.create(PolygonObject.prototype);
Object.defineProperty(RelativePolygonObject.prototype, 'constructor', {
	value: RelativePolygonObject,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

/**
	@param angle in radians rotate
 */
RelativePolygonObject.prototype.rotate = function(angle)
{
	this.angle += angle;
	this.recalculatePoints();
}

/**
	@param angle in radians to rotate
 */
RelativePolygonObject.prototype.setAngle = function(angle)
{
	this.angle = angle;
	this.recalculatePoints();
}


/**
	Make sure that when you move, the center moves with you.
 */
RelativePolygonObject.prototype.move = function(x = 0, y = 0, z = 0)
{
	PolygonObject.prototype.move.call(this,x,y,z);
}

/**
	Move according to the plane as defined by the angle. 
	That means if we're rotated pi/4, a move of (0,1) will give us actually (0.707,0.707).
 */
RelativePolygonObject.prototype.moveRotated = function(x=0,y=0,z=0,angle = this.angle)
{
	var rotatedMove = rotatePoint(new Point(x,y),angle);
	PolygonObject.prototype.move.call(this,rotatedMove.x,rotatedMove.y,z);
}

/**
	Whenever we rotate, this'll recalculate points according to relative points.
 */
RelativePolygonObject.prototype.recalculatePoints = function()
{
	for(var i = 0; i < this.points.length; i++)
	{	
		/*
			We CAN'T replace this with a fcn because this.relative_points[i] is ALREADY relative. I know, it's weird, and it's a pain. 
			I mean, I guess we could add this.center_x to it, and THEN call it, but then what's the point?
		*/
		this.points[i].x = Math.cos(this.angle) * (this.relative_points[i].x) - Math.sin(this.angle) * (this.relative_points[i].y) + this.center_x;
		this.points[i].y = Math.cos(this.angle) * (this.relative_points[i].y) + Math.sin(this.angle) * (this.relative_points[i].x) + this.center_y;
		
	}
	
	this.x = Math.min.apply(Math, this.points.map(function(object){return object.x}));
	this.y = Math.min.apply(Math, this.points.map(function(object){return object.y}));
	this.width = Math.max.apply(Math, this.points.map(function(object){return object.x})) - Math.min.apply(Math, this.points.map(function(object){return object.x}));
	this.height = Math.max.apply(Math, this.points.map(function(object){return object.y})) - Math.min.apply(Math, this.points.map(function(object){return object.y}));
}

/* ****UTILS**** */
/**
	Rotates a point around another 
	Default is (0,0)
	@param point
	@param angle in radians 
	@param origin
 */
function rotatePoint(point,angle,center = new Point(0,0))
{
	return new Point(Math.cos(angle) * (point.x - center.x) - Math.sin(angle) * (point.y - center.y) + center.x
		,Math.cos(angle) * (point.y - center.y) + Math.sin(angle) * (point.x - center.x) + center.y);
}