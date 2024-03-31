import * as THREE from 'three';

// Set up scene, cameras, renderer
const scene = new THREE.Scene();
const cameraFront = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraTop = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create sphere geometry with a more advanced material
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 }); // Shaded material for 3D effect
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0); // coming from the top
scene.add(ambientLight);
scene.add(directionalLight);

// Initial animation parameters
let t = 0; // Time variable for animation

// Parameters for the harmonograph trajectory
const params = {
    Ax: 2, As: 2, Ay: 2, Az: 2,
    ωx: 2, ωs: 2, ωy: 1.5, ωz: 1.5,
    px: 0, ps: Math.PI / 2, py: Math.PI / 4, pz: Math.PI / 4,
    dampingAx: 0.999, dampingAs: 0.998, dampingAy: 0.997, dampingAz: 0.996
};

function updateSpherePosition(time) {
    const x = params.Ax * Math.sin(params.ωx * time + params.px) + params.As * Math.sin(params.ωs * time + params.ps);
    const y = params.Ay * Math.sin(params.ωy * time + params.py);
    const z = params.Az * Math.sin(params.ωz * time + params.pz);
    sphere.position.set(x, y, z);

    // Apply damping
    params.Ax *= params.dampingAx;
    params.As *= params.dampingAs;
    params.Ay *= params.dampingAy;
    params.Az *= params.dampingAz;
}

// GUI for controlling parameters
const gui = new dat.GUI();
gui.add(params, 'px', 0, 2 * Math.PI).name('Phase Offset px');
gui.add(params, 'ps', 0, 2 * Math.PI).name('Phase Offset ps');
gui.add(params, 'py', 0, 2 * Math.PI).name('Phase Offset py');
gui.add(params, 'pz', 0, 2 * Math.PI).name('Phase Offset pz');
gui.add(params, 'dampingAx', 0.95, 0.999).name('Damping Ax');
gui.add(params, 'dampingAs', 0.95, 0.999).name('Damping As');
gui.add(params, 'dampingAy', 0.95, 0.999).name('Damping Ay');
gui.add(params, 'dampingAz', 0.95, 0.999).name('Damping Az');
gui.add({reset: () => reset()}, 'reset').name('Reset Animation');

function reset() {
    // Reset parameters
    params.Ax = 2; params.As = 2; params.Ay = 2; params.Az = 2;
    params.px = 0; params.ps = Math.PI / 2; params.py = Math.PI / 4; params.pz = Math.PI / 4;
    params.dampingAx = 0.999; params.dampingAs = 0.998; params.dampingAy = 0.997; params.dampingAz = 0.996;
    t = 0; // Reset time
    // Clear the screen by removing and re-adding the sphere to the scene
    scene.remove(sphere);
    sphere.position.set(0, 0, 0); // Reset position
    scene.add(sphere);
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

    // Convert time from milliseconds to seconds for smoother animation
    t = time * 0.001; // Adjust time scale if necessary
    updateSpherePosition(t);

    // Render front viewport with a specific background color
    renderer.setClearColor(0x009999); // Teal color
    renderer.setViewport(frontViewport.left, frontViewport.bottom, frontViewport.width, frontViewport.height);
    renderer.setScissor(frontViewport.left, frontViewport.bottom, frontViewport.width, frontViewport.height);
    renderer.setScissorTest(true);
    renderer.render(scene, cameraFront);

    // Render top viewport with a different background color
    renderer.setClearColor(0x990099); // Purple color
    renderer.setViewport(topViewport.left, topViewport.bottom, topViewport.width, topViewport.height);
    renderer.setScissor(topViewport.left, topViewport.bottom, topViewport.width, topViewport.height);
    renderer.setScissorTest(true);
    renderer.render(scene, cameraTop);
}

// Initialize animation and set camera positions
animate(0);
cameraFront.position.set(0, 0, 10);
cameraFront.lookAt(sphere.position); // Ensure the camera is always looking at the sphere

cameraTop.position.set(0, 10, 0);
cameraTop.lookAt(sphere.position); // Ensure the camera is always looking at the sphere
