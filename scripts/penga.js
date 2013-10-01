var started = false;
var mousex = 0, mousey = 0;

$(document).ready(initialise);

function initialise()
{
	// Get canvas and context
	window.canvas = $('#penga')[0];
	window.context = canvas.getContext("2d");

	context.lineWidth = 3;

	$('#penga').mousemove(mousemove);
	$('#penga').mousedown(mousedown);
	$('#penga').mouseup(mouseup);
}

function mousemove(event)
{
	mousex = event.pageX - $('#penga').offset().left;
	mousey = event.pageY - $('#penga').offset().top;

	if (started)
	{
		context.lineTo(mousex, mousey);
		context.stroke();
	}
}

function mousedown(event)
{
	started = true;
	context.beginPath();
	context.moveTo(mousex, mousey);
}

function mouseup(event)
{
	started = false;
}
