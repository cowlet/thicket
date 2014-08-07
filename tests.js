var closeEnough = function(x, y, diff) {
  return (Math.abs(x - y) < diff);
};

/* test segInit */
test("segInit", function() {
  expect(1);

  var seg = segInit();
  deepEqual(seg.r, 0, "Initial seg r should be 0");
});

/* test pointInit */
test("pointInit with .", function() {
  expect (5);

  var point = pointInit(".");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_seg.r, 0, "x_seg.r should be 0");
  deepEqual(point.y_seg.r, 0, "y_seg.r should be 0");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with |", function() {
  expect (5);

  var point = pointInit("|");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_seg.r, 0, "x_seg.r should be 0");
  deepEqual(point.y_seg.r, R, "y_seg.r should be R");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with -", function() {
  expect (5);

  var point = pointInit("-");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_seg.r, R, "x_seg.r should be R");
  deepEqual(point.y_seg.r, 0, "y_seg.r should be 0");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with /", function() {
  expect (5);

  var point = pointInit("/");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_seg.r, R, "x_seg.r should be R");
  deepEqual(point.y_seg.r, R, "y_seg.r should be R");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with <space>", function() {
  expect (5);

  var point = pointInit(" ");
  deepEqual(point.treePoint, false, "treePoint should be false");
  deepEqual(point.x_seg.r, 0, "x_seg.r should be 0");
  deepEqual(point.y_seg.r, 0, "y_seg.r should be 0");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with p", function() {
  expect (6);

  var point = pointInit("p");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_seg.r, 0, "x_seg.r should be 0");
  deepEqual(point.y_seg.r, R, "y_seg.r should be R");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");

  deepEqual(point.pin, true, "pin should be true");
});

/* test generateTree */
test("generateTree with wrong dimensions", function() {
  expect(2);

  var tree = generateTree([]);
  deepEqual(tree, null, "tree with no dimensions should give null");

  var tree = generateTree([ [], [], []]);
  deepEqual(tree, null, "tree with empty second dimension should give null");
});

test("generateTree with correct tree", function() {
  expect(16);

  var treePic = [" "];
  var tree = generateTree(treePic);
  deepEqual(Array.isArray(tree), true, "tree should be an Array");
  deepEqual(tree.length, 1, "x dimension should be 1");
  deepEqual(Array.isArray(tree[0]), true, "tree[0] should be an Array");
  deepEqual(tree[0].length, 1, "y dimension should be 1");

  var treePic = ["  "];
  var tree = generateTree(treePic);
  deepEqual(Array.isArray(tree), true, "tree should be an Array");
  deepEqual(tree.length, 2, "x dimension should be 2");
  deepEqual(Array.isArray(tree[0]), true, "tree[0] should be an Array");
  deepEqual(tree[0].length, 1, "y dimension should be 1");

  var treePic = [" ", " "];
  var tree = generateTree(treePic);
  deepEqual(Array.isArray(tree), true, "tree should be an Array");
  deepEqual(tree.length, 1, "x dimension should be 1");
  deepEqual(Array.isArray(tree[0]), true, "tree[0] should be an Array");
  deepEqual(tree[0].length, 2, "y dimension should be 2");

  var treePic = ["  ", "  "];
  var tree = generateTree(treePic);
  deepEqual(Array.isArray(tree), true, "tree should be an Array");
  deepEqual(tree.length, 2, "x dimension should be 2");
  deepEqual(Array.isArray(tree[0]), true, "tree[0] should be an Array");
  deepEqual(tree[0].length, 2, "y dimension should be 2");
});

/* test createTree */
test("createTree correctly sets dimensions", function() {
  expect(4);

  var treePic = ["p", " "];
  var tree = createTree(treePic);
  deepEqual(Array.isArray(tree.points), true, "tree.points should be an Array");
  deepEqual(tree.xmax, 1, "x dimension should be 1");
  deepEqual(tree.ymax, 2, "y dimension should be 2");
  deepEqual(tree.zmax, 1, "z dimension should be 1");
});

