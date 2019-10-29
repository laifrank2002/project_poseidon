/**
	A ship. 'Nuff said.
 */
function Ship(map, ship = "test",x = 0, y = 0)
{
	this.map = map;
	if(!Ship.prototype.ships[ship]) throw new Error("Ship key not defined in Ship.prototype.ships.");
	RelativePolygonObject.call(this,Ship.prototype.ships[ship].points,x,y,Ship.prototype.ships[ship].z);
	
	this.ship = ship;
	this.type = "ship";
	
	this.image = images[this.ships[ship].image];
	
	this.health = Ship.prototype.ships[this.ship].health;
	this.thrust = Ship.prototype.ships[this.ship].thrust;
	this.turning = Ship.prototype.ships[this.ship].turning;
	this.tonnage = Ship.prototype.ships[this.ship].tonnage;
	
	this.ship_width = Ship.prototype.ships[this.ship].width;
	this.ship_height = Ship.prototype.ships[this.ship].height;
	
	this.weapons_points = [];
	this.fire_cooldown = 0;
	
	this.speed = 0;
	this.drag_coefficient = 0.99;
	// pathing
	this.target = null;
	this.action = null;
}

Ship.prototype = Object.create(RelativePolygonObject.prototype);
Object.defineProperty(Ship.prototype, 'constructor', {
	value: Ship,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });


Ship.prototype.COLLISION_BACKOFF = 1;	

Ship.prototype.THRUST_MULTIPLIER = 1/500;
Ship.prototype.TURNING_MULTIPLIER = 1/360;
// for getting out of really STICKY situations
// imagine the captain himself paddling furious by the side of the ship. Yeah. Yeah.
Ship.prototype.MINIMUM_TURNING = 1/720;

Ship.prototype.DEFAULT_FIRE_COOLDOWN = 1000;

Ship.prototype.DEFAULT_ACTION_LENGTH = 1000;
Ship.prototype.ACTION_QUEUE_MAX = 10;	
	
Ship.prototype.ACTIONS = {
	"PURSUE": function(lapse)
	{
		if(!this.target) 
		{
			return false;
		}
		if(this.target.type === "ship")
		{
			if(this.get_distance_to_object(this.target) < 150) 
			{
				this.thrust_backwards(lapse);
				return false;
			}
			
			//Engine.log("Own: " + this.angle + ", Tar: " + (-this.get_angle_to_object(this.target)));
			if(is_clockwise_closer(this.angle,this.get_angle_to_object(this.target)))
			{
				this.turn_clockwise(lapse);
			}
			else 
			{
				this.turn_counterclockwise(lapse);
			}
			this.thrust_forwards(lapse);
			return true;
		}
	},
	
	// pursue and circle
	
	
	// flee
	"FLEE": function(lapse)
	{
		if(!this.target) 
		{
			return false;
		}
		if(this.target.type === "ship")
		{
			//Engine.log("Own: " + this.angle + ", Tar: " + (-this.get_angle_to_object(this.target)));
			if(is_clockwise_closer(this.angle,this.get_angle_to_object(this.target)))
			{
				this.turn_counterclockwise(lapse);
			}
			else 
			{
				this.turn_clockwise(lapse);
			}
			this.thrust_forwards(lapse);
			return true;
		}
	},
	
	"TURN_TO_PORT": function(lapse)
	{
		if(!this.target) 
		{
			return false;
		}
		if(this.target.type === "ship")
		{
			var desired_angle = this.get_angle_to_object(this.target) - Math.PI/2;
			if(is_clockwise_closer(this.angle,desired_angle))
			{
				this.turn_counterclockwise(lapse);
			}
			else 
			{
				this.turn_clockwise(lapse);
			}
			
			if(!approximately_equal(normalize_angle(this.angle),normalize_angle(desired_angle),0.1))
			{
				if(this.speed < 1.5) this.thrust_forwards(lapse);
			}
			else 
			{
				this.fire(lapse);
			}
		}
	},
};
	
// DEFINED THUS FACING AT (1,0) is considered ANGLE 0 (ZERO)
Ship.prototype.ships = {
	"test": {
		"points": [{x:40,y:0},{x:30,y:10},{x:-30,y:10},{x:-30,y:-10},{x:30,y:-10}],
		"width":60, // actually just centerx
		"height":20, // for some reason, 70 makes everything go... wonky? idk
		"image": ["testship"],
		"health": 50,
		"thrust": 25,
		"turning": 10,
		"tonnage": 100,
		"z":100,
	},
	"test2": {
		"points": [{x:40,y:0},{x:35,y:10},{x:-50,y:10},{x:-50,y:-10},{x:35,y:-10}],
		"width":100, // actually just centerx
		"height":20, 
		"image": ["testship2"],
		"health": 80,
		"thrust": 20,
		"turning": 8,
		"tonnage": 125,
		"z":100,
	},
}


Ship.prototype.draw = function(context,x,y)
{
	context.translate(this.center_x + x,this.center_y + y);
	context.rotate(this.angle);
	
	if(this.image)
	{
		context.drawImage(this.image,-this.ship_width/2,-this.ship_height/2);
	}
	context.resetTransform();
	
	
	if(Engine.debugging)
	{
		this.draw_hitbox(context,x,y);
	}
}

Ship.prototype.draw_hitbox = function(context,x,y)
{
	RelativePolygonObject.prototype.draw.call(this,context,x,y);
}

