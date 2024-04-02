import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer, controls;
let snowParticles;
let lastTime = 0;

function Grad(x, y, z) {
    this.x = x; this.y = y; this.z = z;
}

Grad.prototype.dot2 = function(x, y) {
    return this.x * x + this.y * y;
};

class Perlin {
    constructor() {
        
        this.grad3 = [
            new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
            new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
            new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)
        ];
        this.p = [151,160,137,91,90,15,
            131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
            190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
            88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
            77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
            102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
            135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
            5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
            223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
            129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
            251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
            49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
            138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
        this.perm = new Array(512);
        this.gradP = new Array(512);
        this.seed(0);
    }

    seed(seed) {
        if (seed > 0 && seed < 1) {
            // Scale the seed out
            seed *= 65536;
        }

        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }

        for (let i = 0; i < 256; i++) {
            let v;
            if (i & 1) {
                v = this.p[i] ^ (seed & 255);
            } else {
                v = this.p[i] ^ ((seed >> 8) & 255);
            }

            this.perm[i] = this.perm[i + 256] = v;
            this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
        }
    }

    simplex2(xin, yin) {
        let n0, n1, n2;
        let s = (xin + yin) * this.F2;
        let i = Math.floor(xin + s);
        let j = Math.floor(yin + s);
        let t = (i + j) * this.G2;
        let x0 = xin - i + t;
        let y0 = yin - j + t;
        let i1, j1;
        if (x0 > y0) {
            i1 = 1; j1 = 0;
        } else {
            i1 = 0; j1 = 1;
        }
        let x1 = x0 - i1 + this.G2;
        let y1 = y0 - j1 + this.G2;
        let x2 = x0 - 1 + 2 * this.G2;
        let y2 = y0 - 1 + 2 * this.G2;

        i &= 255;
        j &= 255;
        let gi0 = this.gradP[i + this.perm[j]];
        let gi1 = this.gradP[i + i1 + this.perm[j + j1]];
        let gi2 = this.gradP[i + 1 + this.perm[j + 1]];

        let t0 = 0.5 - x0*x0 - y0*y0;
        if (t0 >= 0) {
            t0 *= t0;
            n0 = t0 * t0 * this.dot2(gi0, x0, y0);
        } else {
            n0 = 0;
        }

        let t1 = 0.5 - x1*x1 - y1*y1;
        if (t1 >= 0) {
            t1 *= t1;
            n1 = t1 * t1 * this.dot2(gi1, x1, y1);
        } else {
            n1 = 0;
        }

        let t2 = 0.5 - x2*x2 - y2*y2;
        if (t2 >= 0) {
            t2 *= t2;
            n2 = t2 * t2 * this.dot2(gi2, x2, y2);
        } else {
            n2 = 0;
        }

        return 70 * (n0 + n1 + n2);
    }
}

const perlin = new Perlin();
//const noiseValue = perlin.simplex2(x, y); // where x and y are the input values






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
        uniforms: {
            time: { value: 0.0 }
        }});

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

    function animate() {
        requestAnimationFrame(animate);
        ballMaterial.uniforms.time.value += 0.01;
        renderer.render(scene, camera);
    }

    animate();
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