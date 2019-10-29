/**
	****UI Element Documentation****
	function UIElement(x,y,width,height,type = "generic",onmouseclick = null)
	
	function UIWindow(x,y,width,height,text,draggable = false, menuButton = false)
	
	function UIPanel (x,y,width,height)
	function UITabbedPanel (x,y,width,height)
	function UIScrollPanel (x,y,width,height,max_height)
	
	function UIButton (width,height,text,onmouseclick)
	function UILabel (text, align = "center")
	function UIImage (width,height,source,image_smoothing = false)
	function UITextField(width,height,validate)
	function UITextArea(width,height,text)
	
	**Implementable functions**
	 * paint(context,x,y)
	 * onmousedown(x,y)
	 * onmouseup(x,y)
	 * onmouseclick(mouseX,mouseY)
	 * onkeydown(character)
	 * onkeyup(character)
	 
 */
/** 
	UI Element 
	X and Y are absolute within canvas 
*/
function UIElement(x,y,width,height,type = "generic",onmouseclick = null)
{
	this.x = x;
	this.y = y;
	this.relative_x = x;
	this.relative_y = y;
	this.width = width;
	this.height = height;
	this.onmouseclick = onmouseclick;

	this.mousedown = null;
	
	this.paint = null;
	this.type = type;
	// element interactions
	this.children = [];
	this.parent = null;
	this.hidden = false;
	this.focused = false;
}
UIElement.prototype.indent_size = 2;
UIElement.prototype.default_colour = "#dfe8f5";
UIElement.prototype.darker_colour = "#bacde8";
UIElement.prototype.lighter_colour = "#ebf2fc";
UIElement.prototype.font = "Georgia";
UIElement.prototype.font_size = 14;
UIElement.prototype.font_colour = "#222222";

UIElement.prototype.draw = function(context)
{
	if(this.hidden) return false;
	context.save();
	/* draw self */
	context.fillStyle = this.default_colour;
	context.strokeStyle = this.darker_colour;
	
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	// we clip in order to prevent overlap onto other elements 
	context.clip();
	
	if(this.paint) this.paint(context,this.x,this.y);
	
	if(this.children)
	{
		// draw children
		this.children.forEach(child =>
			child.draw(context));
	}
	
	context.restore();
}

UIElement.prototype.draw_borders = function(context)
{
	// borders, top left 
	context.beginPath();
	UIDrawer.draw_border(context, this, "top");
	UIDrawer.draw_border(context, this, "left");
	context.closePath();
	context.strokeStyle = this.lighter_colour;
	context.stroke();
	
	// bottom right 
	context.beginPath();
	UIDrawer.draw_border(context, this, "bottom");
	UIDrawer.draw_border(context, this, "right");
	context.closePath();
	context.strokeStyle = this.darker_colour;
	context.stroke();
}

UIElement.prototype.draw_convex_indents = function(context)
{
	// indent up!
	// top and left 
	context.beginPath();
	UIDrawer.draw_indent(context, this, this.indent_size, "top");
	UIDrawer.draw_indent(context, this, this.indent_size, "left");
	context.closePath();
	context.fillStyle = this.lighter_colour;
	context.fill();
	// bottom and right 
	context.beginPath();
	UIDrawer.draw_indent(context, this, this.indent_size, "bottom");
	UIDrawer.draw_indent(context, this, this.indent_size, "right");
	context.closePath();
	context.fillStyle = this.darker_colour;
	context.fill();
}

UIElement.prototype.draw_concave_indents = function(context)
{
	// indent down!
	// top and left 
	context.beginPath();
	UIDrawer.draw_indent(context, this, this.indent_size, "top");
	UIDrawer.draw_indent(context, this, this.indent_size, "left");
	context.closePath();
	context.fillStyle = this.darker_colour;
	context.fill();
	// bottom and right 
	context.beginPath();
	UIDrawer.draw_indent(context, this, this.indent_size, "bottom");
	UIDrawer.draw_indent(context, this, this.indent_size, "right");
	context.closePath();
	context.fillStyle = this.lighter_colour;
	context.fill();
}

UIElement.prototype.isInBounds = function(x,y)
{
	// falsey values such as 0 are OK here because if it has no height or width... there are no bounds!
	if(!this.width || !this.height) return false;
	if(x > this.x && y > this.y && x < this.x + this.width && y < this.y + this.height)
	{
		return true;
	}
	return false;
}

