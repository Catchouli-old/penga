var started = false;
var mousex = 0, mousey = 0;

var paths = {
	pathCount: 0,
	pointCount: 0,
	points: [[]],
	redo: [[]]
};

$(document).ready(initialise);

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
		paths.points[paths.pathCount].push({ x: mousex, y: mousey });
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
	context.beginPath();
	context.moveTo(mousex, mousey);

	// Add new path to array
	paths.pathCount++;
	paths.points.push([]);
	paths.points[paths.pathCount].push({x: mousex, y: mousey});

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
		paths.redo.push(paths.points[paths.pathCount]);
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
	paths.points = [[]];
	paths.redo = [[]];
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

function redraw()
{
	// Create blank string for string output
	var string = "";

	// Clear screen
	context.clearRect(0, 0, canvaselement.width(), canvaselement.height());

	// Loop through points array and redraw
	for (var i = 0; i < paths.points.length; ++i)
	{
		if (paths.points[i].length > 0)
		{
			string += "#000000";

			context.beginPath();
			context.moveTo(paths.points[i][0].x, paths.points[i][0].y);

			for (var j = 0; j < paths.points[i].length; ++j)
			{
				string += " " + paths.points[i][j].x + "," + paths.points[i][j].y;
				context.lineTo(paths.points[i][j].x, paths.points[i][j].y);
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
				paths.points.push([]);

				for (var j = 0; j < words.length; ++j)
				{
					var coords = words[j].split(',');

					if (coords.length > 1)
					{
						var x = parseFloat(coords[0]);
						var y = parseFloat(coords[1]);

						paths.points[paths.pathCount].push({x: x, y: y});
					}
				}
			}
		}
	}

	redraw();
}
