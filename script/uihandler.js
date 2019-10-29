var UIHandler = (
	function()
	{
		var mousedown;
		var ui;
		
		return {
			
			get mousedown() { return mousedown },
			get ui() { return ui },
			
			initialize: function()
			{	
				mousedown = null;
				
				ui = [];
				
				var main = new UIWindow(0,0,800,600, "Project Poseidon");
				ui.push(main);
				
				var game = Game;
				main.addSubElement(game);
				// Ocean
				/*
				// Main Menu
				var MAIN_MENU_BUTTON_HEIGHT = 50;
				var MAIN_MENU_BUTTON_WIDTH = 150;
				
				var main_menu = new UIPanel(0,0,800,575);
				main.addSubElement(main_menu);
				
				var splash = new UIImage(800,575,Engine.assets["landscape1"]);
				main_menu.addSubElement(splash);
				var start_button = new UIButton(MAIN_MENU_BUTTON_WIDTH,50,"New Game",
					function()
					{
						main_menu.hide();
						Engine.log("Alea Iacta Ist");
						State_manager.start_new_game();
					});
				main_menu.addSubElement(start_button,main_menu.width - start_button.width - 20, 120);
				var continue_button = new UIButton(MAIN_MENU_BUTTON_WIDTH,50,"Continue");
				main_menu.addSubElement(continue_button,main_menu.width - continue_button.width - 20, 180);
				*/				
			},
			
			draw: function(context)
			{
				// draw in reverse order to reflect the order of click propagation
				var elements_to_draw = [...ui].reverse();
				elements_to_draw.forEach(element => element.draw(context));

			},
			
			handle_mousedown: function(mouseX,mouseY)
			{
				for(uielement in ui)
				{
					// if any one of the ui first registers propagation
					// return true as only one mouse down should be registered.
					if(ui[uielement].handle_mousedown(mouseX,mouseY))
					{
						mousedown = new Point(mouseX, mouseY);
						return true;
					}
				}
				// if nothing, then return 
				return false;
			},
			
			handle_mouseup: function(mouseX,mouseY)
			{
				for(uielement in ui)
				{
					// register mouseup for all ui elements to remove last_mousedown
					if(ui[uielement].handle_mouseup(mouseX,mouseY))
					{
						mousedown = null;
					}
				}
			},
			
			handle_keydown: function(character)
			{
				for(uielement in ui)
				{
					if(ui[uielement].handle_keydown(character))
					{
						return true;
					}
				}
			},
			
			handle_keyup: function(character)
			{
				for(uielement in ui)
				{
					if(ui[uielement].handle_keyup(character))
					{
						
					}
				}
			},
		}
	}
)();
