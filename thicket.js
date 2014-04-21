(function ()
{
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  /* Setup for cube grid */
  var geometry = new THREE.CubeGeometry(1, 1, 1);
  var healthy = new THREE.MeshLambertMaterial({color: 0x00ff00, transparent: true, opacity: 0.1});
  var damaged = new THREE.MeshLambertMaterial({color: 0xff0000, transparent: true, opacity: 0.9});

  var n = 10;
  var cubes = new Array();

  for (i = 0; i < n; ++i) 
  {
    cubes[i] = new Array();
    for (j = 0; j < n; ++j)
    {
      cubes[i][j] = new Array();
      for (k = 0; k < n; ++k)
      {
        var cube = new THREE.Mesh(geometry, healthy);
        cube.position.set(i, j, k);
        scene.add(cube);
        cubes[i][j][k] = cube;
      }
    }
  }

  /* Lighting */
  var ambLight = new THREE.AmbientLight(0x404040);
  ambLight.position.set(-5, 5, 0);
  scene.add(ambLight);

  var dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(-1, 1, 1); // from the front top left
  scene.add(dirLight);

  /* Setup and link gui to camera params */ 
  var params =
  {
    camType: 'rotate', // can be rotate, free, or dissect
    camRad: 15, // radius of camera from centre
    alpha: 0, // initial angle of camera
    astep: 2, // angle step in degrees
    zdepth: n, // number of z layers to show
  };
  camera.position.set(n/2, n/2, n/2+params.camRad);

  document.getElementById('astep_input').onchange = function() {
    params.astep = +this.value;
  };

  document.getElementById('change_button').onclick = function() {
    cubes[5][5][5].material = damaged;
  }

  var toggleDissectControls = function(camType) {
    var controls = document.getElementById('dissect_controls');

    if (camType === 'dissect') {
      controls.classList.remove('hidden');
    }
    else {
      controls.classList.add('hidden');
    }
  };

  document.getElementById('camera_select').onchange = function() {
    params.camType = this.value;
    toggleDissectControls(params.camType);

    if (params.camType === 'free') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
    }
    else if (params.camType === 'dissect') {
      // manual camera position was [15, 10.8, 11.4]
      camera.position.set(-5, 11, 11);
      camera.lookAt(new THREE.Vector3 (n/2, n/2, n/2)); // the centre
      params.camRad = 16;
      controls = null; // disable mouse control
    }
    else if (params.camType === 'rotate') {
      // from current position, work out new radius
      var curx = camera.position.x - n/2;
      var curz = camera.position.z - n/2;

      params.camRad = Math.sqrt(curx*curx + curz*curz);
      console.log("New r is " + params.camRad + " based on x " + camera.position.x + ", z " + camera.position.z);
    }
  };

  /* Dissection controls */
  var changeLayerVis = function (z, visible) {
    for (i = 0; i < n; ++i) {
      for (j = 0; j < n; ++j) {
        cubes[i][j][z].visible = visible;
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
    if (params.zdepth > n) {
      params.zdepth = n;
    }

    //console.log("Out button clicked, new zdepth " + params.zdepth);
    return false;
  };


  /* Render loop */
  var render = function () {
    requestAnimationFrame(render);

    if (params.camType === 'rotate') {
      // rotate the camera around in a circle
      var radstep = params.astep * Math.PI/180;

      params.alpha = (params.alpha+radstep) % (2*Math.PI);
      camera.position.x = params.camRad * Math.sin(params.alpha) + n/2;
      camera.position.z = params.camRad * Math.cos(params.alpha) + n/2;
      camera.lookAt(new THREE.Vector3 (n/2, n/2, n/2)); // the centre
    }

    //console.log("Camera is at [" + camera.position.x + ", " + camera.position.y + ", " + camera.position.z + "], with radius " + params.camRad);

    renderer.render(scene, camera);
  };

  render();
}());