test("createTree with tree2", function() {
  expect(12);

  var tree = createTree(tree2); // from model
  deepEqual(tree.xmax, 30, "x dimension should be 30");
  deepEqual(tree.ymax, 15, "y dimension should be 15");
  deepEqual(tree.zmax, 1, "z dimension should be 1");

  deepEqual(tree.r_p, [13, 0], "pin location");
  deepEqual(tree.r_p_star, [13, 30], "pin img location");
  deepEqual(tree.pin_to_img, 30, "pin to pin image distance");
  deepEqual(closeEnough(tree.Qu_app, 8.99e-15, 1e-17), true, "Qu_app is "+tree.Qu_app);

  deepEqual(tree.dist_to_pin([13, 1]), 1, "distance to pin");
  deepEqual(tree.dist_to_pin([12, 0]), 1, "distance to pin");
  deepEqual(tree.dist_to_pin([10, 4]), 5, "distance to pin");

  deepEqual(tree.dist_to_img([13, 1]), 29, "distance to img");
  deepEqual(closeEnough(tree.dist_to_img([10, 4]), Math.sqrt(685), 0.01), true, "distance to img is "+tree.dist_to_img([10, 4]));
});

test("complex tree calculations", function() {
  expect(26);

  var tree = createTree(tree2);

  // calculate F factor - two cases: x_seg and y_seg
  // y segment from pin
  var r1 = [13, 0];
  var r2 = [13, 1];
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r1), r2)), 29, "coord_dist");
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r2), r2)), 28, "coord_dist");
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r1), r1)), 30, "coord_dist");
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r2), r1)), 29, "coord_dist");
  deepEqual(closeEnough(tree.calcF(r1, r2), -8.21e-5, 1e-7), true, "calcF gives "+tree.calcF(r1, r2));

  // x segment
  var r1 = [13, 1];
  var r2 = [14, 1];
  deepEqual(closeEnough(Math.abs(tree.coord_dist(tree.rstar(r1), r2)), 28.02, 0.01), true, "coord_dist gives "+tree.coord_dist(tree.rstar(r1), r2));
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r2), r2)), 28, "coord_dist gives "+tree.coord_dist(tree.rstar(r2), r2));
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r1), r1)), 28, "coord_dist gives "+tree.coord_dist(tree.rstar(r1), r1));
  deepEqual(closeEnough(Math.abs(tree.coord_dist(tree.rstar(r2), r1)), 28.02, 0.01), true, "coord_dist gives "+tree.coord_dist(tree.rstar(r2), r1));
  // h is now on the bottom of the equation
  deepEqual(closeEnough(tree.calcF(r1, r2), -5.098e-5, 1e-8), true, "calcF gives "+tree.calcF(r1, r2));


  // calculate G factor - four cases: x_seg and y_seg, from pin and not from pin
  // y segment from pin
  var r1 = [13, 0];
  var r2 = [13, 1];
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r1), tree.r_p)), 30, "coord_dist");
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r2), tree.r_p)), 29, "coord_dist");
  deepEqual(closeEnough(tree.calcG(r1, r2), 1.3499, 0.0001), true, "calcG gives "+tree.calcG(r1, r2));

  // y segment not from pin
  var r1 = [13, 1];
  var r2 = [13, 2];
  deepEqual(Math.abs(tree.coord_dist(r2, tree.r_p)), 2, "coord_dist");
  deepEqual(Math.abs(tree.coord_dist(r1, tree.r_p)), 1, "coord_dist");
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r1), tree.r_p)), 29, "coord_dist");
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r2), tree.r_p)), 28, "coord_dist");
  deepEqual(closeEnough(tree.calcG(r1, r2), 0.08469, 1e-5), true, "calcG gives "+tree.calcG(r1, r2));

  // x segment from pin
  var r1 = [13, 0];
  var r2 = [12, 0];
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r1), tree.r_p)), 30, "coord_dist");
  deepEqual(closeEnough(Math.abs(tree.coord_dist(tree.rstar(r2), tree.r_p)), 30.02, 0.01), true, "coord_dist");
  deepEqual(closeEnough(tree.calcG(r1, r2), 1.3483, 0.0001), true, "calcG gives "+tree.calcG(r1, r2));

  // x segment not from pin
  var r1 = [12, 1];
  var r2 = [13, 1];
  deepEqual(Math.abs(tree.coord_dist(r2, tree.r_p)), 1, "coord_dist");
  deepEqual(closeEnough(Math.abs(tree.coord_dist(r1, tree.r_p)), 1.414, 1e-3), true, "coord_dist");
  deepEqual(closeEnough(Math.abs(tree.coord_dist(tree.rstar(r1), tree.r_p)), 29.02, 1e-2), true, "coord_dist");
  deepEqual(Math.abs(tree.coord_dist(tree.rstar(r2), tree.r_p)), 29, "coord_dist");
  deepEqual(closeEnough(tree.calcG(r1, r2), 0.02889, 1e-5), true, "calcG gives "+tree.calcG(r1, r2));
});

