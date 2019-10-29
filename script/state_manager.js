/**
	Stores all player based data. Stores it in a special data variable.
	A reminder to please only save AT THE END OF A TICK.
 */
var State_manager = (
	function()
	{
		var data = {};
		var listeners = [];
		
		function State_listener(name,category,id,action)
		{
			this.name = name;
			this.category = category;
			this.id = id;
			this.action = action;
		}
		
		State_listener.prototype.trigger = function(category,id)
		{
			if(category === this.category && id === this.id)
			{
				this.action(category,id);
			}
		}
		
		return {
			get data() {return data},
			
			initialize: function()
			{
				/* takes the categories and initializes them */
				data["player"] = {};
				
				// temp until saving and loading is figured out 
				State_manager.start_new_game();
			},
			
			// if there are no previous saves, population data with defaults.
			start_new_game: function()
			{
				data["player"] = {name: "Anonymous"
					,stats: {
						strength: 50,
						cunning: 50,
						charisma: 50,
					}
					,money: 42
					,inventory: []}
			},
			
			set_state: function(category,id,value)
			{
				if(data[category])
				{
					data[category][id] = value;
					listeners.forEach(listener => listener.trigger(category,id));
				}
				else 
				{
					Engine.log("Set Data: No such category: " + category + " exists.");
				}
			},
			
			/**
				For convienience
			 */
			add_state: function(category,id,value)
			{
				if(data[category])
				{
					if(typeof data[category][id] !== "object")
					{
						State_manager.set_state(category,id
							,State_manager.get_state(category,id) + value);
					}
				}
				else 
				{
					Engine.log("Add Data: No such category: " + category + " exists.");
				}
			},
			
			get_state: function(category,id)
			{
				if(data[category])
				{
					return data[category][id];
				}
				else 
				{
					Engine.log("Get Data: No such category: " + category + " exists.");
				}
			},
			
			/**
				Note, no two listeners should have the same name. 
			 */
			add_listener: function(name,category,id,action)
			{
				listeners.push(new State_listener(name,category,id,action));
			},
			
			/**
				Note, fails silently 
			 */
			remove_listener: function(name)
			{
				listeners = listeners.filter(listener => listener.name !== name);
			},
			
			load: function()
			{
				
			},
			
			save: function()
			{
				
			},
		}
	}
)();