var currentColour = 0;
var unselectedBorderColour = "#AAAAAA";
var selectedBorderColour = "#000000";
var started = false;
var mousex = 0, mousey = 0;

// Current doodle
var paths =
{
	pathCount: 0,
	pointCount: 0,
	points: [],
	redo: []
};

// Available colours
var colours =
[
	"#000000",	// Black
	"#000000",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	
	"#FFFFFF",	// White
];

// Call initialise when the page is loaded
$(document).ready(initialise);

// Initialise canvas etc
function initialise()
{
	// Get canvas and context
	window.canvaselement = $('#penga');
	window.canvas = canvaselement[0];
	window.context = canvas.getContext("2d");

	// Initialise line width
	context.lineWidth = 3;

	// Set up canvas events
	canvaselement.mousemove(mousemove);
	canvaselement.mousedown(mousedown);
	canvaselement.mouseup(mouseup);

	// Set up button events
	$('#undo').click(undo_click);
	$('#redo').click(redo_click);
	$('#clear').click(clear_click);

	// Set up colours
	var colourButtons = $(".colour");
	for (var i = 0; i < colours.length && i < colourButtons.length; ++i)
	{
		var red = parseInt(Math.random() * 255);
		var green = parseInt(Math.random() * 255);
		var blue = parseInt(Math.random() * 255);
		var rgb = blue | (green << 8) | (red << 16);

		colours[i] = "#" + rgb.toString(16);

		colourButtons[i].style.background = colours[i];
		$(colourButtons[i]).click({id: i}, colour_click);
		colourButtons[i].style.borderColor = unselectedBorderColour;
	}

	// Get border colour for unselected border

	// Select first colour
	colour_click({data: {id: 0}});

	// Get last doodle and try and load it
	var last_doodle = $.localStorage.get("lastdoodle");

	if (last_doodle != undefined)
		load_doodle(last_doodle);
}

function mousemove(event)
{
	mousex = event.pageX - canvaselement.offset().left;
	mousey = event.pageY - canvaselement.offset().top;

	if (started)
	{
		paths.points[paths.pathCount-1].array.push({ x: mousex, y: mousey });
		context.lineTo(mousex, mousey);
		context.stroke();
		paths.pointCount++;
	}
}

function mousedown(event)
{
	// Start stroke
	started = true;

	// Begin path on canvas
	context.strokeStyle = colours[currentColour];
	context.beginPath();
	context.moveTo(mousex, mousey);

	// Add new path to array
	paths.pathCount++;
	paths.points.push({ colour: colours[currentColour], array: [] });
	paths.points[paths.pathCount-1].array.push({x: mousex, y: mousey});

	// Clear redo stack
	paths.redo = [[]];
}

function mouseup(event)
{
	// End stroke
	started = false;
	redraw();
}

function undo()
{
	if (paths.pathCount > 0)
	{
		paths.redo.push(paths.points[paths.pathCount-1]);
		paths.points.pop();
		paths.pathCount--;
		redraw();
	}
}

function redo()
{
	if (paths.redo.length > 0)
	{
		paths.points.push(paths.redo[paths.redo.length-1]);
		paths.redo.pop();
		paths.pathCount++;
		redraw();
	}
}

function clear()
{
	paths.points = [];
	paths.redo = [];
	paths.pathCount = 0;
	paths.pointCount = 0;
	redraw();
}

function undo_click(event)
{
	undo();
}

function redo_click(event)
{
	redo();
}

function clear_click(event)
{
	clear();
}

function colour_click(event)
{
	if (event.data.id >= 0 && event.data.id < colours.length)
	{
		$('.colour')[currentColour].style.borderColor = unselectedBorderColour;
		currentColour = event.data.id;
		context.strokeStyle = colours[currentColour];
		$('.colour')[event.data.id].style.borderColor = selectedBorderColour;
	}
}

function redraw()
{
	// Create blank string for string output
	var string = "";

	// Clear screen
	context.clearRect(0, 0, canvaselement.width(), canvaselement.height());

	// Loop through points array and redraw
	for (var i = 0; i < paths.points.length; ++i)
	{
		if (paths.points[i].array.length > 0)
		{
			var colour = paths.points[i].colour;
			string += colour;

			context.strokeStyle = colour;
			context.beginPath();
			context.moveTo(paths.points[i].array[0].x, paths.points[i].array[0].y);

			for (var j = 0; j < paths.points[i].array.length; ++j)
			{
				string += " " + paths.points[i].array[j].x + "," + paths.points[i].array[j].y;
				context.lineTo(paths.points[i].array[j].x, paths.points[i].array[j].y);
			}

			context.stroke();

			string += '\n';
		}
	}

	// base64 encode and output string
	$.localStorage.set("lastdoodle", $.base64.encode(string));
}

function load_doodle(doodle)
{
	// Convert back to plain string
	var decoded = $.base64.decode(doodle);

	// Clear canvas
	clear();

	// Create points from string
	var lines = decoded.split('\n');

	for (var i = 0; i < lines.length; ++i)
	{
		if (lines[i] != "")
		{
			var words = lines[i].split(' ');

			if (words.length > 0)
			{
				var colour = words.shift();

				paths.pathCount++;
				paths.points.push({ colour: colour, array: []});

				for (var j = 0; j < words.length; ++j)
				{
					var coords = words[j].split(',');

					if (coords.length > 1)
					{
						var x = parseFloat(coords[0]);
						var y = parseFloat(coords[1]);

						paths.points[paths.pathCount-1].array.push({x: x, y: y});
					}
				}
			}
		}
	}

	redraw();
}
