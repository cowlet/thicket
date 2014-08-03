/* Global model parameters */
var scale = 1/50e-6;

var h = 50e-6;
var R = h/50;

var V0 = 14142; // 10kV rms
var phase = 0;
var deltaP = 0.1;

/* Case 1, tree 2 */
var Von = 2200;
var Voff = 1500;
var Verr = 10;

var eps_r = 4.8; // flexible epoxy resin
var eps_0 = 8.845e-12;


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

var segInit = function() {
  var seg = {
    r: 0,

    Von_seg: function() {
      return Von * (1 - (r - R)/2*h);
    },
  };

  return seg;
};

var pointInit = function(pointChar) {

  var point = {
    treePoint: false,
    x_seg: segInit(),
    y_seg: segInit(),
    meshes: [],
  };

  if (pointChar !== " ")
  {
    point.treePoint = true;
  }

  if (pointChar === "-" || pointChar === "/")
  {
    point.x_seg.r = R;
  }

  if (pointChar === "|" || pointChar === "/" || pointChar === "p")
  {
    point.y_seg.r = R;
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

var findPin = function(points) {
  for (var i = 0; i < points.length; ++i)
  {
    for (var j = 0; j < points[0].length; ++j)
    {
      if (points[i][j].pin)
      {
        //console.log("Found pin [" + i + "," + j + "]");
        return [i, j];
      }
    }
  }
  return null;
};

var createTree = function(treePic) {
  var points = generateTree(treePic);

  var tree = {
    points: points,
    zmax: 1,
    ymax: points[0].length,
    xmax: points.length,
  };

  tree.r_p = findPin(points); // [x, y] coords of the pin
  tree.r_p_star = [tree.r_p[0], 2*tree.ymax-tree.r_p[1]];
  tree.pin_to_img = 2 * tree.ymax * h;
  tree.Qu_app =  4 * Math.PI * eps_0 * eps_r * h / (3 - 1/tree.pin_to_img);

  tree.dist_to_pin = function (r) {
    // vector distance to r_p
    var x = h * (r[0] - tree.r_p[0]);
    var y = h * (r[1] - tree.r_p[1]);
    return Math.sqrt(x*x + y*y);
  };

  tree.dist_to_img = function (r) {
    // vector distance to r_p_star
    var x = h * (r[0] - tree.r_p_star[0]);
    var y = h * (r[1] - tree.r_p_star[1]);
    return Math.sqrt(x*x + y*y);
  };

  tree.Vu_app = function(r) {
    return (tree.Qu_app / (4 * Math.PI * eps_0 * eps_r * h * Math.abs(tree.dist_to_pin(r)))
        - tree.Qu_app / (4 * Math.PI * eps_0 * eps_r * h * Math.abs(tree.dist_to_img(r))));
  };

  for (var i = 0; i < tree.xmax; ++i)
  {
    for (var j = 0; j < tree.ymax; ++j)
    {
      tree.points[i][j].Vu_app = tree.Vu_app([i, j]);
    }
  }

  return tree;
};

var degToRad = function(deg) {
  return (deg * Math.PI / 180);
};


var modelTick = function(tree) {
  // We want 3600 time steps per cycle, increasing by 0.1deg each step
  phase = phase + deltaP;

  // Update excitation voltage
  var V = V0 * Math.sin(degToRad(phase));

  // Calculate electric potential in tree
  for (var i = 0; i < tree.xmax; ++i)
  {
    for (var j = 0; j < tree.ymax; ++j)
    {
      if (tree.points[i][j].x_seg.r > 0)
      {
        // calc V_seg
      }

      if (tree.points[i][j].y_seg.r > 0)
      {
        // calc V_seg
      }
    }
  }

  return [phase, V];
};