Ship.prototype.tick = function(lapse)
{
	this.validate_active();
	// ai? sort'a
	var last_action;
	if(!this.action)
	{
		if(this.target)
		{
			if(this.get_distance_to_object(this.target) > 250)
			{
				this.action = new Action(this,Ship.prototype.ACTIONS["PURSUE"],10000);
			}
			else 
			{
				this.action = new Action(this,Ship.prototype.ACTIONS["TURN_TO_PORT"],1000);
			}
		}
		
	}
	if(this.action) 
	{
		this.action.tick(lapse);
		if(!this.action.active) this.action = null;
	}
	
	this.fire_cooldown -= lapse;
	
	// what all ships get 
	this.speed *= this.drag_coefficient;
	if(Math.abs(this.speed) < 0.001) this.speed = 0;
	this.moveRotated(this.speed  * lapse / 50,0);
}

/**
	We attempt to move away from the object as determined by the x and y coordinates of impact location compared to ours.
	Huh?
	BACK OFF!
 */
Ship.prototype.collide = function(object, point)
{
	switch(object.type)
	{
		case "cannonball":
			this.health -= object.damage;
			break;
		case "ship":
		default:
			this.speed = -this.speed/10;
			// the angle is negative because we want to move in the OPPOSITE direction of where we were before. BACK OFF!
			this.moveRotated(this.COLLISION_BACKOFF,0,0,-this.get_angle_to_object(object));

			break;
	}
}

Ship.prototype.get_distance_to_object = function(object)
{
	return Math.hypot(this.center_x - object.center_x,this.center_y - object.center_y);
}

Ship.prototype.get_angle_to_object = function(object)
{
	return Math.atan2(this.center_y - object.center_y, this.center_x - object.center_x)
}

/**
	An overridable method which can be used to check if an object is alive. That's right, special effects are coming, ladies and gentlemen!
 */
Ship.prototype.validate_active = function()
{
	if(this.health < 0) this.active = false;
	
	return this.active;
}

Ship.prototype.recalculatePoints = function()
{
	RelativePolygonObject.prototype.recalculatePoints.call(this);
	
	// weapons points are a kind of relative point too!
	/*
	this.points[i].x = Math.cos(this.angle) * (this.relative_points[i].x) - Math.sin(this.angle) * (this.relative_points[i].y) + this.center_x;
		this.points[i].y = Math.cos(this.angle) * (this.relative_points[i].y) + Math.sin(this.angle) * (this.relative_points[i].x) + this.center_y;
	 */
}

// what the ship can REALLY do 
Ship.prototype.fire = function()
{
	if(this.fire_cooldown < 0) 
	{
		this.fire_cooldown = this.DEFAULT_FIRE_COOLDOWN;
		this.map.addObject(this.create_cannonball(new Point(this.center_x,this.center_y,this.z),2.5,this.angle + Math.PI*1/2));
		this.map.addObject(this.create_cannonball(new Point(this.center_x,this.center_y,this.z),2.5,this.angle + Math.PI*3/2));
	}
}

Ship.prototype.create_cannonball = function(position, speed, angle)
{
	return new CannonBall(this.map, position
		,rotatePoint(new Point(speed,0,0),angle)
		,this);
},

Ship.prototype.thrust_forwards = function(lapse)
{
	this.speed += this.thrust * this.THRUST_MULTIPLIER * lapse / 10;
}

Ship.prototype.thrust_backwards = function(lapse)
{
	if(this.speed > 0)
	{
		this.speed -= this.thrust * this.THRUST_MULTIPLIER * lapse / 10;
	}
	else 
	{
		this.speed -= this.thrust * this.THRUST_MULTIPLIER * lapse / 15;
	}
}

Ship.prototype.turn_clockwise = function(lapse)
{
	this.rotate(Ship.prototype.MINIMUM_TURNING + Math.PI*this.speed/360  * lapse / 50);
}

Ship.prototype.turn_counterclockwise = function(lapse)
{
	this.rotate(-(Ship.prototype.MINIMUM_TURNING + Math.PI*this.speed/360  * lapse / 50));
}

/**
	Types of weapons.
 */
function Weapon(map)
{
	
}

/**
	Actions!
 */
function Action(ship,action,length = 1000)
{
	this.ship = ship;
	this.length = length;
	this.action = action;
	this.active = true;
}

Action.prototype.tick = function(lapse)
{
	this.length -= lapse;
	if(!this.action.call(this.ship,lapse)) this.active = false;
	if(this.length < 0) 
	{
		this.active = false;
	}
}

/**
	Gets same angle 
 */
function normalize_angle(angle)
{
	if(angle < 0)
	{
		return angle % (2 * Math.PI) + (2 * Math.PI);
	}
	else 
	{
		return angle % (2 * Math.PI);
	}
}

/**
	Cause sometimes, you just gotta say "close enough!"
 */
function approximately_equal(number1,number2,fudge = 0.05)
{
	if(number1 + fudge > number2 && number1 - fudge < number2)
	{
		return true;
	}
	return false;
}

/**
	Compares angles normalized. Only case where 0.5 > 6, but still 0.4 > 0.3;
	Does this by taking closest.
	@param angle1
	@param angle2 
	@return true if angle 2 is closer to the left of angle 1 than to the right.
 */
function is_clockwise_closer(angle1,angle2)
{
	// takes it clockwise
	var angular_distance = normalize_angle(angle1 - angle2);
	if(angular_distance <= Math.PI)
	{
		return true;
	}
	return false;
}