/**
	EVERYTHING moves
	Sets ABSOLUTELY
 */
UIElement.prototype.setPosition = function(x,y)
{
	this.x = x;
	this.y = y;
	
	if(this.parent)
	{
		this.relative_x = x - this.parent.x;
		this.relative_y = y - this.parent.y;
	}
	
	if(this.children)
	{
		this.children.forEach(child =>
			{
				child.setPosition(x + child.relative_x,y + child.relative_y);
			});
	}
}

/**
	Sets RELATIVELY
 */
UIElement.prototype.setRelativePosition = function(x,y)
{
	this.relative_x = x;
	this.relative_y = y;
	
	if(this.parent)
	{
		this.x = this.relative_x + this.parent.x;
		this.y = this.relative_y + this.parent.y;
	}
	else 
	{
		this.x = x;
		this.y = y;
	}
	
	if(this.children)
	{
		this.children.forEach(child =>
			{
				child.setRelativePosition(child.relative_x,child.relative_y);
			});
	}
}
/**
	Moves without actually changing the relative_x and relative_y. Useful for SCROLL.
 */
UIElement.prototype.setTemporaryPosition = function(x,y)
{
	this.x = x;
	this.y = y;
	
	if(this.children)
	{
		this.children.forEach(child =>
			{
				child.setTemporaryPosition(x + child.relative_x,y + child.relative_y);
			});
	}
}
/*
UIElement.prototype.move = function(x,y)
{
	
}
*/
UIElement.prototype.resize = function(width,height)
{
	if(width >= 0) this.width = width;
	if(height >= 0) this.height = height;
}

UIElement.prototype.handle_mousedown = function(mouseX, mouseY)
{
	if(this.hidden) return false;
	// check if in bounds 
	if(!this.isInBounds(mouseX,mouseY)) return false;
	// handle children first 
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = this.children.length - 1; index > -1; index--)
		{
			var child = this.children[index];
			if(child.handle_mousedown(mouseX, mouseY)) return true;
		}
	}
	// handle self 
	if(this.onmousedown)
	{
		this.onmousedown(mouseX,mouseY);
	}
	this.mousedown = new Point(mouseX, mouseY);
	return true;
}

UIElement.prototype.handle_mouseup = function(mouseX, mouseY)
{
	// we DON'T return because every object needs to understand the mouseup
	if(this.children)
	{
		this.children.forEach(child =>
			{
				child.handle_mouseup(mouseX, mouseY);
			});
	}
	if(this.onmouseup)
	{
		this.onmouseup(mouseX, mouseY);
	}
	if(this.isInBounds(mouseX,mouseY) && this.mousedown)
	{
		this.focus();
		if(this.onmouseclick) this.onmouseclick(mouseX,mouseY);
	}
	else 
	{
		this.unfocus();
	}
	this.mousedown = null;
}

UIElement.prototype.handle_keydown = function(character)
{
	if(this.hidden) return false;
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = 0; index < this.children.length; index++)
		{
			var child = this.children[index];
			if(child.handle_keydown(character)) return true;
		}
	}
	
	// handle self 
	if(!this.focused) return false;
	
	if(this.onkeydown)
	{
		this.onkeydown(character);
	}
	return true;
}

UIElement.prototype.handle_keyup = function(character)
{
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = 0; index < this.children.length; index++)
		{
			var child = this.children[index];
			child.handle_keyup(character);
		}
	}
	
	if(this.onkeyup)
	{
		this.onkeyup(character);
	}
	return true;
}

UIElement.prototype.addSubElement = function(element, x=0, y=0)
{
	element.parent = this;
	element.setPosition(element.parent.x + x, element.parent.y + y);
	element.relative_x = x;
	element.relative_y = y;
	this.children.push(element);
	return element; // allows us to chain elements
}

UIElement.prototype.removeSubElement = function(element)
{
	element.parent = null;
	this.children = this.children.filter (child => child !== element);
	return element;
}

UIElement.prototype.hide = function()
{
	this.hidden = true;
}

UIElement.prototype.show = function()
{
	this.hidden = false;
}

UIElement.prototype.focus = function()
{
	this.focused = true;
}

UIElement.prototype.unfocus = function()
{
	this.focused = false;
}

// a button typed element 
function UIButton (width,height,text = "",onmouseclick)
{
	UIElement.call(this,null,null,width,height,"button",onmouseclick);
	
	this.text = text;
}

