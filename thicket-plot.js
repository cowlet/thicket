var indent = 21;
var xheight = null;

var initPlot = function() {
  var plot = document.getElementById("Vplot");

  // Resize canvas logical dimensions to match CSS
  var size = plot.getBoundingClientRect();
  plot.width = size.width*2;
  plot.height = size.height*2;

  var ctx = plot.getContext("2d");
  ctx.fillRect(0, 0, plot.width, plot.height);

  // draw axes
  xheight = 1+plot.height/2;
  
  // x axis
  ctx.moveTo(indent, xheight);
  ctx.lineTo(plot.width-indent, xheight);
  ctx.strokeStyle="#eee";
  ctx.stroke();

  // y axis
  ctx.moveTo(indent, plot.height-indent);
  ctx.lineTo(indent, indent);
  ctx.stroke();

  return plot;
};

var degreesToX = function(degrees, plot) {
  // plot.width-2*indent is equivalent to 360
  var scale = (plot.width - 2*indent) / 360;

  return (indent + degrees*scale);
};

var voltsToY = function(volts, plot) {
  var scale = (plot.height - 2*indent) / (2*V0); // V0 is from the model

  return (xheight - volts*scale);
};

var updatePlot = function(data, plot) {
  // data = [phase, V]
  // plot on appropriate point
  // cycle back to start if phase > 2 pi
  var ctx = plot.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(degreesToX(data[0], plot), voltsToY(data[1], plot), 2, 2);
};