test("VQ_r", function() {
  expect(9);

  var tree = createTree(tree2);
  var i = 14;
  var j = 1;
  var r = [i, j];
  tree.points[i][j].treePoint = true;
  tree.points[i][j+1].treePoint = true;

  // check first what Vu_app is
  deepEqual(closeEnough(tree.points[i][j].Vu_app, 0.2268, 0.0001), true, "Vu_app is "+tree.points[i][j].Vu_app);

  // initially, all Qs are empty
  deepEqual(VQ_r(tree, r), 0, "initial VQ_r is zero");
  deepEqual(VQ_r(tree, tree.r_p), 0, "initial VQ_r(pin) is zero");

  // add a discharge dipole
  var initV1 = 3277.38;
  var initV2 = 1066.64;
  tree.points[i][j].V_r_t = initV1;
  tree.points[i][j+1].V_r_t = initV2;
  var V_seg = tree.points[i][j].V_r_t - tree.points[i][j+1].V_r_t;
  var deltaV = V_seg - (Voff+Verr);
  var aPoint = {i: i, j: j, dir: "y", V_seg: V_seg};

  //console.log("Previous V_seg = " + V_seg + ", Von_seg = " + tree.points[i][j].y_seg.Von_seg + ", (Voff+Verr) = " + (Voff+Verr));
  //console.log("deltaV = " + deltaV + "; orig V_seg-deltaV = " + (V_seg-deltaV));

  var Qd = dischargeDipole(tree, aPoint, deltaV);
  deepEqual(closeEnough(Qd, 4.647e-12, 1e-15), true, "Qd is "+Qd);

  // this way round definitely reduces the voltage across the segment
  tree.points[i][j].Qs.push(-Qd);
  tree.points[i][j+1].Qs.push(Qd);
  // calculated these values
  deepEqual(closeEnough(VQ_r(tree, r), -522.528, 0.001), true, "VQ_r is "+VQ_r(tree, r));
  deepEqual(closeEnough(VQ_r(tree, [i, j+1]), 522.528, 0.001), true, "VQ_r opposite end is "+VQ_r(tree, [i, j+1]));
  deepEqual(closeEnough(VQ_r(tree, tree.r_p), -0.002275, 1e-6), true, "VQ_r(pin) is "+VQ_r(tree, tree.r_p));

  // now call updatePointPotentials and check
  var V = tree.points[i][j].V_r_t / tree.points[i][j].Vu_app;
  updatePointPotentials(tree, V); 
  deepEqual(closeEnough(tree.points[i][j].V_r_t, 2754.85, 0.01), true, "V_r_t after dipole = "+tree.points[i][j].V_r_t);

  // because the initial V values were not generated at this point
  tree.points[i][j+1].V_r_t = initV2 - VQ_r(tree, tree.r_p)*tree.points[i][j+1].Vu_app + VQ_r(tree, [i, j+1]);
  deepEqual(closeEnough(tree.points[i][j+1].V_r_t, 1589.17, 0.01), true, "V_r_t after dipole = "+tree.points[i][j+1].V_r_t);

  //console.log("New V_seg = " + tree.points[i][j].V_r_t + " - " + tree.points[i][j+1].V_r_t + " = " + (tree.points[i][j].V_r_t-tree.points[i][j+1].V_r_t));
});


