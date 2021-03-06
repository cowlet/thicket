(function ()
{
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 1000);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.sortObjects = false;

  /* Set up materials */
  var healthy = new THREE.MeshLambertMaterial({color: 0x00ff00, transparent: true, opacity: 0.1});
  var damaged = new THREE.MeshLambertMaterial({color: 0xff0000, transparent: true, opacity: 0.7});
  var electrode = new THREE.MeshLambertMaterial({color: 0x555555}); 

  /* Generate tree model */
  var tree = createTree(tree2);

  // Set up co-ordinate points
  var centrex = tree.xmax/2;
  var centrey = tree.ymax/2;
  var centrez = tree.zmax/2;

  /* Draw the resin */
  var resin = new THREE.Mesh(new THREE.BoxGeometry(tree.xmax, tree.ymax, tree.zmax), healthy);
  resin.position.set(centrex, centrey, 0);
  scene.add(resin);
  var plate = new THREE.Mesh(new THREE.BoxGeometry(tree.xmax, 1, 1), electrode);
  plate.position.set(centrex, tree.ymax+0.5, 0);
  scene.add(plate);

  /* Add damage points and segments */
  for (var i = 0; i < tree.xmax; ++i) 
  {
    for (var j = 0; j < tree.ymax; ++j)
    {
      for (var k = 0; k < tree.zmax; ++k)
      {
        /* Add tree points */
        if (tree.points[i][j].treePoint)
        {
          //console.log("Adding a tree point [" + i + "," + j + "]");
          if (tree.points[i][j].pin)
            var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), electrode);
          else
            var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), damaged);
          sphere.position.set(i, j, k);
          scene.add(sphere);

          tree.points[i][j].meshes.push(sphere);
        }

        /* Add horizontal segments */
        if (tree.points[i][j].x_seg.r > 0)
        {
          var r = tree.points[i][j].x_seg.r;
          var seg = new THREE.Mesh(new THREE.CylinderGeometry(scale*r, scale*r, scale*h), damaged);
          seg.position.set(i+(scale*h)/2, j, k);
          seg.rotation.x = Math.PI/2;
          seg.rotation.z = Math.PI/2;
          scene.add(seg);

          tree.points[i][j].meshes.push(seg);
        }

        /* Add vertical segments */
        if (tree.points[i][j].y_seg.r > 0)
        {
          var r = tree.points[i][j].y_seg.r;
          var seg = new THREE.Mesh(new THREE.CylinderGeometry(scale*r, scale*r, scale*h), damaged);
          seg.position.set(i, j+(scale*h)/2, k);
          scene.add(seg);

          tree.points[i][j].meshes.push(seg);
        }
      }
    }
  }

  /* Lighting */
  var ambLight = new THREE.AmbientLight(0x202020);
  scene.add(ambLight);

  // Add directional lights to front and back (from top left)
  [1, -1].forEach(function(z) {
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(-1, 1, z);
    scene.add(dirLight);
  });

  /* Setup and link gui to camera params */ 
  var params =
  {
    camType: 'rotate', // can be rotate, free, or dissect
    camRad: 30, // radius of camera from centre
    alpha: 0, // initial angle of camera
    astep: 2, // angle step in degrees
    zdepth: tree.zmax, // number of z layers to show
    equipot: false, // show equipotential planes
  };
  camera.position.set(centrex, centrey, centrez+params.camRad);

  document.getElementById('astep_input').onchange = function() {
    params.astep = +this.value;
  };

  var toggleDissectControls = function(camType) {
    var controls = document.getElementById('dissect_controls');

    if (camType === 'dissect') {
      controls.classList.remove('hidden');
    }
    else {
      controls.classList.add('hidden');
    }
  };

  var camera_select = document.getElementById('camera_select');
  camera_select.onchange = function() {
    params.camType = this.value;
    toggleDissectControls(params.camType);

    if (params.camType === 'free') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
    }
    else if (params.camType === 'dissect') {
      // manual camera position was [15, 10.8, 11.4]
      camera.position.set(-5, 11, 11);
      camera.lookAt(new THREE.Vector3 (tree.xmax/2, tree.xmax/2, tree.xmax/2)); // the centre
      params.camRad = 16;
      controls = null; // disable mouse control
    }
    else if (params.camType === 'rotate') {
      // from current position, work out new radius
      params.camRad = Math.sqrt(camera.position.x*camera.position.x + camera.position.z*camera.position.z);
      console.log("New r is " + params.camRad + " based on x " + camera.position.x + ", z " + camera.position.z);
    }
  };
  camera_select.dispatchEvent(new Event('change'));

  /* Dissection controls */
  var changeLayerVis = function (z, visible) {
    if ((z >= tree.zmax) || (z < 0)) { return; }

    for (var i = 0; i < tree.xmax; ++i) {
      for (var j = 0; j < tree.ymax; ++j) {
        for (var m in tree.points[i][j].meshes)
          m.visible = visible
        //cubes[i][j][z].visible = visible;
      }
    }
  };

  document.getElementById('dissect_in_button').onclick = function() {
    // slice off top layer
    params.zdepth -= 1;
    if (params.zdepth < 0) {
      params.zdepth = 0;
    }

    changeLayerVis (params.zdepth, false);
    //console.log("In button clicked, new zdepth " + params.zdepth);
    return false;
  };

  document.getElementById('dissect_out_button').onclick = function() {
    // put back next layer
    changeLayerVis (params.zdepth, true);

    params.zdepth += 1;
    if (params.zdepth > tree.zmax) {
      params.zdepth = tree.zmax;
    }

    //console.log("Out button clicked, new zdepth " + params.zdepth);
    return false;
  };

  // Show or hide equipotential
  var potmeshes = [];
  var equipot = document.getElementById('equipot_input');
  equipot.onchange = function() {
    //console.log("Click: " + this.checked);
    params.equipot = this.checked;

    var voltages = ["#000", "#111", "#222", "#333", "#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#ccc", "#ddd", "#eee", "#fff"];

    if (this.checked)
    {
      for (var i = 1; i < tree.xmax; ++i) // start from 1
      {
        for (var j = 1; j < tree.ymax; ++j) // start from 1
        {
          // Scale the Vu_app value into an integer equivalent
          var Vint = Math.floor(100*Math.abs(tree.points[i][j].Vu_app));
          var color = voltages[Math.min(voltages.length - 1, Vint)];
          //console.log("Vint = " + Vint + ", voltages[Vint] = " + color);

          var label = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.1),
                                     new THREE.MeshLambertMaterial({color: color, transparent: true, opacity: 0.75}));
          label.position.set(i, j, 0);
          scene.add(label);
          potmeshes.push(label);
        }
      }
    }
    else
    {
      potmeshes.forEach(function(p) {
        scene.remove(p);
      });
      potmeshes = [];
    }
  };
  equipot.dispatchEvent(new Event('change'));

  /* Initialise voltage plot */
  var Vplot = initPlot();

  var registerRenderTick = function() {
    /* 1/60th of a second */
    var data = modelTick(tree);

    updatePlot(data, Vplot);
  };

  /* Render loop */
  var render = function() {
    requestAnimationFrame(render);

    if (params.camType === 'rotate') {
      // rotate the camera around in a circle
      var radstep = params.astep * Math.PI/180;

      params.alpha = (params.alpha+radstep) % (2*Math.PI);
      camera.position.x = params.camRad * Math.sin(params.alpha) + centrex; 
      camera.position.z = params.camRad * Math.cos(params.alpha) + centrez; 
    }

    //console.log("Camera is at [" + camera.position.x + ", " + camera.position.y + ", " + camera.position.z + "], with radius " + params.camRad);
    camera.lookAt(new THREE.Vector3(centrex, centrey, centrez)); // the centre

    registerRenderTick();

    renderer.render(scene, camera);
  };

  render();
}());

