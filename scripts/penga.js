$(document).ready(initialise);

function initialise()
{
	const canvas_name = "penga";

	var canvas = document.getElementById(canvas_name);
	
	if (canvas != null && canvas.getContext)
	{
		var context = canvas.getContext("2d");

		context.fillStyle = "rgb(200, 0, 0)";
		context.fillRect(10, 10, 50, 50);
	}	
}
