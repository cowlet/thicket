/* Global model parameters */
var h = 1;
var R = 1/50;

var V0 = 14142; // 10kV rms
var phase = 0;
var deltaP = 0.1;


var tree2 = [
  "             p                ",
  "             |                ",
  "             |                ",
  "           /--/.              ",
  "         /-|  |               ",
  "        -| |  /--|            ",
  "         | . /.  |            ",
  "        /-|  |   /.           ",
  "        . | /-|  .            ",
  "          . | |               ",
  "            . |               ",
  "              .               ",
  "                              ",
  "                              ",
  "                              "
];

/* Each point has a right and down component.
 * . : tree point only
 * | : down segment only
 * - : right segment only
 * / : down and right segment
 * p : pin and down segment
 */

var pointInit = function(pointChar) {

  var point = {
    treePoint: false,
    x_r: 0,
    y_r: 0,
    meshes: [],
  };

  if (pointChar !== " ")
  {
    point.treePoint = true;
  }

  if (pointChar === "-" || pointChar === "/")
  {
    point.x_r = R;
  }

  if (pointChar === "|" || pointChar === "/" || pointChar === "p")
  {
    point.y_r = R;
  }

  if (pointChar === "p")
  {
    point.pin = true;
  }

  return point;
};

   
var generateTree = function(treePic) {
  if ((treePic.length < 1) || (treePic[0].length < 1))
    return null; // must have two dimensions

  //console.log("Width: " + treePic[0].length + ", height: " + treePic.length);

  /* Generate points based on dimensions and characters in tree */
  
  /* Generate empty arrays first, since we're rotating the pic dimensions
   * from height/width to width/height.
   */
  var points = [];
  for (var i = 0; i < treePic[0].length; ++i)
    points[i] = [];

  /* Cycle through pic rows / y direction */
  for (var j = 0; j < treePic.length; ++j)
  {
    var row = treePic[j];
    //console.log(j + ": Parsing row ->" + row + "<-\n");

    /* cycle through pic characters / x direction */
    for (var i = 0; i < treePic[0].length; ++i)
    {
      //console.log("> character '" + row[i] + "'\n");
      points[i][j] = pointInit(row[i]); // store as [x,y]
    }
  }

  return points;
};

var createTree = function(treePic) {
  var points = generateTree(treePic);

  var tree = {
    points: points,
    zmax: 1,
    ymax: points[0].length,
    xmax: points.length,
  };
  return tree;
};

var degToRad = function(deg) {
  return (deg * Math.PI / 180);
};

var modelTick = function() {
  /* We want 3600 time steps per cycle, increasing by 0.1deg each step */
  phase = phase + deltaP;

  var V = V0 * Math.sin(degToRad(phase));
  return [phase, V];
};


