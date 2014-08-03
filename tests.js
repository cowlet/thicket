/* test pointInit */
test("pointInit with .", function() {
  expect (5);

  var point = pointInit(".");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_r, 0, "x_r should be 0");
  deepEqual(point.y_r, 0, "y_r should be 0");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with |", function() {
  expect (5);

  var point = pointInit("|");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_r, 0, "x_r should be 0");
  deepEqual(point.y_r, R, "y_r should be R");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with -", function() {
  expect (5);

  var point = pointInit("-");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_r, R, "x_r should be R");
  deepEqual(point.y_r, 0, "y_r should be 0");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with /", function() {
  expect (5);

  var point = pointInit("/");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_r, R, "x_r should be R");
  deepEqual(point.y_r, R, "y_r should be R");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with <space>", function() {
  expect (5);

  var point = pointInit(" ");
  deepEqual(point.treePoint, false, "treePoint should be false");
  deepEqual(point.x_r, 0, "x_r should be 0");
  deepEqual(point.y_r, 0, "y_r should be 0");
  deepEqual(Array.isArray(point.meshes), true, "meshes should be an Array");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});

test("pointInit with p", function() {
  expect (6);

  var point = pointInit("p");
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_r, 0, "x_r should be 0");
  deepEqual(point.y_r, R, "y_r should be R");
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

test("createTree correctly sets dimensions", function() {
  expect(4);

  var treePic = [" ", " "];
  var tree = createTree(treePic);
  deepEqual(Array.isArray(tree.points), true, "tree.points should be an Array");
  deepEqual(tree.xmax, 1, "x dimension should be 1");
  deepEqual(tree.ymax, 2, "y dimension should be 2");
  deepEqual(tree.zmax, 1, "z dimension should be 1");
});

