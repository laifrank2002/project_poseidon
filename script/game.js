/**
	Arrghhh! The customizable main logic of the game, mateys!
 */
var Game = (function()
	{
		var element = new UIPanel(0,0,800,575);
		var map;
		var Player;
		
		var fields = {
			
		}
		Object.assign(element,fields);
		
		var methods = {
			initialize: function()
			{
				Engine.log("Initializing Game...");
				map = new Map(1000,1000,images.testmap1,new Viewport(0,0,this.width,this.height));
				
				// Player
				Player = new Ship(map, "test2",500,300);
				Object.assign(Player,
					{
						FIRE_COOLDOWN: 1000,
						
						z: 100,
						speed: 0,
						drag_coefficient: 0.98,
						
						fire_cooldown: 0,
						
						tick: function(lapse)
						{
							if(Engine.keysPressed["left"])
							{
								this.turn_counterclockwise(lapse);
							}
							
							if(Engine.keysPressed["right"])
							{
								this.turn_clockwise(lapse);
							}
							
							if(Engine.keysPressed["up"])
							{
								this.thrust_forwards(lapse);
							}
							
							if(Engine.keysPressed["down"])
							{
								this.thrust_backwards(lapse);
							}
												
							if(Engine.keysPressed["f"] && this.fire_cooldown < 0)
							{
								this.fire_cooldown = this.FIRE_COOLDOWN;
								this.fire();
							}
							
							this.speed *= this.drag_coefficient;
							if(Math.abs(this.speed) < 0.001) this.speed = 0;
							this.moveRotated(this.speed  * lapse / 50,0);
							
							this.fire_cooldown -= lapse;
							
						},
						
						fire: function()
						{
							var cannonball_speed = 2.5;
							// gonna do a little cheating now 
							this.map.addObject(this.create_cannonball(new Point(this.center_x,this.center_y,this.z),cannonball_speed,this.angle + Math.PI*1/2));
							this.map.addObject(this.create_cannonball(new Point(this.center_x,this.center_y,this.z),cannonball_speed,this.angle + Math.PI*3/2));
						},
						
						create_cannonball: function(position, speed, angle)
						{
							return new CannonBall(map, position
								,rotatePoint(new Point(speed,0,0),angle)
								,this);
						},
						
						collide: function(object,point)
						{
							Ship.prototype.collide.call(this,object,point);
						},
					});
				map.addObject(Player);
				
				
				Player.thrust = 55;
				//var opponent = new Ship(map, "test",300,300);
				//opponent.target = Player;
				
				var t1 = new Ship(map, "test", 100, 300);

				map.addObject(t1);
				
				var t2 = new Ship(map, "test", 100, 400);
				
				map.addObject(t2);
				
				var t3 = new Ship(map, "test", 100, 500);
				
				map.addObject(t3);
				
				var o1 = new Ship(map, "test", 400, 300);
				o1.angle = Math.PI;
				map.addObject(o1);
				
				var o2 = new Ship(map, "test", 400, 400);
				o2.angle = Math.PI;
				map.addObject(o2);
				
				var o3 = new Ship(map, "test", 400, 500);
				o3.angle = Math.PI;
				map.addObject(o3);
				
				t1.target = o2;
				t2.target = o3;
				t3.target = o1;
				
				o1.target = t2;
				o2.target = t3;
				o3.target = t1;
				
				console.log(t1);
				//map.addObject(opponent);
				
			},
			
			paint: function(context,x,y)
			{
				context.strokeStyle = "black";
				map.draw(context,this.x,this.y);
			},
			
			tick: function(lapse)
			{
				// move viewport according to player
				map.tick(lapse);
				map.centerViewportAt(Player.center_x,Player.center_y);
				//Player.tick(lapse);
			},
		}
		Object.assign(element,methods);
		
		return element;
	}
)();

