import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer, controls;
let snowParticles;
let lastTime = 0;

// 定义控制参数
var userControls = {
    noiseStrength: 0.2,
    colorVariation: 0.5
};

// 创建uniforms对象，以便将参数传递给shader
var uniforms = {
    time: { value: 1.0 },
    noiseStrength: { value: userControls.noiseStrength },
    colorVariation: { value: userControls.colorVariation },
    // 你可能还需要其他uniforms，例如纹理等
};



function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(1.5, 4, 9);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6eedc);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    loader.load('low_poly_winter_scene.glb', function (gltf) {
        const model = gltf.scene;
        model.scale.set(0.3, 0.3, 0.3);
        model.position.set(0, 1.5, 0);
        scene.add(model);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.update();

    var gui = new dat.GUI();

    gui.add(userControls, 'noiseStrength', 0, 1).name('Noise Strength').onChange(function (value) {
        uniforms.noiseStrength.value = value;
    });
    gui.add(userControls, 'colorVariation', 0, 1).name('Color Variation').onChange(function (value) {
        uniforms.colorVariation.value = value;
    });

    addSnowEffect();
    addBall();
    
    window.addEventListener('resize', onWindowResize, false);
    
    animate(0); // Start the animation loop
}
function addBall() {

    // 创建球体几何体
    const geometry1 = new THREE.SphereGeometry(0.1, 32, 32);
    const geometry2 = new THREE.SphereGeometry(0.15, 32, 32);
    const geometry3 = new THREE.SphereGeometry(0.2, 32, 32);
    const geometry4 = new THREE.SphereGeometry(0.25, 32, 32);
    const geometry5 = new THREE.SphereGeometry(0.3, 32, 32);
    

    const vertexShader = document.getElementById("vertexShader").textContent;
    const fragmentShader = document.getElementById("fragmentShader").textContent;

    const ballMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms});

    const ball1 = new THREE.Mesh(geometry1, ballMaterial);
    const ball2 = new THREE.Mesh(geometry2, ballMaterial);
    const ball3 = new THREE.Mesh(geometry3, ballMaterial);
    const ball4 = new THREE.Mesh(geometry4, ballMaterial);
    const ball5 = new THREE.Mesh(geometry5, ballMaterial);
    const ball6 = new THREE.Mesh(geometry5, ballMaterial);
    
    ball2.scale.set(0.9, 0.9, 0.7);
    ball3.scale.set(1, 1, 0.9);
    ball4.scale.set(1.2, 1, 1);
    ball5.scale.set(1.2, 1, 1);
    ball6.scale.set(2, 1, 1);
    
    // 设置球体的位置
    ball1.position.set(0.02, 3.9, -2.1);
    ball2.position.set(0.06, 4.1, -2.1);
    ball3.position.set(0.2, 4.3, -2.2);
    ball4.position.set(0.17, 4.4, -2.3);
    ball5.position.set(0.47, 4.6, -2.35);
    ball6.position.set(0.5, 4.7, -2.35);

    // 将球体添加到场景中
    scene.add(ball1);
    scene.add(ball2);
    scene.add(ball3);
    scene.add(ball4);
    scene.add(ball5);
    scene.add(ball6);

    function animateBall() {
        requestAnimationFrame(animateBall);
        ballMaterial.uniforms.time.value += 0.01;
        renderer.render(scene, camera);
    }

    animateBall();
}


function addSnowEffect() {
    const particleCount = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 0] = Math.random() * 100 - 50;
        positions[i * 3 + 1] = Math.random() * 50 + 25;
        positions[i * 3 + 2] = Math.random() * 100 - 50;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.2,
        transparent: true
    });

    snowParticles = new THREE.Points(geometry, material);
    scene.add(snowParticles);

    
}

function animateSnow(deltaTime) {
    const positions = snowParticles.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= deltaTime * 5;

        if (positions[i] < -10) {
            positions[i] += 60; // Ensure snowflakes reappear above the scene
            positions[i] = Math.random() * 40 - 20; // 随机X轴位置
            positions[i + 2] = Math.random() * 40 - 20; // 随机Z轴位置
        
        }
    }
    snowParticles.geometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    requestAnimationFrame(animate);

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    animateSnow(deltaTime);
    
    renderer.render(scene, camera);
}

init();