// Three.js 3D Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040804);
scene.fog = new THREE.FogExp2(0x040804, 0.035);

const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 18, 14);
camera.lookAt(0, 0, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x223322, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x44aa88, 1.2);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Ground plane
const groundGeo = new THREE.PlaneGeometry(50, 50);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a140a, roughness: 0.9 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Load Meme Texture for Player Character
const textureLoader = new THREE.TextureLoader();
let memeTexture = textureLoader.load('1000011853.jpg');

// Squad setup in 3D (mapping x to x, y to -z)
let squad = [
    { id: 0, name: "Boss (Meme)", x: 0, z: 2, active: true, color: 0x00ffcc },
    { id: 1, name: "Rohit", x: -4, z: -2, active: true, color: 0xffea00 },
    { id: 2, name: "Kabir", x: 4, z: -1, active: true, color: 0xffea00 },
    { id: 3, name: "Tanya", x: -5, z: 4, active: true, color: 0xffea00 },
    { id: 4, name: "Sneha", x: 5, z: 5, active: true, color: 0xffea00 }
];

let controlledIndex = 0;
let car = { x: 0, z: 2, repair: 0 };
let monster = { x: -8, z: -6, speed: 0.05 };
let radiationBlobs = [];

// Create 3D meshes for squad members
let squadMeshes = [];
squad.forEach((m, idx) => {
    let mat;
    if (idx === 0) {
        mat = new THREE.MeshBasicMaterial({ map: memeTexture, side: THREE.DoubleSide });
    } else {
        mat = new THREE.MeshStandardMaterial({ color: m.color, emissive: m.color, emissiveIntensity: 0.5 });
    }
    let geo = new THREE.PlaneGeometry(1.8, 1.8);
    let mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(m.x, 0.9, m.z);
    scene.add(mesh);
    squadMeshes.push(mesh);
});

// Create 3D Wrecked Car
let carGeo = new THREE.BoxGeometry(3.2, 1.2, 1.8);
let carMat = new THREE.MeshStandardMaterial({ color: 0x3d0f0f, roughness: 0.5 });
let carMesh = new THREE.Mesh(carGeo, carMat);
carMesh.position.set(car.x, 0.6, car.z);
scene.add(carMesh);

// Create 3D Monster
let monsterGeo = new THREE.SphereGeometry(1.1, 16, 16);
let monsterMat = new THREE.MeshStandardMaterial({ color: 0x8800cc, emissive: 0x440088, roughness: 0.3 });
let monsterMesh = new THREE.Mesh(monsterGeo, monsterMat);
monsterMesh.position.set(monster.x, 1.1, monster.z);
scene.add(monsterMesh);

// Create 3D Trees
let trees = [
    {x: -6, z: -4}, {x: -3, z: 6}, {x: 7, z: -5}, {x: 8, z: 4}, {x: -8, z: 1}, {x: 6, z: 0}
];
trees.forEach(t => {
    let trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    let trunkMat = new THREE.MeshStandardMaterial({ color: 0x1b2d1b });
    let trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(t.x, 1, t.z);
    scene.add(trunk);

    let leavesGeo = new THREE.ConeGeometry(1.2, 2.5, 8);
    let leavesMat = new THREE.MeshStandardMaterial({ color: 0x0e220e });
    let leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.set(t.x, 2.8, t.z);
    scene.add(leaves);
});

let gameTime = 120;
let isGameOver = false;

// Touch Drag Controls
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

window.addEventListener('touchstart', (e) => {
    if (isGameOver) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isTouching = true;
});

window.addEventListener('touchmove', (e) => {
    if (!isTouching || isGameOver) return;
    let touchX = e.touches[0].clientX;
    let touchY = e.touches[0].clientY;

    let dx = touchX - touchStartX;
    let dy = touchY - touchStartY;

    let curr = squad[controlledIndex];
    if (!curr.active) return;

    let speed = 0.05;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        curr.x += (dx > 0 ? speed : -speed) * 1.5;
        curr.z += (dy > 0 ? speed : -speed) * 1.5;

        // Boundaries
        if (curr.x < -9) curr.x = -9;
        if (curr.x > 9) curr.x = 9;
        if (curr.z < -7) curr.z = -7;
        if (curr.z > 7) curr.z = 7;
    }
});

window.addEventListener('touchend', () => {
    isTouching = false;
});