UIButton.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIButton.prototype, 'constructor', {
	value: UIButton,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIButton.prototype.draw = function(context)
{
	if(this.hidden) return false;
	
	/* draw self */
	context.fillStyle = this.default_colour;
	context.strokeStyle = this.darker_colour;
	
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	
	if(this.mousedown)
	{
		this.draw_concave_indents(context);
		
	}
	else 
	{
		this.draw_convex_indents(context);
	}
	
	if(this.paint)this.paint(context,this.x,this.y);
	
	// draw text and center
	context.font = this.font_size + "px " + this.font;
	var textMetric = context.measureText(this.text);
	context.fillStyle = this.font_colour;
	context.fillText(this.text,this.x + (this.width - textMetric.width)/2,this.y + (this.height + this.font_size)/2);
}	

// a label typed element 
function UILabel (text, align = "center")
{
	UIElement.call(this,null,null,null,null,"image");
	
	this.text = text;
	this.text_align = align;
	
}

UILabel.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UILabel.prototype, 'constructor', {
	value: UILabel,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UILabel.prototype.draw = function(context)
{
	if(this.hidden) return false;
	
	context.font = this.font_size + "px " + this.font;
	var textMetric = context.measureText(this.text);
	context.fillStyle = this.font_colour;

	switch(this.text_align)
	{
		case "left":
			// draw text and left
			context.fillText(this.text,this.x,this.y + this.font_size);
			break;
		case "center":
		default:
			// draw text from center
			context.fillText(this.text,this.x - textMetric.width/2,this.y + this.font_size/2);
	}
	
}

UILabel.prototype.setText = function(text)
{
	this.text = text;
}
// an image loader 
function UIImage (width,height,source)
{
	UIElement.call(this,null,null,width,height,"image");
	
	if(typeof source === "object")
	{
		this.image = source;
		source.image_loaded = true;
	}
	else
	{
		this.image = new Image();
		this.image.onload = function(){this.image_loaded = true;};
		this.image.src = source;
	}
}

UIImage.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIImage.prototype, 'constructor', {
	value: UIImage,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIImage.prototype.draw = function(context)
{
	if(this.hidden) return false;
	// check if loaded first.
	if (this.image.image_loaded)
	{
		// try to render 
		try 
		{
			context.drawImage(this.image,this.x,this.y,this.width,this.height);
		}
		catch(exception)
		{
			Engine.log(exception);
		}
	}
}	

UIImage.prototype.set_image = function(source)
{
	this.image = new Image();
	this.image.onload = function(){this.image_loaded = true;};
	this.image.src = source;
}

// an panel style element, a generic styled UI element
function UIPanel (x,y,width,height)
{
	UIElement.call(this,x,y,width,height,"panel");
}

UIPanel.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIPanel.prototype, 'constructor', {
	value: UIPanel,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIPanel.prototype.draw = function(context)
{
	if(this.hidden) return false;
	context.save();
	/* draw self */
	context.fillStyle = this.default_colour;
	context.strokeStyle = this.darker_colour;
	
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	context.clip();
	this.draw_borders(context);
	
	if(this.paint) this.paint(context,this.x,this.y);
	
	// draw children
	this.children.forEach(child =>
		child.draw(context));
	context.restore();
}

// a tabbed panel
function UITabbedPanel (x,y,width,height)
{
	UIElement.call(this,x,y,width,height,"tabbed_panel");
	
	this.tab_bar = new UIPanel(this.x, this.y, this.width, this.TAB_HEIGHT);
	this.content_panel = new UIPanel(this.x, this.y + this.TAB_HEIGHT, this.width, this.height - this.TAB_HEIGHT);
	// initial top bar
	this.addSubElement(this.tab_bar,0,0);
	// content panel
	this.addSubElement(this.content_panel,0,25);
}

UITabbedPanel.prototype = Object.create(UIPanel.prototype);
Object.defineProperty(UITabbedPanel.prototype, 'constructor', {
	value: UITabbedPanel,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UITabbedPanel.prototype.TAB_HEIGHT = 25;
UITabbedPanel.prototype.TAB_WIDTH = 100;

UITabbedPanel.prototype.addSubPanel = function(name,panel)
{
	// add a tab to the tabbed pane
	var previousButtonCount = this.tab_bar.children.length;
	var tabButton = new UIButton(this.TAB_WIDTH, this.TAB_HEIGHT, name
		,(mouseX,mouseY) => 
		{
			this.hideAllTabs();
			this.content_panel.children[previousButtonCount].show();
		});
	this.tab_bar.addSubElement(tabButton
		,this.x + previousButtonCount * this.TAB_WIDTH
		,0);
		
	// add it to the content pane 
	panel.setPosition(this.content_panel.x, this.content_panel.y);
	panel.resize(this.content_panel.width, this.content_panel.height);
	this.content_panel.addSubElement(panel);
	
}

UITabbedPanel.prototype.hideAllTabs = function()
{
	this.content_panel.children.forEach(child => child.hide());
}

// Scrolling, finally!
function UIScrollPanel (x,y,width,height,max_height)
{
	UIElement.call(this,x,y,width,height,"scroll_panel");
	
	if(max_height < this.height)
	{
		this.max_height = this.height + 1;
	}
	else 
	{
		this.max_height = max_height;
	}
	
	this.content_panel = new UIPanel(this.x, this.y, this.width - this.SCROLL_WIDTH, this.height);
	// we do this because addSubElement is overriden.
	UIElement.prototype.addSubElement.call(this,this.content_panel);
	
	this.scroll_bar = new UIScrollBar();
	UIElement.prototype.addSubElement.call(this,this.scroll_bar);
	// Attach always AFTER adding
	this.scroll_bar.attach(this);
}

UIScrollPanel.prototype = Object.create(UIPanel.prototype);
Object.defineProperty(UIScrollPanel.prototype, 'constructor', {
	value: UIScrollPanel,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIScrollPanel.prototype.SCROLL_WIDTH = 25;
UIScrollPanel.prototype.SCROLL_COLOUR = '#ffffff';

UIScrollPanel.prototype.setPosition = function(x,y)
{
	this.x = x;
	this.y = y;
	this.content_panel.setPosition(x,y);
	this.scroll_bar.attach(this);
}

UIScrollPanel.prototype.resize = function(width,height)
{
	UIElement.prototype.resize.call(this,width,height);
	this.content_panel.resize(width - this.SCROLL_WIDTH, height);
}

UIScrollPanel.prototype.resizeMaxHeight = function(maxHeight)
{
	
	if(maxHeight < this.height)
	{
		this.max_height = this.height + 1;
	}
	else 
	{
		this.max_height = maxHeight;
	}
	this.scroll_bar.attach(this);
	
}
/**
	One can only add to content panel, nothing else.
 */
UIScrollPanel.prototype.addSubElement = function(element, x=0, y=0)
{
	this.content_panel.addSubElement(element,x,y);
}

UIScrollPanel.prototype.moveToScroll = function()
{
	var scroll = this.scroll_bar.getScroll();
	// move everything based on relative xs and ys
	// use the parent to reconstruct the mainframe
	// we'll use the parent ABSOLUTE and the child RELATIVE 
	// in order to get the child ABSOLUTE
	// of course, we are going to be using the CONTENT panel's children 
	// then we can factor in SCROLL
	this.content_panel.children.forEach(child => child.setTemporaryPosition(child.relative_x + this.x
		,child.relative_y + this.y - scroll * (this.max_height - this.height)));
}

function UIScrollBar()
{
	UIElement.call(this,0,0,this.SCROLL_WIDTH,0,"scroll_bar");
	
	this.attached = null;
		
	// add the top and bottom buttons 
	this.topButton = new UIButton(this.SCROLL_WIDTH,this.SCROLL_WIDTH, "", ()=>this.scrollUp());
	this.addSubElement(this.topButton);
	
	this.bottomButton = new UIButton(this.SCROLL_WIDTH, this.SCROLL_WIDTH, "", ()=>this.scrollDown());
	this.addSubElement(this.bottomButton);
	
	// add the middle section
	this.scrollComponent = new UIScrollBarComponent();
	this.addSubElement(this.scrollComponent);
	this.scrollComponent.attach(this);
}

UIScrollBar.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIScrollBar.prototype, 'constructor', {
	value: UIScrollBar,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIScrollBar.prototype.SCROLL_WIDTH = UIScrollPanel.prototype.SCROLL_WIDTH;
UIScrollBar.prototype.default_colour = UIScrollPanel.prototype.SCROLL_COLOUR;

UIScrollBar.prototype.draw = function(context)
{
	if(this.hidden) return false;
	UIElement.prototype.draw.call(this,context);
	this.scrollComponent.draw_borders(context);
}

UIScrollBar.prototype.attach = function(panel)
{
	this.parent = panel;
	
	this.x = this.parent.x + this.parent.width - this.SCROLL_WIDTH;
	this.y = this.parent.y;
		
	this.width = this.SCROLL_WIDTH;
	this.height = this.parent.height;
	// change children 
	this.topButton.setPosition(this.x,this.y);
	this.bottomButton.setPosition(this.x,this.y + this.height - this.SCROLL_WIDTH);
	this.scrollComponent.attach(this);	

}

// instead of amount, we'll be converting pixels to amount
UIScrollBar.prototype.scrollUp = function(pixels = 100)
{
	var amount = (pixels/this.parent.max_height)
	this.scrollComponent.scrollUp(amount);
	if(this.parent) this.parent.moveToScroll();
}

UIScrollBar.prototype.scrollDown = function(pixels = 100)
{
	var amount = (pixels/this.parent.max_height)
	this.scrollComponent.scrollDown(amount);
	if(this.parent) this.parent.moveToScroll();
}

UIScrollBar.prototype.setScroll = function(amount)
{
	this.scrollComponent.setScroll(amount);
	if(this.parent) this.parent.moveToScroll();
}

UIScrollBar.prototype.getScroll = function()
{
	return this.scrollComponent.scroll;
}

UIScrollBar.prototype.performMouseScroll = function()
{
	this.parent.scroll = this.getScroll();
	this.parent.moveToScroll();
}

function UIScrollBarComponent()
{
	UIElement.call(this,0,0,this.SCROLL_WIDTH,0,"scroll_bar_component");
	
	this.scroll = 0;
	
	this.bar = new UIScrollBarComponentBar();
	this.addSubElement(this.bar);
	this.bar_y = 0; // relative_y
	this.bar_height;
}

UIScrollBarComponent.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIScrollBarComponent.prototype, 'constructor', {
	value: UIScrollBarComponent,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIScrollBarComponent.prototype.SCROLL_WIDTH = UIScrollPanel.prototype.SCROLL_WIDTH;
UIScrollBarComponent.prototype.default_colour = UIScrollPanel.prototype.SCROLL_COLOUR;

UIScrollBarComponent.prototype.attach = function(scrollBar)
{
	this.parent = scrollBar;
	
	this.x = scrollBar.x;
	this.y = scrollBar.y + scrollBar.SCROLL_WIDTH;
	this.width = scrollBar.SCROLL_WIDTH;
		
	// minus twice, once for top and once for bottom 
	this.height = scrollBar.height - 2 * scrollBar.SCROLL_WIDTH;

	var panel = this.parent.parent;
	if(panel)
	{
		this.bar_height = (panel.height / panel.max_height) * this.height;
		this.bar.attach(this);
	}
}

UIScrollBarComponent.prototype.scrollUp = function(amount = 0.1)
{
	this.scroll -= amount;
	if(this.scroll < 0) this.scroll = 0;
	this.bar.moveToScroll();
	
}

UIScrollBarComponent.prototype.scrollDown = function(amount = 0.1)
{
	this.scroll += amount;
	if(this.scroll > 1) this.scroll = 1;
	this.bar.moveToScroll();
	
}

UIScrollBarComponent.prototype.setScroll = function(amount)
{
	this.scroll = amount;
	if(amount < 0) this.scroll = 0;
	if(amount > 1) this.scroll = 1;
	this.bar.moveToScroll();
}
// gets scroll from scroll bar position
UIScrollBarComponent.prototype.getScrollFromBar = function()
{
	return (this.bar.y - this.y)/(this.height - this.bar_height);
}

// does a mouse scroll thing 
// helps us in propagation up the line to its parent 
UIScrollBarComponent.prototype.performMouseScroll = function()
{
	this.scroll = this.getScrollFromBar();
	this.parent.performMouseScroll();
}

function UIScrollBarComponentBar()
{
	UIElement.call(this,0,0,this.SCROLL_WIDTH,0,"scroll_bar_component_bar");
	
}

UIScrollBarComponentBar.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIScrollBarComponentBar.prototype, 'constructor', {
	value: UIScrollBarComponentBar,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIScrollBarComponentBar.prototype.SCROLL_WIDTH = UIScrollPanel.prototype.SCROLL_WIDTH;

UIScrollBarComponentBar.prototype.attach = function(scrollBar)
{
	this.parent = scrollBar;
	this.x = this.parent.x;
	this.y = this.parent.y + this.parent.scroll*(this.parent.height-this.parent.bar_height);
	this.height = this.parent.bar_height;
}

UIScrollBarComponentBar.prototype.moveToScroll = function()
{
	this.y = this.parent.y + this.parent.scroll*(this.parent.height-this.parent.bar_height);
}

// going to cheat a little here, if mousedown then we'll also modify the y position
UIScrollBarComponentBar.prototype.draw = function(context)
{
	if(this.hidden) return false;
	UIElement.prototype.draw.call(this,context);
	if(this.mousedown)
	{
		this.y = Engine.mouseY;
		if(this.y < this.parent.y) this.y = this.parent.y;
		if(this.y > this.parent.y + this.parent.height - this.parent.bar_height) this.y = this.parent.y + this.parent.height - this.parent.bar_height;
		// affect everything ALL the way down the line 
		this.parent.performMouseScroll();
	}
}
/**
	Craziest component so far. 
	We've had scrolling, we had buttons'n'text.
	Now it's time for some freakin WINDOWS!
	It's actually crazy simple, to be honest.
	Prelude to draggable windows.
	
	Only SIMULATES Windows UI, is NOT a JFRAME except in look.
	
	TITLE BAR 
		MENU BUTTONS
	MENU BAR
	TOOL BAR 
	
	STATUS BAR 
 */

function UIWindow(x,y,width,height,text,draggable = false, menuButton = false)
{
	UIElement.call(this,x,y,width,height,"window");
	// title
	this.title_bar = new UITitleBar(text,draggable,menuButton);
	UIElement.prototype.addSubElement.call(this,this.title_bar,0,0);
	this.title_bar.attach(this);
	
	// content
	this.content_panel = new UIPanel(null,null,this.width,this.height - UIWindow.prototype.TITLE_BAR_HEIGHT);
	UIElement.prototype.addSubElement.call(this,this.content_panel,0,UIWindow.prototype.TITLE_BAR_HEIGHT);
}

UIWindow.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIWindow.prototype, 'constructor', {
	value: UIWindow,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIWindow.prototype.TITLE_BAR_HEIGHT = 25;

UIWindow.prototype.addSubElement = function(element,x=0,y=0)
{
	this.content_panel.addSubElement(element,x,y);
}

UIWindow.prototype.drag = function(x,y)
{
	this.setPosition(x,y);
}

UIWindow.prototype.drop = function(x,y)
{
	// restitute, if there is a parent 
	if(this.parent)
	{
		if(this.x < this.parent.x)
		{
			this.setPosition(this.parent.x,this.y);
		}
		if(this.y < this.parent.y)
		{
			this.setPosition(this.x,this.parent.y);
		}
		if(this.x + this.width > this.parent.x + this.parent.width)
		{
			this.setPosition(this.parent.x + this.parent.width - this.width,this.y);
		}
		if(this.y + this.height > this.parent.y + this.parent.height)
		{
			this.setPosition(this.x,this.parent.y + this.parent.height - this.height);
		}
	}
}	

/**
	MENUBUTTONS
		QUIT (That's basically it)
 */
function UITitleBar(text = "",draggable,menuButton = false)
{
	UIElement.call(this,0,0,0,0,"title_bar");
	this.text = text;
	this.draggable = draggable;
	this.attached = null;
	
	this.title = new UILabel(text,"center");
	this.addSubElement(this.title,0,0);
	
	if(menuButton)
	{
		this.quit_button = new UIButton(25,25,"");
		this.quit_button.paint = function(context,x,y)
		{
			context.beginPath();
			context.moveTo(x+9,y+5);
			context.lineTo(x+5,y+9);
			context.lineTo(x+9,y+13);
			context.lineTo(x+5,y+17);
			context.lineTo(x+9,y+21);
			context.lineTo(x+13,y+17);
			context.lineTo(x+17,y+21);
			context.lineTo(x+21,y+17);
			context.lineTo(x+17,y+13);
			context.lineTo(x+21,y+9);
			context.lineTo(x+17,y+5);
			context.lineTo(x+13,y+9);
			context.closePath();
			context.fill();
			context.stroke();
		}
		this.addSubElement(this.quit_button, this.width - this.quit_button.width, 0);
	}
}

UITitleBar.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UITitleBar.prototype, 'constructor', {
	value: UITitleBar,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UITitleBar.prototype.HEIGHT = UIWindow.prototype.TITLE_BAR_HEIGHT;	

UITitleBar.prototype.draw = function(context)
{
	if(this.hidden) return false;
	
	UIElement.prototype.draw.call(this,context);
	this.draw_borders(context);
	
	// dragging!
	if(this.draggable)
	{
		if(this.mousedown)
		{
			if(this.parent)
			{
				var dragX = Engine.mouseX - this.mousedown.x + this.predrag_x;
				var dragY = Engine.mouseY - this.mousedown.y + this.predrag_y;
				this.parent.drag(dragX,dragY);
			}
		}
	}
}

UITitleBar.prototype.handle_mousedown = function(mouseX,mouseY)
{
	UIElement.prototype.handle_mousedown.call(this,mouseX,mouseY);
	this.predrag_x = this.x;
	this.predrag_y = this.y;
}

UITitleBar.prototype.handle_mouseup = function(mouseX,mouseY)
{
	if(this.draggable)
	{
		if(this.mousedown)
		{
			if(this.parent)
			{
				var dragX = mouseX - this.mousedown.x + this.predrag_x;
				var dragY = mouseY - this.mousedown.y + this.predrag_y;
				this.parent.drop(dragX,dragY);
			}
		}
	}
	UIElement.prototype.handle_mouseup.call(this,mouseX,mouseY);
}
	
UITitleBar.prototype.attach = function(parent)
{
	this.resize(parent.width,this.HEIGHT);	
	
	this.title.setRelativePosition(this.width/2,this.height/2);
	
	if(this.quit_button)
	{
		this.quit_button.setPosition(this.x + this.width - this.quit_button.width,this.y);
		this.quit_button.onmouseclick = () => {this.parent.hide()};
	}
}

UITitleBar.prototype.setDraggable = function(draggable)
{
	this.draggable = draggable;
}

/**
	A label with more control over thy text.
	Text align is left.
	No, it's not editable yet.
 */
function UITextArea(width,height,text)
{
	UIElement.call(this,null,null,width,height,"textarea");
	
	this.text = text;
	this.text_lines = [];
	
	this.rasterized = false;
	
	this.line_spacing = 1;
}

UITextArea.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UITextArea.prototype, 'constructor', {
	value: UITextArea,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UITextArea.prototype.draw = function(context)
{
	if(this.hidden) return false;
	context.save();
	
	context.font = this.font_size + "px " + this.font;
	var textMetric = context.measureText(this.text);
	context.fillStyle = this.font_colour;
	
	context.rect(this.x,this.y,this.width,this.height);
	context.clip();
	
	if(!this.rasterized)
	{
		this.rasterizeText(context);
	}
	
	for(var index = 0, length = this.text_lines.length; index < length; index++)
	{
		context.fillText(this.text_lines[index],this.x,this.y + this.font_size + (index * (this.font_size + this.line_spacing)));
	}
	context.restore();
}

UITextArea.prototype.rasterizeText = function(context)
{
	if(!this.text)
	{
		Engine.log("UI Text Area: Unable to rasterize text, text not in valid form.");
		return false;
	}
	// tokenize text, convert to words
	var words = this.text.split(" ");
	
	var line = "";
	while(words.length !== 0)
	{
		var word = words.shift();
		var clear_space = /\n/gi;
		if(context.measureText(line).width + context.measureText(word).width > this.width || word.indexOf("\n") >= 0)
		{
			this.text_lines.push(line);
			line = "";
		}
		
		line = line.concat(word.trim()," ");
	}
	if(line !== "")
	{
		this.text_lines.push(line);
	}
	this.rasterized = true;
}

UITextArea.prototype.resize = function(width,height)
{
	UIElement.prototype.resize.call(this,width,height);
	this.text_lines = [];
	this.rasterized = false;
}

/**
	Text fields are ALWAYS nice 
 */
function UITextField(width,height,validate)
{
	UIElement.call(this,null,null,width,height,"textfield");
	this.text = "";
	
	this.isValid = false;
	this.error = "";
	this.validate = validate;
}

UITextField.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UITextField.prototype, 'constructor', {
	value: UITextField,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UITextField.prototype.draw = function(context)
{
	if(this.hidden) return false;
	var textMetric = context.measureText(this.text);
	
	context.save();
	/* draw self */
	context.fillStyle = this.darker_colour;
	context.strokeStyle = this.default_colour;
	
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	// we clip in order to prevent overlap onto other elements 
	context.clip();
	
	context.fillStyle = this.font_colour;
	context.fillText(this.text,this.x + this.indent_size,this.y + this.font_size);
	
	//context.strokeStyle = this.font_colour;
	if(this.focused)
	{
		context.moveTo(this.x + this.indent_size + textMetric.width + 1, this.y + this.indent_size);
		context.lineTo(this.x + this.indent_size + textMetric.width + 1, this.y + this.height - this.indent_size);
		context.stroke();
	}
	this.draw_concave_indents(context);
	if(this.paint) this.paint(context,this.x,this.y);
	
	if(this.children)
	{
		// draw children
		this.children.forEach(child =>
			child.draw(context));
	}
	
	context.restore();
}
	
UITextField.prototype.getText = function()
{
	return this.text;
}

UITextField.prototype.setText = function(text)
{
	this.text = text;
	if(this.validate) this.validate(this.text); 
}

UITextField.prototype.getErrorText = function()
{
	return this.error;
}

UITextField.prototype.handle_keydown = function(character)
{
	if(UIElement.prototype.handle_keydown.call(this,character))
	{
		this.onKeyTyped(character);
	}
}

UITextField.prototype.onKeyTyped = function(character)
{
	// also add backspace/delete too!
	if(character.length === 1)
	{
		this.text = this.text + character;
	}
	else if(character === "Backspace")
	{
		this.text = this.text.substring(0, this.text.length - 1);
	}
	if(this.validate) this.validate(this.text); 
}

// UI Drawer, which handles away all the common features to be drawn in terms of UI
// this helps simplify the amount of 'context.lineTo()'s that we'll have to do
var UIDrawer = (
	function()
	{
		return {
			// directions 
			// top 
			// bottom 
			// left 
			// right 
			draw_indent: function(context, rectangle, indent_size, direction)
			{
				switch(direction)
				{
					case "top":
						context.moveTo(rectangle.x, rectangle.y);
						context.lineTo(rectangle.x + indent_size, rectangle.y + indent_size);
						context.lineTo(rectangle.x + rectangle.width - indent_size, rectangle.y + indent_size);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y);
						context.lineTo(rectangle.x, rectangle.y);
						break;
					case "bottom":
						context.moveTo(rectangle.x, rectangle.y + rectangle.height);
						context.lineTo(rectangle.x + indent_size, rectangle.y + rectangle.height - indent_size);
						context.lineTo(rectangle.x + rectangle.width - indent_size, rectangle.y + rectangle.height - indent_size);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y + rectangle.height);
						context.lineTo(rectangle.x, rectangle.y + rectangle.height);
						break;
					case "left":
						context.moveTo(rectangle.x, rectangle.y);
						context.lineTo(rectangle.x + indent_size, rectangle.y + indent_size);
						context.lineTo(rectangle.x + indent_size, rectangle.y + rectangle.height - indent_size);
						context.lineTo(rectangle.x, rectangle.y + rectangle.height);
						context.lineTo(rectangle.x, rectangle.y);
						break;
					case "right":
						context.moveTo(rectangle.x + rectangle.width, rectangle.y);
						context.lineTo(rectangle.x + rectangle.width - indent_size, rectangle.y + indent_size);
						context.lineTo(rectangle.x + rectangle.width - indent_size, rectangle.y + rectangle.height - indent_size);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y + rectangle.height);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y);					
						break;
					default:
						Engine.log("UIDrawer: invalid indent direction. The directions are top, bottom, left, right.");
				}
			},
			
			// draws borders 
			draw_border: function(context, rectangle, direction)
			{
				switch(direction)
				{
					case "top":
						context.moveTo(rectangle.x + 1, rectangle.y + 1);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y + 1);
						break;
					case "bottom":
						context.moveTo(rectangle.x + 1, rectangle.y + rectangle.height - 1);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y + rectangle.height - 1);
						break;
					case "left":
						context.moveTo(rectangle.x + 1, rectangle.y + 1);
						context.lineTo(rectangle.x + 1, rectangle.y + rectangle.height);
						break;
					case "right":
						context.moveTo(rectangle.x + rectangle.width - 1, rectangle.y - 1);
						context.lineTo(rectangle.x + rectangle.width - 1, rectangle.y + rectangle.height);
						break;
					default:
						Engine.log("UIDrawer: invalid border direction. The directions are top, bottom, left, right.");
				}
			},
		}
	}
	
)();
