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

/* Case 3, tree 2 */
//var Von = 800;
//var Voff = 400;

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

var tree2_full = [
  "                                         ",
  "                                         ",
  "                                         ",
  "                    p                    ",
  "                    |                    ",
  "                    |                    ",
  "                  /--/.                  ",
  "                /-|  |                   ",
  "               -| |  /--|                ",
  "                | . /.  |                ",
  "               /-|  |   /.               ",
  "               . | /-|  .                ",
  "                 . | |                   ",
  "                   . |                   ",
  "                     .                   ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         ",
  "                                         "
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

    Von_seg: Von,
    energy: 0,
  };

  return seg;
};

var pointInit = function(pointChar) {

  var point = {
    treePoint: false,
    x_seg: segInit(),
    y_seg: segInit(),
    meshes: [],
    Qs: [],
    Vu_app: 0,
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


  tree.coord_dist = function(r1, r2) {
    var x = r1[0] - r2[0];
    var y = r1[1] - r2[1];
    return parseFloat(Math.sqrt(x*x + y*y).toPrecision(4));
  };

  tree.r_p = findPin(points); // [x, y] coords of the pin
  tree.r_p_star = tree.rstar(tree.r_p);
  tree.pin_to_img = tree.coord_dist(tree.r_p, tree.r_p_star);
  tree.Qu_app =  4 * Math.PI * eps_0 * eps_r * h / (3 - 1/tree.pin_to_img);

  tree.dist_to_pin = function (r) {
    // vector distance to r_p in coordinate space
    return tree.coord_dist(r, tree.r_p);
  };

  tree.dist_to_img = function (r) {
    // vector distance to r_p_star in coordinate space
    return tree.coord_dist(r, tree.r_p_star);
  };

  tree.Vu_app = function(r) {
    if (tree.dist_to_pin(r) === 0)
    {
      // This point is the pin, so unit potential
      return 1;
    }

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
    var p1 = tree.coord_dist(tree.rstar(r1), r2);
    var p2 = tree.coord_dist(tree.rstar(r2), r2);
    var p3 = tree.coord_dist(tree.rstar(r1), r1);
    var p4 = tree.coord_dist(tree.rstar(r2), r1);

    return (1/Math.abs(p1) - 1/Math.abs(p2) - 1/Math.abs(p3) + 1/Math.abs(p4));
  };

  tree.calcG = function(r1, r2) {
    // Different calc if we overlap the pin
    if ((r1[0] === tree.r_p[0] && r1[1] === tree.r_p[1]) ||
        (r2[0] === tree.r_p[0] && r2[1] === tree.r_p[1]))
    {
      //console.log("In G, point is pin");
      var p1 = tree.coord_dist(tree.rstar(r1), tree.r_p);
      var p2 = tree.coord_dist(tree.rstar(r2), tree.r_p);

      return Math.pow((-2 + 1/Math.abs(p1) - 1/Math.abs(p2)), 2) / (3 - 1/tree.pin_to_img);
    }

    //console.log("In G, point is not pin: r1=" + r1 + ", r_p=" + tree.r_p);
    // Usual case with no overlap
    var p1 = tree.coord_dist(r2, tree.r_p);
    var p2 = tree.coord_dist(r1, tree.r_p);
    var p3 = tree.coord_dist(tree.rstar(r1), tree.r_p);
    var p4 = tree.coord_dist(tree.rstar(r2), tree.r_p);

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

var VQ_r = function(tree, point) {
  var result = 0;
  // for all points in tree, and their image
  for (var i = 0; i < tree.xmax; ++i)
  {
    for(var j = 0; j < tree.ymax; ++j)
    {
      var denom = 4 * Math.PI * eps_0 * eps_r;
      var sum = 0;
      var Qs = tree.points[i][j].Qs;
      for (var k = 0; k < Qs.length; k++) {
        sum += Qs[k];
      }

      if (point[0] === i && point[1] === j)
      {
        // the point
        result += (3 * sum) / (denom * h);
      }
      else
      {
        // the point
        result += sum / (denom * Math.abs(tree.coord_dist(point, [i,j])));
      }
      // its image, which has equal and opposite Qs
      result += (0-sum) / (denom * Math.abs(tree.coord_dist(point, tree.rstar([i,j]))));
      //console.log(i + "," + j + " = " + result);
    }
  }
  return result;
};

var updatePointPotentials = function(tree, V) {
  var VQ_r_p = VQ_r(tree, tree.r_p);
  for (var i = 0; i < tree.xmax; ++i)
  {
    for (var j = 0; j < tree.ymax; ++j)
    {
      if (tree.points[i][j].treePoint)
      {
        // calc V(r, t) using equation 5
        tree.points[i][j].V_r_t = V * tree.points[i][j].Vu_app - VQ_r_p * tree.points[i][j].Vu_app + VQ_r(tree, [i, j]);
      }
    }
  }
};

var findAvalanchePoint = function(tree) {
  // Use point potentials to calculate potential difference along each segment.
  // Ones with V_seg above Von are candidates for triggering the avalanche.
  var candidates = [];
  for (var i = 0; i < (tree.xmax-1); ++i)
  {
    for (var j = 0; j < (tree.ymax-1); ++j)
    {
      if (tree.points[i][j].x_seg.r > 0)
      {
        // To calc V_seg, get V(r, t) of two ends, and subtract.
        // x direction, so the adjacent point is [i+1][j]
        var V_seg = tree.points[i][j].V_r_t - tree.points[i+1][j].V_r_t;
        if (Math.abs(V_seg) > tree.points[i][j].x_seg.Von_seg)
        {
          candidates.push({i: i, j: j, dir: "x", V_seg: V_seg});
        }
      }

      if (tree.points[i][j].y_seg.r > 0)
      {
        // special case for the pin segment
        if (tree.points[i][j].pin) { continue; }
        // y direction, so the adjacent point is [i][j+1]
        var V_seg = tree.points[i][j].V_r_t - tree.points[i][j+1].V_r_t;
        if (Math.abs(V_seg) > tree.points[i][j].y_seg.Von_seg)
        {
          candidates.push({i: i, j: j, dir: "y", V_seg: V_seg});
        }
      }
    }
  }

  // The max V_seg from all the candidates triggers the avalanche
  var max_seg = candidates.sort(function(a, b) {
    if (Math.abs(a.V_seg) > Math.abs(b.V_seg)) // index each item to find V_seg
      return -1;
    if (Math.abs(a.V_seg) < Math.abs(b.V_seg))
      return 1;
    return 0; 
  })[0];

  //console.log(max_seg);
  return max_seg;
};

var dischargeDipole = function(tree, apoint, deltaV) {
  if (apoint.dir === "x")
  {
    var F = tree.points[apoint.i][apoint.j].x_seg.F;
    var G = tree.points[apoint.i][apoint.j].x_seg.G;
  }
  else
  {
    var F = tree.points[apoint.i][apoint.j].y_seg.F;
    var G = tree.points[apoint.i][apoint.j].y_seg.G;
  }
  // Qd = equation 9
  return deltaV * 4 * Math.PI * eps_0 * eps_r * h / (4-F+G);
};

var dissipateEnergy = function(tree, point, Qd) {
  if (point.dir === "x")
  {
    var seg = tree.points[point.i][point.j].x_seg;
  }
  else
  {
    var seg = tree.points[point.i][point.j].y_seg;
  }

  seg.energy += Qd * (point.V_seg + Voff)/2;
};


var modelTick = function(tree) {
  // We want 3600 time steps per cycle, increasing by 0.1deg each step
  phase = phase + deltaP;

  // Update excitation voltage
  var V = V0 * Math.sin(degToRad(phase));

  while (1)
  //for (var a = 0; a < 5; ++a)
  {
    // Calculate electric potential in tree
    updatePointPotentials(tree, V);

    var aPoint = findAvalanchePoint(tree);

    if (aPoint === undefined)
    {
      // End of PD at this time step
      //console.log("No V_seg above avalanche trigger; end of PD");
      break;
    }

    console.log(aPoint);
    console.log("Qs at [i][j] are: " + tree.points[aPoint.i][aPoint.j].Qs);

    // Add a discharge dipole at the trigger point
    if (aPoint.V_seg > 0)
      var deltaV = aPoint.V_seg - Voff;
    else
      var deltaV = aPoint.V_seg + Voff;
    var Qd = dischargeDipole(tree, aPoint, deltaV);
    dissipateEnergy(tree, aPoint, Qd);

    // Add +Qd/-Qd to left and right Qs 
    if (aPoint.dir === "x")
    {
      // this point is higher potential than the neighbour
      tree.points[aPoint.i][aPoint.j].Qs.push(-Qd);
      tree.points[aPoint.i+1][aPoint.j].Qs.push(Qd);
      tree.points[aPoint.i][aPoint.j].x_seg.Von_seg = (Voff+Verr);
    }
    else
    {
      tree.points[aPoint.i][aPoint.j].Qs.push(-Qd);
      tree.points[aPoint.i][aPoint.j+1].Qs.push(Qd);
      tree.points[aPoint.i][aPoint.j].y_seg.Von_seg = (Voff+Verr);
    }
  }

  // end of time step. sum all seg.energy
  var totalEnergy = 0;
  for (var i = 0; i < tree.xmax; ++i)
  {
    for (var j = 0; j < tree.ymax; ++j)
    {
      totalEnergy += tree.points[i][j].x_seg.energy;
      totalEnergy += tree.points[i][j].y_seg.energy;
    }
  }
  if (totalEnergy > 0)
    console.log("Total energy = " + totalEnergy);

  // reset state
  for (var i = 0; i < tree.xmax; ++i)
  {
    for (var j = 0; j < tree.ymax; ++j)
    {
      tree.points[i][j].x_seg.energy = 0;
      tree.points[i][j].y_seg.energy = 0;

      tree.points[i][j].x_seg.Von_seg = Von;
      tree.points[i][j].y_seg.Von_seg = Von;
    }
  }

  return [phase, V, totalEnergy];
};


