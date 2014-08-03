var initPlot = function() {
  var plot = document.getElementById("Vplot");

  // Resize canvas logical dimensions to match CSS
  var size = plot.getBoundingClientRect();
  plot.width = size.width*2;
  plot.height = size.height*2;

  var ctx = plot.getContext("2d");
  ctx.fillRect(0, 0, plot.width, plot.height);

  // draw axes
  var indent = 21;
  ctx.moveTo(indent, plot.height-indent);
  ctx.lineTo(plot.width-indent, plot.height-indent);
  ctx.strokeStyle="#eee";
  ctx.stroke();

  ctx.moveTo(indent, plot.height-indent);
  ctx.lineTo(indent, indent);
  ctx.stroke();
};

var updatePlot = function(data) {
  // data = [phase, V]
  // plot on appropriate point
  // cycle back to start if phase > 2 pi
};
