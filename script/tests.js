var testing = true;

var TestingHelper = (
	function()
	{
		function test (testFunction, input, expectedOutput, errorMessage)
		{
			var result = testFunction(input);
			console.assert(result === expectedOutput, {errorMessage: errorMessage, input: input, output: result, expectedOutput: expectedOutput});
		}
		
		return {
			testAll: function()
			{
				Engine.log("Initializing testing suite...");
				TestingHelper.testPolygon();
			},
			
			testPolygon: function()
			{
				Engine.log("Testing Polygonal Objects...");
				
				
				// points
				// point is in bounds
				test(function(point)
					{
						var points = [new Point(1,1)
							,new Point(1,2)
							,new Point(2,2)
							,new Point(2,1)];
						var polygon = new PolygonObject(points);
						return polygon.isInBounds(point.x,point.y);
					},new Point(1.5,1.5),true, " point (1.5,1.5) should be within Polygon [(1,1),(1,2),(2,2),(2,1)].");
				// point is not in bounds
				test(function(point)
					{
						var points = [new Point(1,1)
							,new Point(1,2)
							,new Point(2,2)
							,new Point(2,1)];
						var polygon = new PolygonObject(points);
						return polygon.isInBounds(point.x,point.y);
					},new Point(2.5,1.5),false, " point (2.5,1.5) should not be within Polygon [(1,1),(1,2),(2,2),(2,1)].");
				// point is one of the verticles
				test(function(point)
					{
						var points = [new Point(1,1)
							,new Point(1,2)
							,new Point(2,2)
							,new Point(2,1)];
						var polygon = new PolygonObject(points);
						return polygon.isInBounds(point.x,point.y);
					},new Point(1,1),true, " point (1,1) should be within Polygon [(1,1),(1,2),(2,2),(2,1)].");
				// point lies on the line 
				test(function(point)
					{
						var points = [new Point(1,1)
							,new Point(1,2)
							,new Point(2,2)
							,new Point(2,1)];
						var polygon = new PolygonObject(points);
						return polygon.isInBounds(point.x,point.y);
					},new Point(1.5,1),true, " point (1.5,1) should be within Polygon [(1,1),(1,2),(2,2),(2,1)].");
				
				// polygons 
				
				// is in bounds
				test(function()
					{
						
						var p1 = [new Point(1,1)
							,new Point(1,2)
							,new Point(2,2)
							,new Point(2,1)];
						var p2 = [new Point(1.5,1.5)
							,new Point(2,3)
							,new Point(3,3)
							,new Point(3.5,1.5)
							,new Point(3,0)
							,new Point(2,0)];
						var poly1 = new PolygonObject(p1);
						var poly2 = new PolygonObject(p2);
						return poly1.isPolygonInBounds(poly2);
					},null,true, " polygon should be in bounds.");
				// is not in bounds
				test(function()
					{
						
						var p1 = [new Point(1,1)
							,new Point(1,2)
							,new Point(2,2)
							,new Point(2,1)];
						var p2 = [new Point(1.5,11.5)
							,new Point(2,13)
							,new Point(3,13)
							,new Point(3.5,11.5)
							,new Point(3,10)
							,new Point(2,10)];
						var poly1 = new PolygonObject(p1);
						var poly2 = new PolygonObject(p2);
						return poly1.isPolygonInBounds(poly2);
					},null,false, " polygon should not be in bounds.");	
				// same case 
				test(function()
					{
						
						var p1 = [new Point(1,1)
							,new Point(1,2)
							,new Point(2,2)
							,new Point(2,1)];
						var p2 = [new Point(1,1)
							,new Point(1,2)
							,new Point(2,2)
							,new Point(2,1)];
						var poly1 = new PolygonObject(p1);
						var poly2 = new PolygonObject(p2);
						return poly1.isPolygonInBounds(poly2);
					},null,true, " two polygons that have the same points should count as being in bound.");
				
				// real world example of two ships that should not be colliding
				test(function()
					{
						
						var p1 = [new Point(200,240)
							,new Point(210,230)
							,new Point(210,170)
							,new Point(190,170)
							,new Point(190,230)];
						var p2 = [new Point(300,340)
							,new Point(310,330)
							,new Point(310,270)
							,new Point(290,270)
							,new Point(290,330)];
						var poly1 = new PolygonObject(p1);
						var poly2 = new PolygonObject(p2);
						return poly1.isPolygonInBounds(poly2);
					},null,false, " these two polygons should not collide.");
				
				/* relative polygons */
				
				/*
				// 
				test(function()
					{
						
					},null,true
					
				*/
			},
		}
		
	}
)();

if(testing)
{
	TestingHelper.testAll();
}
