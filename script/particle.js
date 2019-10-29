/**
	Any temporary special effect that we don't need bloody collision detection for, but STILL need z-index for.
 */
function Particle(position)
{
	MapObject.call(this,position.x,position.y,10,10);
	this.type = "particle";
	this.lifetime = 1000;
	this.position = position;
	this.z = position.z;
}

Particle.prototype = Object.create(MapObject.prototype);
Object.defineProperty(Particle.prototype, 'constructor', {
	value: Particle,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

Particle.prototype.radius = 20;
	
Particle.prototype.tick = function(lapse)
{
	this.lifetime -= lapse;
	if(this.lifetime < 0) this.active = false;
}

Particle.prototype.draw = function(context,x,y)
{
	// kind of inaccurate by using the radius to sort proxy the height
	context.beginPath();
	context.arc(this.position.x+x
		,this.position.y+y
		,this.radius
		,0
		,Math.PI * 2);
	context.stroke();
}