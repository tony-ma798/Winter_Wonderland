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
let controlEnabled = { firstPerson: false }; // 初始状态使用OrbitControls
let movePhase = false; // 是否处于移动阶段
let rotatePhase = true; // 开始时首先进行旋转
let moveDistance = 0; // 当前移动距离
const moveSpeed = 1; // 移动速度
let direction = 1; // 移动方向，1为正方向，-1为反方向
let targetRotation = 0;
let giftBoxes = []; // 存储所有giftbox

// 定义控制参数
var userControls = {
    noiseStrength: 0.1,
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
    camera.position.set(1.5, 4, 12);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6eedc);

    const ambientLight = new THREE.AmbientLight(0x404040, 10);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(0, 2, 0);
    scene.add(directionalLight);

    
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, 0); // 假设您想让光线斜向下照射到原点
    scene.add(targetObject);
    const spotlight = new THREE.SpotLight(0xffffff, 12); // 颜色和强度
    spotlight.position.set(spotlightPosition1, spotlightPosition2, spotlightPosition3); // 设置光源位置
    spotlight.angle = Math.PI / 2; // 光锥角度
    spotlight.penumbra = 0.1; // 光锥渐变边缘的软化程度
    spotlight.decay = 2; // 光照衰减
    spotlight.distance = 200; // 光照距离
    spotlight.target = targetObject;
    scene.add(spotlight);

    //2nd spotlight
    const spotlight2 = new THREE.SpotLight(0xffffff, 14); // 颜色和强度
    spotlight2.position.set(6, 7, 0); // 设置光源位置
    spotlight2.angle = Math.PI / 4; // 光锥角度
    spotlight2.penumbra = 0.1; // 光锥渐变边缘的软化程度
    spotlight2.decay = 2; // 光照衰减
    spotlight2.distance = 200; // 光照距离
    scene.add(spotlight2);


    initPhysics(); // 创建一个质量为1的方块
    //x, y, z：这些参数决定了地面中心点的位置坐标，即地面在世界空间中的具体位置。
    //其中x调整地面在水平方向（左右）的位置，
    //y调整地面在垂直方向（上下）的位置，z调整地面在另一个水平方向（前后）的位置。
    //a, b, c：这些参数代表了地面碰撞体的半尺寸，用于定义地面的大小和形状。
    //具体来说，a是地面沿着x轴方向的半宽度，决定了地面在水平方向的宽度。
    //b是地面沿着y轴方向的半高度，通常对于地面而言这个值很小，因为地面是平的。
    //c是地面沿着z轴方向的半深度，决定了地面在另一个水平方向的深度或长度。
    createGround(2, 3, 0.9, 0.1, 0.1, 0.1, 0x00ff00);
    createGround(-2.1, 3, 0.9, 0.1, 0.1, 0.1, 0x00ff00);


    createGround(-0.4, 2.5, -1, 0.6, 1, 0.7, 0x00ff00);

    createGround(0, 0.9, 0, 10, 0.5, 2.5);
    createGround(0, -0.1, 5, 10, 0.5, 3);
    createGround(0, -0.1, -6, 10, 0.5, 3);

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
        model2.position.set(4, 1.6, -1.5);
        scene.add(model2);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('low_poly_snow_island.glb', function (gltf) {
        const model3 = gltf.scene;
        model3.scale.set(1.1, 1.1, 1.1);
        model3.position.set(-0.3, 1.2, -1.5);
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
    // loader.load('fir_tree_set_with_snow.glb', function (gltf) {
    //     const model5 = gltf.scene;
    //     model5.scale.set(10, 100, 10);
    //     model5.position.set(3, 2, 2);
    //     scene.add(model5);
    // }, undefined, function (error) {
    //     console.error('An error happened while loading the model:', error);
    // });
    loader.load('low-poly_snow_tree.glb', function (gltf) {
        const model6 = gltf.scene;
        model6.scale.set(0.3, 0.4, 0.3);
        model6.position.set(3, 1.5, 3);
        scene.add(model6);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });
    loader.load('snow_tree.glb', function (gltf) {
        const model7 = gltf.scene;
        model7.scale.set(0.001, 0.001, 0.001);
        model7.position.set(3, 1.5, 2.5);
        scene.add(model7);
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
    // 添加按钮控制，掉落新的giftbox
    gui.add({ dropGiftBox: function() {
        // 按下按钮时调用createBox函数创建新的giftbox
        // 这里可以根据需要调整位置和尺寸参数
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
    // 物理世界配置
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
}

function createGround(x, y, z, a, b, c, color) {

    // 创建地面的物理碰撞体
    const groundShape = new Ammo.btBoxShape(new Ammo.btVector3(a, b, c)); // 假设地面厚度为1，宽度和长度为50
    const groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(x, y, z)); 

    const groundMass = 0; // 静态物体质量为0
    const localInertia = new Ammo.btVector3(0, 0, 0);
    const motionState = new Ammo.btDefaultMotionState(groundTransform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, motionState, groundShape, localInertia);
    const groundBody = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(groundBody);

    // 创建对应的可视化Mesh对象
    const groundGeometry = new THREE.BoxGeometry(a * 2, b * 2, c * 2); // 注意，这里的尺寸是全尺寸，所以要乘以2
    const groundMaterial = new THREE.MeshPhongMaterial({ color: color });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.position.set(x, y, z);

    // 将可视化Mesh对象添加到Three.js的场景中
    scene.add(groundMesh);
}


function createBox(mass, position, scale) {
    const loader = new GLTFLoader();
    loader.load('gift_box.glb', function(gltf) {
        const model = gltf.scene;
        model.traverse(function(child) {
            if (child.isMesh) {
                // 应用位置和缩放
                child.position.set(position.x, position.y, position.z);
                child.scale.set(scale.x, scale.y, scale.z);
                scene.add(child);

                // 创建物理碰撞体
                const shape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 8, scale.y * 8, scale.z * 3.5)); // 假设为盒状碰撞体
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
        scene.remove(box); // 从场景中移除
        const physicsBody = box.userData.physicsBody;
        if (physicsBody) {
            physicsWorld.removeRigidBody(physicsBody); // 从物理世界中移除
        }
    });
    giftBoxes = []; // 清空数组
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
    // 根据用户选择启用相应的控制模式
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

    // 创建球体几何体
    const geometry1 = new THREE.SphereGeometry(0.1, 32, 32);
    const geometry2 = new THREE.SphereGeometry(0.15, 32, 32);
    const geometry3 = new THREE.SphereGeometry(0.2, 32, 32);
    const geometry4 = new THREE.SphereGeometry(0.25, 32, 32);
    const geometry5 = new THREE.SphereGeometry(0.3, 32, 32);


    const vertexShader = document.getElementById("vertexShader").textContent;
    const fragmentShader = document.getElementById("fragmentShader").textContent;

    
    // 加载Cubemap Texture
    const loader = new THREE.CubeTextureLoader();
    loader.setPath('/Standard-Cube-Map_2/');
    const cubemapTexture = loader.load([
        'px.png', 'nx.png',
        'py.png', 'ny.png',
        'pz.png', 'nz.png'
    ], function() {
        scene.background = cubemapTexture; // 将加载的Cubemap纹理设置为场景背景
    });

    // 创建太阳几何体和材质
    const SunGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
        envMap: cubemapTexture,
        metalness: 1.0,
        roughness: 0.0
    });

    // 创建太阳Mesh并添加到场景
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

const speed = 5; // Speed of the animation
const amplitude = Math.PI / 6; // Amplitude of the leg and ear movements

function animate(time) {
    requestAnimationFrame(animate);

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    updatePhysics(deltaTime);
    //controls.update(deltaTime);
    if (controlEnabled.firstPerson) {
        firstPersonControls.update(0.01); // 需要一个时间步长参数
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

        // 限制Bunny的位置在定义的范围内
        bunny.position.x = Math.max(moveBounds.minX, Math.min(moveBounds.maxX, bunny.position.x));
            if (rotatePhase) {
                // 检查是否达到目标旋转角度
                if ((direction === 1 && bunny.rotation.y >= targetRotation) ||
                    (direction === -1 && bunny.rotation.y <= targetRotation) ) {
                    bunny.rotation.y = targetRotation; // 完成旋转
                    rotatePhase = false; // 结束旋转阶段
                    movePhase = true; // 开始移动阶段
                    // 计算下一次旋转的目标角度，以便在下一次改变方向时使用
                    targetRotation += direction * Math.PI; // 预设下次旋转180度
                }
            } else if (movePhase) {
                moveDistance += moveSpeed * deltaTime * direction;
                bunny.position.x += moveSpeed * deltaTime * direction;
                // 判断是否达到改变方向的条件
                if (Math.abs(moveDistance) >= 5) {
                    moveDistance = 0; // 重置移动距离
                    movePhase = false; // 结束移动阶段
                    rotatePhase = true; // 开始新的旋转阶段
                    direction *= -1; // 改变移动方向
                }
            }
            
        }
        
    }

    animateSnow(deltaTime);
    
    renderer.render(scene, camera);
}

init();