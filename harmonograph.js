import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'dat.gui';

// Set up the scene, cameras, and renderer
const scene = new THREE.Scene();
const cameraFront = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraFront.position.set(0, 0, 10);
cameraFront.lookAt(scene.position);

const cameraTop = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraTop.position.set(0, 10, 0);
cameraTop.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Brighter light from the top
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// Harmonograph trajectory parameters
const params = {
    Ax: 2, As: 2, Ay: 2, Az: 2, // Amplitudes
    ωx: 2, ωs: 2, ωy: 1.5, ωz: 1.5, // Frequencies
    px: 0, ps: Math.PI / 2, py: Math.PI / 4, pz: Math.PI / 4, // Phase offsets
    dampingAx: 0.999, dampingAs: 0.998, dampingAy: 0.997, dampingAz: 0.996 // Damping factors
};

// Placeholder for the 3D model
let model;

// Load the model
const loader = new GLTFLoader();
loader.load('Airplane.glb', function(gltf) {
    model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5); // Adjust model scale
    model.position.set(0, 0, 0); // Center the model
    scene.add(model);
}, undefined, function(error) {
    console.error('An error happened while loading the model:', error);
});

// Animation parameters
let t = 0; // Time variable for animation

// Update model's position using harmonograph equations
function updateModelPosition(time) {
    if (!model) return; // Skip if the model hasn't loaded yet

    const x = params.Ax * Math.sin(params.ωx * time + params.px) + params.As * Math.sin(params.ωs * time + params.ps);
    const y = params.Ay * Math.sin(params.ωy * time + params.py);
    const z = params.Az * Math.sin(params.ωz * time + params.pz);

    model.position.set(x, y, z);

    // Apply damping to parameters
    params.Ax *= params.dampingAx;
    params.As *= params.dampingAs;
    params.Ay *= params.dampingAy;
    params.Az *= params.dampingAz;
}

// Set up two viewports
const frontViewport = {
    left: 0,
    bottom: 0,
    width: window.innerWidth / 2,
    height: window.innerHeight,
};
const topViewport = {
    left: window.innerWidth / 2,
    bottom: 0,
    width: window.innerWidth / 2,
    height: window.innerHeight,
};

// Render loop
function animate(time) {
    requestAnimationFrame(animate);
    t = time * 0.001; // Convert time from milliseconds to seconds
    updateModelPosition(t); // Update model position based on harmonograph equations

    // Render front viewport
    renderer.setClearColor(0x009999); // Teal color background
    renderer.setViewport(frontViewport.left, frontViewport.bottom, frontViewport.width, frontViewport.height);
    renderer.setScissor(frontViewport.left, frontViewport.bottom, frontViewport.width, frontViewport.height);
    renderer.setScissorTest(true);
    renderer.render(scene, cameraFront);

    // Render top viewport
    renderer.setClearColor(0x990099); // Purple color background
    renderer.setViewport(topViewport.left, topViewport.bottom, topViewport.width, topViewport.height);
    renderer.setScissor(topViewport.left, topViewport.bottom, topViewport.width, topViewport.height);
    renderer.setScissorTest(true);
    renderer.render(scene, cameraTop);
}

// User controls for phase offsets and damping
const gui = new dat.GUI();
gui.add(params, 'px', 0, 2 * Math.PI).name('Phase Offset px');
gui.add(params, 'ps', 0, 2 * Math.PI).name('Phase Offset ps');
gui.add(params, 'py', 0, 2 * Math.PI).name('Phase Offset py');
gui.add(params, 'pz', 0, 2 * Math.PI).name('Phase Offset pz');
gui.add(params, 'dampingAx', 0.95, 0.999).name('Damping Ax');
gui.add(params, 'dampingAs', 0.95, 0.999).name('Damping As');
gui.add(params, 'dampingAy', 0.95, 0.999).name('Damping Ay');
gui.add(params, 'dampingAz', 0.95, 0.999).name('Damping Az');
gui.add({ reset: function() {
    // Reset animation and parameters to default
    Object.assign(params, {
        Ax: 2, As: 2, Ay: 2, Az: 2,
        px: 0, ps: Math.PI / 2, py: Math.PI / 4, pz: Math.PI / 4,
        dampingAx: 0.999, dampingAs: 0.998, dampingAy: 0.997, dampingAz: 0.996
    });
    t = 0; // Reset time
    if (model) {
        model.position.set(0, 0, 0); // Reset model position
    }
}}, 'reset').name('Reset Animation');

animate(0); // Start the animation loop
