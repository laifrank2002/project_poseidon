/**
	Exactement what it says on da tin.
	We'll assume it's a point object fer performance reasons.
	Cannot collide with origin object. For obvious reasons.
 */
function CannonBall(map, position,velocity,origin)
{
	MapObject.call(this,position.x,position.y,0,0);
	this.map = map;
	
	this.origin = origin;
	
	this.z = position.z;
	this.type = "cannonball";
	this.position = position;
	this.velocity = velocity;
	
	this.damage = 10 - 10; // TEMP
}

CannonBall.prototype = Object.create(MapObject.prototype);
Object.defineProperty(CannonBall.prototype, 'constructor', {
	value: CannonBall,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

CannonBall.prototype.radius = 3;

CannonBall.prototype.draw = function(context,x,y)
{
	// kind of inaccurate by using the radius to sort proxy the height
	context.beginPath();
	context.arc(this.position.x+x
		,this.position.y+y
		,this.radius * (1 + Math.sqrt((this.position.z / 1000)))
		,0
		,Math.PI * 2);
	context.stroke();
}

CannonBall.prototype.tick = function(lapse)
{
	this.position.add(this.velocity);
	this.velocity.z += Map.prototype.GRAVITY / 1000;
	
	this.x = this.position.x;
	this.y = this.position.y;
	this.z = this.position.z;
}

CannonBall.prototype.collide = function(object, point)
{
	this.active = false;
	this.map.addObject(new Particle(this.position));
}

/**
	Only if cannon ball's z is less than map object AND is in bounds.
 */	
CannonBall.prototype.isCollideWithObject = function(object)
{
	if(object.isInBounds(this.position.x,this.position.y) && this.position.z < object.z) return true;
	return false;
}

/**
	Special case to check with water, which is the default 
 */
CannonBall.prototype.isCollideWithSea = function()
{
	if(this.position.z < 0) return true;
	return false;
}