function switchCharacter() {
    if (isGameOver) return;
    let startIndex = controlledIndex;
    do {
        controlledIndex = (controlledIndex + 1) % squad.length;
    } while (!squad[controlledIndex].active && controlledIndex !== startIndex);
}

function performAction() {
    if (isGameOver) return;
    let curr = squad[controlledIndex];
    let dist = Math.hypot(curr.x - car.x, curr.z - car.z);
    
    if (dist < 3.0) {
        car.repair += 10;
        document.getElementById("repair-progress").innerText = car.repair + "%";
        
        // Change car color on repair progress
        carMat.color.setHex(car.repair >= 100 ? 0x0f3d0f : 0x3d0f0f);
        carMat.emissive.setHex(car.repair >= 100 ? 0x00ff00 : 0xff3300);
        carMat.emissiveIntensity = 0.4;

        if (car.repair >= 100) {
            triggerHighwayEscape();
        }
    }
}

function updateMonster() {
    if (isGameOver) return;
    
    let activeMembers = squad.filter(m => m.active);
    if (activeMembers.length === 0) {
        triggerGameOver("Poori team safa chat ho gayi!");
        return;
    }

    let target = squad[controlledIndex].active ? squad[controlledIndex] : activeMembers[0];
    
    if (monster.x < target.x) monster.x += monster.speed;
    if (monster.x > target.x) monster.x -= monster.speed;
    if (monster.z < target.z) monster.z += monster.speed;
    if (monster.z > target.z) monster.z -= monster.speed;

    monsterMesh.position.set(monster.x, 1.1, monster.z);

    // AI movement for inactive members & collision check with monster
    squad.forEach((m, idx) => {
        if (m.active && idx !== controlledIndex) {
            m.x += (Math.random() - 0.5) * 0.03;
            m.z += (Math.random() - 0.5) * 0.03;
        }

        let distToMonster = Math.hypot(m.x - monster.x, m.z - monster.z);
        if (distToMonster < 1.2 && m.active) {
            m.active = false;
            squadMeshes[idx].visible = false;
            if (controlledIndex === idx) {
                switchCharacter();
            }
        }

        // Update 3D mesh positions
        squadMeshes[idx].position.set(m.x, 0.9, m.z);
        
        // Billboard effect: Make 3D character planes face the camera
        squadMeshes[idx].quaternion.copy(camera.quaternion);

        // Horror Jumpscare red tint effect when monster gets close to Boss meme face
        if (idx === 0 && m.active) {
            let distToM = Math.hypot(m.x - monster.x, m.z - monster.z);
            if (distToM < 4.0) {
                squadMeshes[0].material.color.setHex(0xff3355); // Scary red flash
            } else {
                squadMeshes[0].material.color.setHex(0xffffff); // Normal color
            }
        }
    });

    let aliveCount = squad.filter(m => m.active).length;
    document.getElementById("squad-status").innerText = `${aliveCount} / 5`;

    if (aliveCount === 0) {
        triggerGameOver("Sabhi 5 dost mutant ka shikar ho gaye...");
    }
}

// 3D Game Loop
function animate() {
    if (isGameOver) return;
    requestAnimationFrame(animate);

    updateMonster();

    gameTime -= 0.035;
    let mins = Math.floor(gameTime / 60);
    let secs = Math.floor(gameTime % 60);
    document.getElementById("time-display").innerText = `0${mins}:${secs < 10 ? '0' : ''}${secs} AM`;

    if (gameTime <= 0 && car.repair < 100) {
        triggerGameOver("Subah ho gayi aur gaadi fix nahi hui! Radiation ne sabko nigal liya.");
    }

    renderer.render(scene, camera);
}

function triggerHighwayEscape() {
    isGameOver = true;
    setTimeout(() => {
        document.getElementById("ending-screen").classList.remove("hidden");
        document.getElementById("ending-title").innerText = "THE HIGHWAY TRAGEDY";
        document.getElementById("ending-msg").innerText = "Sabhi dost gaadi mein baithkar highway par nikal pade. Subah ki pehli kiran aate hi achanak gaadi ke andar excess radiation fail gayi, steering lock ho gaya aur gaadi ek bhayanak ped se takra kar crash ho gayi...\n\n(Background mein ek dardnak sad music baj raha hai)";
    }, 800);
}

function triggerGameOver(reason) {
    isGameOver = true;
    document.getElementById("ending-screen").classList.remove("hidden");
    document.getElementById("ending-title").innerText = "GAME OVER";
    document.getElementById("ending-msg").innerText = reason;
}

animate();
