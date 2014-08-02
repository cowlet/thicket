var h = 50;
var R = h/2;

var pointInit = function (pointChar) {

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

  return point;
};

/* Each point has a right and down component.
 * . : tree point only
 * | : down segment only
 * - : right segment only
 * / : down and right segment
 * p : pin and down segment
 */

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

   
var generateTree = function (treePic) {
  if ((treePic.length < 1) || (treePic[0].length < 1))
    return null; // must have two dimensions

  console.log("Width: " + treePic[0].length + ", height: " + treePic.length);

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
    console.log(j + ": Parsing row ->" + row + "<-\n");

    /* cycle through pic characters / x direction */
    for (var i = 0; i < treePic[0].length; ++i)
    {
      //console.log("> character '" + row[i] + "'\n");
      points[i][j] = pointInit(row[i]); // store as [x,y]
    }
  }

  return points;
};

var createTree = function () {
  var points = generateTree(tree2);

  var tree = {
    points: points,
    zmax: 1,
    ymax: points[0].length,
    xmax: points.length,
  };
  return tree;
};

