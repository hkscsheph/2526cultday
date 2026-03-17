// --- 1. Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshNormalMaterial(); // Colors based on face orientation
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

// --- 2. MediaPipe Hand Tracking Setup ---
const videoElement = document.getElementById('video-input');

function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    // Use the index finger tip (landmark 8) to rotate the cube
    // Mapping 0.0-1.0 screen coordinates to rotation radians
    const fingerX = landmarks[8].x;
    const fingerY = landmarks[8].y;

    cube.rotation.y = (fingerX - 0.5) * Math.PI * 2;
    cube.rotation.x = (fingerY - 0.5) * Math.PI * 2;
  }
  renderer.render(scene, camera);
}

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults(onResults);

// --- 3. Camera Start ---
const cameraPipe = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
cameraPipe.start();
