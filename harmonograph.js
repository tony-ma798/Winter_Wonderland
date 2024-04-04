import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import * as Ammo from 'ammo.js';

let camera, scene, renderer;
let snowParticles;
let lastTime = 0;
var spotlightPosition1 = 2;
var spotlightPosition2 = 4.5;
var spotlightPosition3 = 0;
let bunny;
let frontLegs, rearLegs, leftEar, rightEar;
let animationControls = {
    animateBunny: true
};
const legControls = {
    legRotation: 0 // Initial rotation value; adjust as needed
};

const earControls = {
    earRotation: 0
};

let orbitControls, firstPersonControls;
let controlEnabled = { firstPerson: false }; // Initial state uses OrbitControls
let movePhase = false; // Whether it's in the moving phase
let rotatePhase = true; // Rotation is performed first at the beginning
let moveDistance = 0; // Current moving distance
const moveSpeed = 1; // Moving speed
let direction = 1; // Moving direction, 1 for forward, -1 for backward
let targetRotation = 0;
let giftBoxes = []; // Stores all gift boxes

// Define control parameters
var userControls = {
    noiseStrength: 0.1,
    colorVariation: 0.5
};

// Create uniforms object to pass parameters to the shader
var uniforms = {
    time: { value: 1.0 },
    noiseStrength: { value: userControls.noiseStrength },
    colorVariation: { value: userControls.colorVariation },
    // You may need other uniforms as well, such as textures
};




