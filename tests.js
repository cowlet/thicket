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

  deepEqual(tree.r_p, [13, 0], "pin location not as expected");
  deepEqual(tree.r_p_star, [13, 30], "pin img location not as expected");
  deepEqual(tree.pin_to_img, 0.0015, "pin to pin image distance not as calculated");
  deepEqual(closeEnough(tree.Qu_app, -4.020e-17, 1e-20), true, "Qu_app is "+tree.Qu_app);

  deepEqual(tree.dist_to_pin([13, 1]), h, "distance to pin not as calculated");
  deepEqual(tree.dist_to_pin([12, 0]), h, "distance to pin not as calculated");
  deepEqual(tree.dist_to_pin([10, 4]), 5*h, "distance to pin not as calculated");

  deepEqual(tree.dist_to_img([13, 1]), 29*h, "distance to img not as calculated");
  deepEqual(closeEnough(tree.dist_to_img([10, 4]), (Math.sqrt(745)*h), 0.0001), true, "distance to img wrong");
});

