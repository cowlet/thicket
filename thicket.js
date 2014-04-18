(function ()
{
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  var geometry = new THREE.CubeGeometry(1,1,1);
  //var material = new THREE.MeshLambertMaterial({color: 0x00ff00});
  var material = new THREE.MeshLambertMaterial({color: 0x00ff00, transparent: true, opacity: 0.1});

  var n = 10;

  for (i = 0; i < n; ++i)
  {
    for (j = 0; j < n; ++j)
    {
      for (k = 0; k < n; ++k)
      {
        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(i, j, k);
        scene.add(cube);
      }
    }
  }

/*  var pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);
*/
  var ambLight = new THREE.AmbientLight(0x404040);
  ambLight.position.set(-5, 5, 0);
  scene.add(ambLight);

  var dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(1, 0, 1); // from the front right
  scene.add(dirLight);


  var free = false; // default to auto camera

  var r = 15;
  var alpha = 0;
  var astep = 2 * Math.PI/180; // 2 degrees in rads
  camera.position.set(n/2, n/2, n/2+r);

  var guiParams =
  {
    freeCam: false
  };

  var gui = new DAT.GUI();
  var freeCam = gui.add(guiParams, "freeCam").name("Free camera?").listen();
  freeCam.onChange(function(value) {
    free = value;
    if (free)
    {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
    }
  });

  var render = function () {
    requestAnimationFrame(render);

    if (! free)
    {
      // rotate the camera around in a circle
      alpha = (alpha+astep) % (2*Math.PI);
      camera.position.x = r * Math.sin(alpha) + n/2;
      camera.position.z = r * Math.cos(alpha) + n/2;
      camera.lookAt(new THREE.Vector3 (n/2, n/2, n/2)); // the centre
    }

    renderer.render(scene, camera);
  };

  render();
}());

