// ------------------------
// Scene Setup
// ------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e14);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 6, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ------------------------
// Lights
// ------------------------
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(5, 10, 6);
scene.add(light);

// ------------------------
// Pitch
// ------------------------
const pitch = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 22),
  new THREE.MeshStandardMaterial({ color: 0x6c8b3c })
);
pitch.rotation.x = -Math.PI / 2;
scene.add(pitch);

// Helpers
scene.add(new THREE.GridHelper(30, 30, 0x444444, 0x222222));
scene.add(new THREE.AxesHelper(5));

// ------------------------
// Ball
// ------------------------
const BALL_RADIUS = 0.11;
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xb22222 })
);
scene.add(ball);

// ------------------------
// Controls
// ------------------------
const params = {
  speed: 130,
  swing: 0.5,
  seamAngle: 15,
  line: 0,
  length: 18,
  reset: simulate
};

const gui = new dat.GUI();
gui.add(params, "speed", 80, 160).name("Speed (km/h)");
gui.add(params, "swing", -1, 1, 0.01).name("Swing");
gui.add(params, "seamAngle", 0, 30).name("Seam Angle");
gui.add(params, "line", -1, 1, 0.01).name("Line");
gui.add(params, "length", 10, 22).name("Length");
gui.add(params, "reset").name("Bowl");

// ------------------------
// Physics Variables
// ------------------------
let velocity = new THREE.Vector3();
let trajectory = [];
let trajectoryLine;

// ------------------------
// Simulation
// ------------------------
function simulate() {
  if (trajectoryLine) scene.remove(trajectoryLine);
  trajectory = [];

  ball.position.set(params.line, 2.1, 0);

  const speedMS = params.speed / 3.6;
  velocity.set(0, 0, -speedMS);

  runSimulation();
}

function runSimulation() {
  const dt = 0.016;

  function step() {
    if (ball.position.y <= BALL_RADIUS || ball.position.z <= -params.length) {
      drawTrajectory();
      return;
    }

    const gravity = new THREE.Vector3(0, -9.81, 0);

    const swingForceMagnitude =
      params.swing *
      Math.sin(THREE.MathUtils.degToRad(params.seamAngle)) *
      velocity.lengthSq() *
      0.00004;

    const swingForce = new THREE.Vector3(swingForceMagnitude, 0, 0);

    velocity.add(gravity.multiplyScalar(dt));
    velocity.add(swingForce.multiplyScalar(dt));

    ball.position.add(velocity.clone().multiplyScalar(dt));
    trajectory.push(ball.position.clone());

    requestAnimationFrame(step);
  }

  step();
}

function drawTrajectory() {
  const geometry = new THREE.BufferGeometry().setFromPoints(trajectory);
  const material = new THREE.LineBasicMaterial({ color: 0x00e5ff });
  trajectoryLine = new THREE.Line(geometry, material);
  scene.add(trajectoryLine);
}

// ------------------------
// Render Loop
// ------------------------
function animate() {
  requestAnimationFrame(animate);
  camera.lookAt(ball.position);
  renderer.render(scene, camera);
}
animate();

// ------------------------
// Resize
// ------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
simulate();
