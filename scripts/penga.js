var started = false;
var mousex = 0, mousey = 0;

var paths = {
	pathCount: 0,
	pointCount: 0,
	points: [[]]
};

$(document).ready(initialise);

function initialise()
{
	// Get canvas and context
	window.canvaselement = $('#penga');
	window.canvas = canvaselement[0];
	window.context = canvas.getContext("2d");

	context.lineWidth = 3;

	canvaselement.mousemove(mousemove);
	canvaselement.mousedown(mousedown);
	canvaselement.mouseup(mouseup);

	$('#undo').click(undo_click);
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
	started = true;
	context.beginPath();
	context.moveTo(mousex, mousey);
	paths.pathCount++;
	paths.points.push([]);
	paths.points[paths.pathCount].push({x: mousex, y: mousey});
}

function mouseup(event)
{
	started = false;
}

function undo_click(event)
{
	if (paths.pathCount > 0)
	{
		paths.points.pop();
		paths.pathCount--;
		redraw();
	}
}

function redraw()
{
	context.clearRect(0, 0, canvaselement.width(), canvaselement.height());

	for (var i = 0; i < paths.points.length; ++i)
	{
		if (paths.points[i].length > 0)
		{
			context.beginPath();
			context.moveTo(paths.points[i][0].x, paths.points[i][0].y);

			for (var j = 0; j < paths.points[i].length; ++j)
			{
				context.lineTo(paths.points[i][j].x, paths.points[i][j].y);
			}

			context.stroke();
		}
	}
}