function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(1.5, 4, 12);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6eedc);

    const ambientLight = new THREE.AmbientLight(0x404040, 15);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(0, 2, 0);
    scene.add(directionalLight);

    
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, 0); // set target
    scene.add(targetObject);
    const spotlight = new THREE.SpotLight(0xffffff, 12); // color and strength
    spotlight.position.set(spotlightPosition1, spotlightPosition2, spotlightPosition3); // postion
    spotlight.angle = Math.PI / 2; // angle
    spotlight.penumbra = 0.1; // soft
    spotlight.decay = 2; // decay
    spotlight.distance = 200; // distance
    spotlight.target = targetObject;
    scene.add(spotlight);

    //2nd spotlight
    const spotlight2 = new THREE.SpotLight(0xffffff, 14); // color and strength
    spotlight2.position.set(6, 7, 0); // postion
    spotlight2.angle = Math.PI / 4; // angle
    spotlight2.penumbra = 0.1; // soft
    spotlight2.decay = 2; // decay
    spotlight2.distance = 200; // distance
    scene.add(spotlight2);
    
    //Street pointLight
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100); // color, strength, distance
    pointLight.position.set(3, 1.5, 6); // postion
    scene.add(pointLight);


    //Tree spotlight
    const spotlight3 = new THREE.SpotLight(0xffffff, 18); // color and strength
    spotlight3.position.set(-13, 4, 8); // postion
    spotlight3.angle = Math.PI / 4; // angle
    spotlight3.penumbra = 0.4; // soft
    spotlight3.decay = 2; // decay
    spotlight3.distance = 100; // distance
    scene.add(spotlight3);


    initPhysics(); 
    createGround(2, 3, 0.9, 0.1, 0.1, 0.1);
    createGround(-2.1, 3, 0.9, 0.1, 0.1, 0.1);
    createGround(-0.4, 2.5, -1, 0.6, 1, 0.7);
    createGround(0, 0.9, 0, 10, 0.5, 2.5);
    createGround(0, -0.1, 5, 10, 0.5, 3);
    createGround(0, -0.1, -6, 10, 0.5, 3);

    // add all models
    const loader = new GLTFLoader();
    loader.load('low_poly_winter_scene.glb', function (gltf) {
        const model1 = gltf.scene;
        model1.scale.set(0.3, 0.3, 0.3);
        model1.position.set(0, 1.5, 0);
        scene.add(model1);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('snow_mountain.glb', function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(0.15, 0.15, 0.15);
        model2.position.set(4, 1, -1.5);
        scene.add(model2);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('low_poly_snow_island.glb', function (gltf) {
        const model3 = gltf.scene;
        model3.scale.set(0.8, 0.8, 0.8);
        model3.position.set(-0.4, 1, -1.5);
        scene.add(model3);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('low_poly_mountain.glb', function (gltf) {
        const model4 = gltf.scene;
        model4.scale.set(0.02, 0.03, 0.02);
        model4.position.set(-5.6, 1.1, -2.5);
        scene.add(model4);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('low-poly_snow_tree.glb', function (gltf) {
        const model6 = gltf.scene;
        model6.scale.set(2, 3, 2);
        model6.position.set(5, 1.5, 2);
        scene.add(model6);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('tree_set.glb', function (gltf) {
        const model7 = gltf.scene;
        model7.scale.set(0.01, 0.01, 0.01);
        model7.position.set(22, 0, 27);
        scene.add(model7);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('fence_low.glb', function (gltf) {
        const model8 = gltf.scene;
        model8.scale.set(0.2, 0.2, 0.2);
        model8.position.set(0.2, 0, 5.5);
        scene.add(model8);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('road_light.glb', function (gltf) {
        const model9 = gltf.scene;
        model9.scale.set(0.5, 0.5, 0.5);
        model9.position.set(3, 0, 6);
        scene.add(model9);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('christmas_lights.glb', function (gltf) {
        const model10 = gltf.scene;
        model10.scale.set(2, 1.8, 2);
        model10.position.set(13, 6, 1);
        model10.rotation.y = Math.PI / 2;
        scene.add(model10);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('christmas_lights_ring.glb', function (gltf) {
        const model10 = gltf.scene;
        model10.scale.set(28, 12, 28);
        model10.position.set(1.6, -0.1, 1);
        model10.rotation.y = Math.PI / 2;
        scene.add(model10);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('christmas_tree.glb', function (gltf) {
        const model10 = gltf.scene;
        model10.scale.set(0.15, 0.2, 0.15);
        model10.position.set(-7, 0, 5);
        model10.rotation.y = Math.PI / 2;
        scene.add(model10);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //init OrbitControls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0, 2, 0);
    

    //init FirstPersonControls
    firstPersonControls = new FirstPersonControls(camera, renderer.domElement);
    firstPersonControls.movementSpeed = 2;
    firstPersonControls.lookSpeed = 0.03;
    firstPersonControls.enabled = false; 

    var gui = new dat.GUI();

    gui.add(controlEnabled, 'firstPerson').name('Enable Fly-through').onChange(updateControls);

    gui.add(userControls, 'noiseStrength', 0, 1).name('Noise Strength').onChange(function (value) {
        uniforms.noiseStrength.value = value;
    });
    gui.add(userControls, 'colorVariation', 0, 1).name('Color Variation').onChange(function (value) {
        uniforms.colorVariation.value = value;
    });
    gui.add(animationControls, 'animateBunny').name('Animate Bunny');
    gui.add(legControls, 'legRotation', -1, 1).name('All Legs').onChange((value) => {
        // Apply the rotation value to both front and rear legs
        frontLegs.rotation.z = value;
        rearLegs.rotation.z = value;
    });
    gui.add(earControls, 'earRotation', -1, 1).name('Ear').onChange((value) => {
        // Apply the rotation value to both front and rear legs
        leftEar.rotation.x = value;
        rightEar.rotation.x = -value;
    });
    // Add button control, drop new giftbox
    gui.add({ dropGiftBox: function() {
        // adjust the position and size parameters as needed
        createBox(1, {x: Math.random() * 4 - 2, y: 10, z: Math.random() * 4 - 2}, {x: 0.05, y: 0.05, z: 0.05});
    } }, 'dropGiftBox').name('Drop Gift Box');
    gui.add({ClearGiftBoxes: removeGiftBoxes}, 'ClearGiftBoxes').name('Clear Gift Boxes');

    createBunny();
    addSnowEffect();
    addBall();
    
    window.addEventListener('resize', onWindowResize, false);
    
    animate(0); // Start the animation loop
}


let physicsWorld;
let rigidBodies = [];

function initPhysics() {
    // physics set
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
}

function createGround(x, y, z, a, b, c) {

    // ground physics
    const groundShape = new Ammo.btBoxShape(new Ammo.btVector3(a, b, c)); 
    const groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(x, y, z)); 

    const groundMass = 0; // mass 0
    const localInertia = new Ammo.btVector3(0, 0, 0);
    const motionState = new Ammo.btDefaultMotionState(groundTransform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, motionState, groundShape, localInertia);
    const groundBody = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(groundBody);
}


function createBox(mass, position, scale) {
    const loader = new GLTFLoader();
    loader.load('gift_box.glb', function(gltf) {
        const model = gltf.scene;
        model.traverse(function(child) {
            if (child.isMesh) {
                // positions and scale
                child.position.set(position.x, position.y, position.z);
                child.scale.set(scale.x, scale.y, scale.z);
                scene.add(child);

                // physics
                const shape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 8, scale.y * 8, scale.z * 3.5)); // box
                const transform = new Ammo.btTransform();
                transform.setIdentity();
                
                transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
                const localInertia = new Ammo.btVector3(0, 0, 0);
                if (mass > 0) shape.calculateLocalInertia(mass, localInertia);

                const motionState = new Ammo.btDefaultMotionState(transform);
                const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
                const body = new Ammo.btRigidBody(rbInfo);

                physicsWorld.addRigidBody(body);
                child.userData.physicsBody = body;
                rigidBodies.push(child);
                giftBoxes.push(child);
            }
        });
    }, undefined, function(error) {
        console.error('An error happened while loading the model:', error);
    });
}

function removeGiftBoxes() {
    giftBoxes.forEach(box => {
        scene.remove(box); // remove 
        const physicsBody = box.userData.physicsBody;
        if (physicsBody) {
            physicsWorld.removeRigidBody(physicsBody); // remove 
        }
    });
    giftBoxes = []; // reset array
}


function updatePhysics(deltaTime) {
    if (!physicsWorld) {
        console.warn("Physics world is not initialized yet.");
        return;
    }
    physicsWorld.stepSimulation(deltaTime, 10);
    let tmpTrans = new Ammo.btTransform();
    for (let i = 0; i < rigidBodies.length; i++) {
        const objThree = rigidBodies[i];
        const objPhys = objThree.userData.physicsBody;
        const ms = objPhys.getMotionState();
        if (ms) {
            ms.getWorldTransform(tmpTrans);
            const p = tmpTrans.getOrigin();
            const q = tmpTrans.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
    }
}


function updateControls(value) {
    // choose different control
    if (value) {
        orbitControls.enabled = false;
        firstPersonControls.enabled = true;
    } else {
        orbitControls.enabled = true;
        firstPersonControls.enabled = false;
    }
}

function createBunny() {
    // Bunny Group
    bunny = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(5, 5, 20, 32);
    const bodyMaterial = new THREE.MeshMatcapMaterial({ color: 0xD147BD  });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2; // Lay the cylinder horizontally
    bunny.add(body);
    

    // Tail
    const tailGeometry = new THREE.SphereGeometry(3, 32, 32);
    const tailMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // same color as the body
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-10, 0, 0); // Adjust position to be at the back of the bunny
    bunny.add(tail);

    // Head
    const headGeometry = new THREE.SphereGeometry(4, 32, 32);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(10, 0, 0);
    bunny.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.75, 32, 32); // Adjust the size of the eyes as needed
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // white color for the eyes
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);

    // Position the eyes relative to the head's position
    leftEye.position.set(12, 1, 4); // Position adjusted for visual appearance
    rightEye.position.set(12, 1, -4); // Position adjusted for visual appearance

    // Add eyes to the bunny
    bunny.add(leftEye);
    bunny.add(rightEye);


    // Ears
    const earGeometry = new THREE.CylinderGeometry(0.2, 0.5, 6, 32);
    const earMaterial = new THREE.MeshBasicMaterial({ color: 0x996633 });
    leftEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(11, 3, 2);
    rightEar.position.set(11, 3, -2);
    bunny.add(leftEar);
    bunny.add(rightEar);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(1, 1, 6, 32);
    const legMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    frontLegs = new THREE.Mesh(legGeometry, legMaterial);
    rearLegs = new THREE.Mesh(legGeometry, legMaterial);
    frontLegs.position.set(3, -6, 0);
    rearLegs.position.set(-3, -6, 0);
    bunny.add(frontLegs);
    bunny.add(rearLegs);

    // Add bunny to the scene
    bunny.rotation.y = Math.PI; // Rotate the bunny by 180 degrees
    scene.add(bunny);
    bunny.scale.set(0.05, 0.05, 0.05);
    bunny.position.set(-2.3, 1.8, 2);

}



function addBall() {

    // create balls
    const geometry1 = new THREE.SphereGeometry(0.1, 32, 32);
    const geometry2 = new THREE.SphereGeometry(0.15, 32, 32);
    const geometry3 = new THREE.SphereGeometry(0.2, 32, 32);
    const geometry4 = new THREE.SphereGeometry(0.25, 32, 32);
    const geometry5 = new THREE.SphereGeometry(0.3, 32, 32);


    const vertexShader = document.getElementById("vertexShader").textContent;
    const fragmentShader = document.getElementById("fragmentShader").textContent;

    
    // load Cubemap Texture
    const loader = new THREE.CubeTextureLoader();
    loader.setPath('/Standard-Cube-Map_2/');
    const cubemapTexture = loader.load([
        'px.png', 'nx.png',
        'py.png', 'ny.png',
        'pz.png', 'nz.png'
    ], function() {
        scene.background = cubemapTexture; // let cubemap texture be the background
    });
    

    // create sun texture
    const SunGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
        envMap: cubemapTexture,
        metalness: 1.0,
        roughness: 0.0
    });

    // create sun mesh
    const Sun = new THREE.Mesh(SunGeo, sunMaterial);
    Sun.scale.set(3, 3, 3);
    Sun.position.set(2, 4.5, 0);
    scene.add(Sun);


    const ballMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms
    });

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

    // set balls positions
    ball1.position.set(0.02, 3.9, -2.1);
    ball2.position.set(0.06, 4.1, -2.1);
    ball3.position.set(0.2, 4.3, -2.2);
    ball4.position.set(0.17, 4.4, -2.3);
    ball5.position.set(0.47, 4.6, -2.35);
    ball6.position.set(0.5, 4.7, -2.35);

    // add balls to the scene
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
            positions[i] = Math.random() * 40 - 20; // randon x
            positions[i + 2] = Math.random() * 40 - 20; // random z
        
        }
    }
    snowParticles.geometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const speed = 5; // Speed of the animation
const amplitude = Math.PI / 6; // Amplitude of the leg and ear movements

function animate(time) {
    requestAnimationFrame(animate);

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    updatePhysics(deltaTime);
    //controls.update(deltaTime);
    if (controlEnabled.firstPerson) {
        firstPersonControls.update(0.01); // need a time long
    } else {
        orbitControls.update();
    }
    if (animationControls.animateBunny) {
        // Calculate the oscillation for the current frame
        const time = Date.now() * 0.0025;
        const oscillation = Math.sin(time * speed) * amplitude;
        const moveBounds = { minX: -2, maxX: 2 };

        // Apply the oscillation to the legs
        frontLegs.rotation.z = oscillation;
        rearLegs.rotation.z = -oscillation;

        leftEar.rotation.x = Math.sin(time * speed * 2) * (amplitude / 2);
        rightEar.rotation.x = -Math.sin(time * speed * 2) * (amplitude / 2);
        if (bunny) {

        // limit bunny pistion
        bunny.position.x = Math.max(moveBounds.minX, Math.min(moveBounds.maxX, bunny.position.x));
            if (rotatePhase) {
                // check angle
                if ((direction === 1 && bunny.rotation.y >= targetRotation) ||
                    (direction === -1 && bunny.rotation.y <= targetRotation) ) {
                    bunny.rotation.y = targetRotation; // rotation
                    rotatePhase = false; // finish rotation
                    movePhase = true; // start move
                    // calculate angle fo rnext time
                    targetRotation += direction * Math.PI; // 180 degree
                }
            } else if (movePhase) {
                moveDistance += moveSpeed * deltaTime * direction;
                bunny.position.x += moveSpeed * deltaTime * direction;
                // judge need rotation or not
                if (Math.abs(moveDistance) >= 5) {
                    moveDistance = 0; // reset move distance
                    movePhase = false; // finish movement
                    rotatePhase = true; // start new condition
                    direction *= -1; // change toward
                }
            }
            
        }
        
    }

    animateSnow(deltaTime);
    
    renderer.render(scene, camera);
}

init();