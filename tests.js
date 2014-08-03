test("pointInit with .", function() {
  expect (4);

  var c = ".";
  var point = pointInit(c);
  deepEqual(point.treePoint, true, "treePoint should be true");
  deepEqual(point.x_r, 0, "x_r should be 0");
  deepEqual(point.y_r, 0, "y_r should be 0");
  deepEqual(point.meshes.length, 0, "meshes should be empty");
});



