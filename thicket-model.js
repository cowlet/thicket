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

  tree.rstar = function(r) {
    // image coords for r coords [x,y]
    // x is the same, y depends on height of tree
    return [r[0], 2*tree.ymax-r[1]];
  };

  tree.r_p = findPin(points); // [x, y] coords of the pin
  tree.r_p_star = tree.rstar(tree.r_p); 
  tree.pin_to_img = 2 * tree.ymax * h;
  tree.Qu_app =  4 * Math.PI * eps_0 * eps_r * h / (3 - 1/tree.pin_to_img);

  tree.vector_dist = function(r1, r2) {
    var x = h * (r1[0] - r2[0]);
    var y = h * (r1[1] - r2[1]);
    return parseFloat(Math.sqrt(x*x + y*y).toPrecision(4));
  };

  tree.dist_to_pin = function (r) {
    // vector distance to r_p
    return tree.vector_dist(r, tree.r_p);
  };

  tree.dist_to_img = function (r) {
    // vector distance to r_p_star
    return tree.vector_dist(r, tree.r_p_star);
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

  // Now the correction factors F and G
  tree.calcF = function(r1, r2) {
    var p1 = tree.vector_dist(tree.rstar(r1), r2);
    var p2 = tree.vector_dist(tree.rstar(r2), r2);
    var p3 = tree.vector_dist(tree.rstar(r1), r1);
    var p4 = tree.vector_dist(tree.rstar(r2), r1);

    return (1/Math.abs(p1) - 1/Math.abs(p2) - 1/Math.abs(p3) + 1/Math.abs(p4));
  };

  tree.calcG = function(r1, r2) {
    // Different calc if we overlap the pin
    if ((r1[0] === tree.r_p[0] && r1[1] === tree.r_p[1]) ||
        (r2[0] === tree.r_p[0] && r2[1] === tree.r_p[1]))
    {
      //console.log("In G, point is pin");
      var p1 = tree.vector_dist(tree.rstar(r1), tree.r_p);
      var p2 = tree.vector_dist(tree.rstar(r2), tree.r_p);

      return Math.pow((-2 + 1/Math.abs(p1) - 1/Math.abs(p2)), 2) / (3 - 1/tree.pin_to_img);
    }

    //console.log("In G, point is not pin: r1=" + r1 + ", r_p=" + tree.r_p);
    // Usual case with no overlap
    var p1 = tree.vector_dist(r2, tree.r_p);
    var p2 = tree.vector_dist(r1, tree.r_p);
    var p3 = tree.vector_dist(tree.rstar(r1), tree.r_p);
    var p4 = tree.vector_dist(tree.rstar(r2), tree.r_p);

    return Math.pow((1/Math.abs(p1) - 1/Math.abs(p2) + 1/Math.abs(p3) - 1/Math.abs(p4)), 2) / (3 - 1/tree.pin_to_img);
  };

  for (var i = 0; i < tree.xmax; ++i)
  {
    for (var j = 0; j < tree.ymax; ++j)
    {
      // calc F for tree.points[i][j].x_seg
      var r1 = [i, j];
      var r2 = [i+1, j];
      tree.points[i][j].x_seg.F = tree.calcF(r1, r2);
      // calc G for tree.points[i][j].x_seg
      tree.points[i][j].x_seg.G = tree.calcG(r1, r2);
      
      // calc F for tree.points[i][j].y_seg
      var r2 = [i, j+1];
      tree.points[i][j].y_seg.F = tree.calcF(r1, r2);
      // calc G for tree.points[i][j].y_seg
      tree.points[i][j].y_seg.G = tree.calcG(r1, r2);
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
      if (tree.points[i][j].treePoint)
      {
        // calc V(r, t) using equation 5
        //var V_r_t = V * tree.points[i][j].Vu_app - VQ * tree.points[i][j].Vu_app + VQ_r;
        // VQ(t) and VQ(r, t) ?
        // To begin with, no dipoles have been added and the V is only due to applied V
        tree.points[i][j].V_r_t = V * tree.points[i][j].Vu_app;
      }
    }
  }

  // Use potential to calculate potential difference along each segment
  for (var i = 0; i < tree.xmax; ++i)
  {
    for (var j = 0; j < tree.ymax; ++j)
    {
      if (tree.points[i][j].x_seg.r > 0)
      {
        // calc V_seg
        // Get V(r, t) of two ends, and subtract?
        // x seg, so the adjacent point is [i+1][j]
        var V_seg = tree.points[i][j].V_r_t - tree.points[i+1][j].V_r_t;
        //console.log("xseg for [" + i + "," + j + "] gives V_seg = " + V_seg);
        if (Math.abs(V_seg) > Von)
        {
          //console.log("V_seg " + V_seg + " is above Von!");
          // Add a discharge dipole
          var deltaV = Von - Voff;

          var F = tree.points[i][j].x_seg.F;
          var G = tree.points[i][j].x_seg.G;
          // Qd = equation 9
          var Qd = deltaV * 4 * Math.PI * eps_0 * eps_r * h / (4-F+G);

          // add +Qd to one side and -Qd to the other
        }
      }

      if (tree.points[i][j].y_seg.r > 0)
      {
        // calc V_seg
        // y seg, so the adjacent point is [i][j+1]
        var V_seg = Math.abs(tree.points[i][j].V_r_t - tree.points[i][j+1].V_r_t);
        //console.log("yseg for [" + i + "," + j + "] gives V_seg = " + V_seg);
        if (V_seg > Von)
        {
          //console.log("V_seg " + V_seg + " is above Von!");
          // Add a discharge dipole
        }
      }
    }
  }


  return [phase, V];
};


