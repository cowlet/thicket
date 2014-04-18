(function ()
{
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

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


  var ambLight = new THREE.AmbientLight(0x404040);
  ambLight.position.set(-5, 5, 0);
  scene.add(ambLight);

  var dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(1, 1, 1); // from the front top right
  scene.add(dirLight);


  var params =
  {
    freeCam: false, // default to auto camera
    camRad: 15,
    alpha: 0, // initial angle of camera
    astep: 2, // angle step in degrees
    change: function () { cubes[5][5][5].material = damaged; },
  };
  camera.position.set(n/2, n/2, n/2+params.camRad);

  var gui = new dat.gui.GUI();
  var freeCam = gui.add(params, "freeCam").name("Free camera?").listen();
  freeCam.onChange(function(value) {
    if (params.freeCam)
    {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
    }
    else
    {
      // from current position, work out new radius
      var curx = camera.position.x - n/2;
      var curz = camera.position.z - n/2;

      params.camRad = Math.sqrt(curx*curx + curz*curz);
      console.log("New r is " + params.camRad + " based on x " + camera.position.x + ", z " + camera.position.z);
    }
  });

  var alphaStep = gui.add(params, "astep").name("Speed of rotation").min(1).max(20);

  var changeCol = gui.add(params, "change").name("Change a cube colour");


  var render = function () {
    requestAnimationFrame(render);

    if (! params.freeCam)
    {
      // rotate the camera around in a circle
      var radstep = params.astep * Math.PI/180;

      params.alpha = (params.alpha+radstep) % (2*Math.PI);
      camera.position.x = params.camRad * Math.sin(params.alpha) + n/2;
      camera.position.z = params.camRad * Math.cos(params.alpha) + n/2;
      camera.lookAt(new THREE.Vector3 (n/2, n/2, n/2)); // the centre
    }

    renderer.render(scene, camera);
  };

  render();
}());

