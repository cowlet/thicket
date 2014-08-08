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

  return (indent + ((degrees*scale) % (plot.width - 2*indent)));
};

var voltsToY = function(volts, plot) {
  var scale = (plot.height - 2*indent) / (2*V0); // V0 is from the model

  return (xheight - volts*scale);
};

var energyToBarHeight = function(energy, plot) {
  var scale = (plot.height/2 - indent) / 1e-8;
  return (Math.abs(energy)*scale);
};

var plotColour = function(phase) {
  var colours = ["#625192", "#4a9470"];
  // complements are ["#d4c36a", "#d4856a"]
  return colours[ (Math.floor(phase/360) % 2) ];
};

var pdColour = function(phase) {
  var colours = ["#d4856a", "#d4c36a"];
  return colours[ (Math.floor(phase/360) % 2) ];
};

var updatePlot = function(data, plot) {
  // data = [phase, V]
  // plot on appropriate point
  // cycle back to start if phase > 2 pi
  var ctx = plot.getContext("2d");

  ctx.fillStyle = plotColour(data[0]);
  ctx.fillRect(degreesToX(data[0], plot), voltsToY(data[1], plot), 2, 2);

  if (data[2] !== 0)
  {
    ctx.fillStyle = pdColour(data[0]);
    var barHeight = energyToBarHeight(data[2], plot);
    console.log("energy = " + data[2] + ", barHeight = " + barHeight);
    if (data[2] > 0)
      ctx.fillRect(degreesToX(data[0], plot), xheight-barHeight, 2, barHeight);
    else
      ctx.fillRect(degreesToX(data[0], plot), xheight, 2, barHeight);
  }
};