test("VQ_r 2", function() {
  expect(11);

  var tree = createTree(tree2);
  var i = 13;
  var j = 1;
  var r = [i, j];

  // check first what Vu_app is
  deepEqual(closeEnough(tree.points[i][j].Vu_app, 0.3255, 0.0001), true, "Vu_app is "+tree.points[i][j].Vu_app);
  deepEqual(closeEnough(tree.points[i][j+1].Vu_app, 0.1565, 0.0001), true, "Vu_app is "+tree.points[i][j+1].Vu_app);

  // initially, all Qs are empty
  deepEqual(VQ_r(tree, r), 0, "initial VQ_r is zero");
  deepEqual(VQ_r(tree, tree.r_p), 0, "initial VQ_r(pin) is zero");

  // add a discharge dipole
  var initV1 = 4239.84;
  var initV2 = 2038.80;
  tree.points[i][j].V_r_t = initV1;
  tree.points[i][j+1].V_r_t = initV2;
  var V_seg = tree.points[i][j].V_r_t - tree.points[i][j+1].V_r_t;
  var deltaV = V_seg - (Voff+Verr);
  var aPoint = {i: i, j: j, dir: "y", V_seg: V_seg};

  deepEqual(closeEnough(deltaV, 691.04, 0.01), true, "check deltaV = "+deltaV);

  var Qd = dischargeDipole(tree, aPoint, deltaV);
  deepEqual(closeEnough(Qd, 4.513e-12, 1e-15), true, "Qd is "+Qd);

  tree.points[i][j].Qs.push(-Qd);
  tree.points[i][j+1].Qs.push(Qd);
  // calculated these values
  deepEqual(closeEnough(VQ_r(tree, r), -507.5, 0.1), true, "VQ_r is "+VQ_r(tree, r));
  deepEqual(closeEnough(VQ_r(tree, [i, j+1]), 507.5, 0.1), true, "VQ_r opposite end is "+VQ_r(tree, [i, j+1]));
  deepEqual(closeEnough(VQ_r(tree, tree.r_p), -4.239e-3, 1e-6), true, "VQ_r(pin) is "+VQ_r(tree, tree.r_p));

  // now call updatePointPotentials and check
  var V = tree.points[i][j].V_r_t / tree.points[i][j].Vu_app;
  updatePointPotentials(tree, V); 
  deepEqual(closeEnough(tree.points[i][j].V_r_t, 3732.3, 0.1), true, "V_r_t after dipole = "+tree.points[i][j].V_r_t);

  deepEqual(closeEnough(tree.points[i][j+1].V_r_t, 2546.3, 0.1), true, "V_r_t after dipole = "+tree.points[i][j+1].V_r_t);

  //console.log("New V_seg = " + tree.points[i][j].V_r_t + " - " + tree.points[i][j+1].V_r_t + " = " + (tree.points[i][j].V_r_t-tree.points[i][j+1].V_r_t));
});




test("model simulation", function() {
  expect(0);

  var tree = createTree(tree2);

  // It takes 670 time steps before any V_seg goes high enough
  //for (var a = 0; a < 3; ++a)
  for (var a = 0; a < 670; ++a)
  {
    modelTick(tree);
  }

  console.log("x Von_seg: " + tree.points[13][1].x_seg.Von_seg);
  console.log("y Von_seg: " + tree.points[13][1].y_seg.Von_seg);


  modelTick(tree);
  console.log("End");

  console.log("x Von_seg: " + tree.points[13][1].x_seg.Von_seg);
  console.log("y Von_seg: " + tree.points[13][1].y_seg.Von_seg);
});
