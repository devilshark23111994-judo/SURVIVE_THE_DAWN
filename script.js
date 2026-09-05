import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// =====================================================
// GAME VARIABLES
// =====================================================

let scene;
let camera;
let renderer;
let clock;

let playerGroup;
let monster;

let currentCharacter = 0;
let gameStarted = false;
let gameOver = false;
let gameWon = false;

let isNight = true;
let timeElapsed = 0;

// Dawn deadline: prototype = 4 minutes
const TOTAL_TIME = 240;

let radiation = 0;
let health = 100;

let partsFound = 0;
const TOTAL_PARTS = 8;

let repairParts = [];

let keys = {};

let joystickActive = false;
let joystickX = 0;
let joystickY = 0;

let sprinting = false;


// =====================================================
// CHARACTERS
// =====================================================

const characters = [];

const characterNames = [
    "PLAYER 1",
    "NPC 1",
    "NPC 2",
    "NPC 3",
    "NPC 4"
];

const characterColors = [
    0x3366ff,
    0x33cc66,
    0xff9933,
    0xcc33ff,
    0xff3333
];


// =====================================================
// INIT
// =====================================================

init();

function init() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x05070b);

    clock = new THREE.Clock();


    // -------------------------------------------------
    // CAMERA
    // -------------------------------------------------

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.set(0, 4, 8);


    // -------------------------------------------------
    // RENDERER
    // -------------------------------------------------

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    document
        .getElementById("game")
        .appendChild(renderer.domElement);


    // -------------------------------------------------
    // LIGHTING
    // -------------------------------------------------

    const ambientLight =
        new THREE.AmbientLight(
            0x405070,
            1.2
        );

    scene.add(ambientLight);


    const moonLight =
        new THREE.DirectionalLight(
            0x6677aa,
            1.5
        );

    moonLight.position.set(
        -30,
        50,
        -20
    );

    moonLight.castShadow = true;

    scene.add(moonLight);


    // -------------------------------------------------
    // WORLD
    // -------------------------------------------------

    createGround();

    createRoad();

    createForest();

    createCar();

    createCharacters();

    createMonster();

    createRepairParts();

    createBlueObject();

    createRain();


    // -------------------------------------------------
    // CONTROLS
    // -------------------------------------------------

    setupKeyboard();

    setupTouchControls();

    setupCharacterSwitch();


    // -------------------------------------------------
    // RESIZE
    // -------------------------------------------------

    window.addEventListener(
        "resize",
        onWindowResize
    );


    // -------------------------------------------------
    // START
    // -------------------------------------------------

    setTimeout(() => {

        document
            .getElementById("loadingScreen")
            .style.display = "none";

        gameStarted = true;

        showMessage(
            "Something crashed in the forest..."
        );

    }, 1800);


    animate();
}


// =====================================================
// GROUND
// =====================================================

function createGround() {

    const geometry =
        new THREE.PlaneGeometry(
            300,
            300
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x111611,
            roughness: 1
        });

    const ground =
        new THREE.Mesh(
            geometry,
            material
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);
}


// =====================================================
// ROAD
// =====================================================

function createRoad() {

    const geometry =
        new THREE.PlaneGeometry(
            18,
            300
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x181818
        });

    const road =
        new THREE.Mesh(
            geometry,
            material
        );

    road.rotation.x =
        -Math.PI / 2;

    road.position.y =
        0.02;

    scene.add(road);


    // Road divider

    const dividerGeometry =
        new THREE.BoxGeometry(
            0.25,
            0.1,
            300
        );

    const dividerMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffcc33
        });

    const divider =
        new THREE.Mesh(
            dividerGeometry,
            dividerMaterial
        );

    divider.position.y =
        0.08;

    scene.add(divider);
}


// =====================================================
// FOREST
// =====================================================

function createForest() {

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.25,
            0.45,
            5,
            8
        );

    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x292016
        });


    const leafGeometry =
        new THREE.ConeGeometry(
            2.2,
            5,
            8
        );

    const leafMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x102516
        });


    for (let i = 0; i < 100; i++) {

        const tree =
            new THREE.Group();


        const trunk =
            new THREE.Mesh(
                trunkGeometry,
                trunkMaterial
            );

        trunk.position.y = 2.5;

        trunk.castShadow = true;

        tree.add(trunk);


        const leaves =
            new THREE.Mesh(
                leafGeometry,
                leafMaterial
            );

        leaves.position.y = 6;

        leaves.castShadow = true;

        tree.add(leaves);


        let side =
            Math.random() > 0.5
                ? 1
                : -1;

        tree.position.x =
            side * (
                13 +
                Math.random() * 35
            );

        tree.position.z =
            -130 +
            Math.random() * 260;

        tree.scale.setScalar(
            0.7 +
            Math.random() * 1.2
        );

        scene.add(tree);
    }
}


// =====================================================
// CAR
// =====================================================

let car;

function createCar() {

    car = new THREE.Group();


    const bodyGeometry =
        new THREE.BoxGeometry(
            4,
            1.2,
            7
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x252525,
            metalness: 0.6,
            roughness: 0.4
        });

    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

    body.position.y =
        1.2;

    body.castShadow = true;

    car.add(body);


    const cabinGeometry =
        new THREE.BoxGeometry(
            3.2,
            1.3,
            3.2
        );

    const cabinMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x111827,
            transparent: true,
            opacity: 0.8
        });

    const cabin =
        new THREE.Mesh(
            cabinGeometry,
            cabinMaterial
        );

    cabin.position.y =
        2.3;

    car.add(cabin);


    // Wheels

    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.75,
            0.75,
            0.5,
            16
        );

    const wheelMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x080808
        });


    const wheelPositions = [
        [-2.1, 0.8, -2.3],
        [2.1, 0.8, -2.3],
        [-2.1, 0.8, 2.3],
        [2.1, 0.8, 2.3]
    ];


    wheelPositions.forEach(pos => {

        const wheel =
            new THREE.Mesh(
                wheelGeometry,
                wheelMaterial
            );

        wheel.rotation.z =
            Math.PI / 2;

        wheel.position.set(
            pos[0],
            pos[1],
            pos[2]
        );

        wheel.castShadow = true;

        car.add(wheel);

    });


    car.position.set(
        0,
        0,
        8
    );

    scene.add(car);
}


// =====================================================
// CHARACTERS
// =====================================================

function createCharacters() {

    for (let i = 0; i < 5; i++) {

        const group =
            new THREE.Group();


        // Body

        const body =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.45,
                    1.1,
                    4,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: characterColors[i]
                })
            );

        body.position.y =
            1.1;

        body.castShadow = true;

        group.add(body);


        // Head

        const head =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.4,
                    16,
                    16
                ),
                new THREE.MeshStandardMaterial({
                    color: 0xc58d6b
                })
            );

        head.position.y =
            2;

        head.castShadow = true;

        group.add(head);


        // Position

        if (i === 0) {

            group.position.set(
                0,
                0,
                5
            );

        } else {

            group.position.set(
                (i - 2) * 2,
                0,
                10 + i
            );

        }


        group.userData = {
            index: i,
            alive: true,
            health: 100,
            speed: 3 + Math.random(),
            aiTimer: 0
        };


        characters.push(group);

        scene.add(group);
    }


    playerGroup =
        characters[0];
}


// =====================================================
// MONSTER
// =====================================================

function createMonster() {

    monster =
        new THREE.Group();


    const body =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                1,
                2.5,
                6,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0x101010,
                roughness: 1
            })
        );

    body.position.y =
        2;

    body.castShadow = true;

    monster.add(body);


    // Glowing eyes

    const eyeMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x00aaff
        });


    const eye1 =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.12,
                12,
                12
            ),
            eyeMaterial
        );

    const eye2 =
        eye1.clone();


    eye1.position.set(
        -0.3,
        2.7,
        -0.8
    );

    eye2.position.set(
        0.3,
        2.7,
        -0.8
    );


    monster.add(
        eye1,
        eye2
    );


    monster.position.set(
        25,
        0,
        -20
    );


    monster.userData.speed = 2.2;

    scene.add(monster);
}


// =====================================================
// BLUE OBJECT
// =====================================================

function createBlueObject() {

    const geometry =
        new THREE.SphereGeometry(
            0.8,
            32,
            32
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x008cff
        });


    const object =
        new THREE.Mesh(
            geometry,
            material
        );


    object.position.set(
        4,
        1,
        -2
    );


    scene.add(object);


    // Glow light

    const light =
        new THREE.PointLight(
            0x008cff,
            8,
            15
        );

    light.position.copy(
        object.position
    );

    scene.add(light);
}


// =====================================================
// REPAIR PARTS
// =====================================================

function createRepairParts() {

    for (let i = 0; i < TOTAL_PARTS; i++) {

        const geometry =
            new THREE.BoxGeometry(
                0.8,
                0.8,
                0.8
            );

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.7
            });


        const part =
            new THREE.Mesh(
                geometry,
                material
            );


        part.position.set(
            -25 +
            Math.random() * 50,
            0.6,
            -80 +
            Math.random() * 160
        );


        part.userData = {
            collected: false,
            index: i
        };


        scene.add(part);

        repairParts.push(part);
    }
}


// =====================================================
// RAIN
// =====================================================

let rain;

function createRain() {

    const count = 2500;

    const positions =
        new Float32Array(
            count * 3
        );


    for (let i = 0; i < count; i++) {

        positions[i * 3] =
            (Math.random() - 0.5) * 100;

        positions[i * 3 + 1] =
            Math.random() * 40;

        positions[i * 3 + 2] =
            (Math.random() - 0.5) * 150;
    }


    const geometry =
        new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const material =
        new THREE.PointsMaterial({
            color: 0x99bbff,
            size: 0.08
        });


    rain =
        new THREE.Points(
            geometry,
            material
        );

    scene.add(rain);
}


// =====================================================
// KEYBOARD
// =====================================================

function setupKeyboard() {

    window.addEventListener(
        "keydown",
        event => {

            keys[event.key.toLowerCase()] =
                true;

            if (
                event.key.toLowerCase() === "e"
            ) {
                interact();
            }

            if (
                event.key.toLowerCase() === "q"
            ) {
                openCharacterMenu();
            }

            if (
                event.key.toLowerCase() === "shift"
            ) {
                sprinting = true;
            }
        }
    );


    window.addEventListener(
        "keyup",
        event => {

            keys[event.key.toLowerCase()] =
                false;

            if (
                event.key.toLowerCase() === "shift"
            ) {
                sprinting = false;
            }
        }
    );
}


// =====================================================
// TOUCH CONTROLS
// =====================================================

function setupTouchControls() {

    const joystick =
        document.getElementById(
            "joystickBase"
        );

    const knob =
        document.getElementById(
            "joystickKnob"
        );


    joystick.addEventListener(
        "touchstart",
        event => {

            joystickActive = true;

            updateJoystick(
                event.touches[0]
            );
        },
        { passive: true }
    );


    joystick.addEventListener(
        "touchmove",
        event => {

            if (!joystickActive)
                return;

            updateJoystick(
                event.touches[0]
            );
        },
        { passive: true }
    );


    joystick.addEventListener(
        "touchend",
        () => {

            joystickActive = false;

            joystickX = 0;
            joystickY = 0;

            knob.style.transform =
                "translate(0px, 0px)";
        }
    );


    function updateJoystick(touch) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width / 2;

        const centerY =
            rect.top +
            rect.height / 2;


        let dx =
            touch.clientX -
            centerX;

        let dy =
            touch.clientY -
            centerY;


        const maxDistance =
            rect.width / 2;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distance > maxDistance) {

            dx =
                dx / distance *
                maxDistance;

            dy =
                dy / distance *
                maxDistance;
        }


        joystickX =
            dx / maxDistance;

        joystickY =
            dy / maxDistance;


        knob.style.transform =
            `translate(${dx}px, ${dy}px)`;
    }


    document
        .getElementById(
            "interactButton"
        )
        .addEventListener(
            "click",
            interact
        );


    document
        .getElementById(
            "switchButton"
        )
        .addEventListener(
            "click",
            openCharacterMenu
        );


    const sprintButton =
        document.getElementById(
            "sprintButton"
        );


    sprintButton.addEventListener(
        "touchstart",
        () => {
            sprinting = true;
        }
    );


    sprintButton.addEventListener(
        "touchend",
        () => {
            sprinting = false;
        }
    );
}


// =====================================================
// CHARACTER SWITCH
// =====================================================

function setupCharacterSwitch() {

    document
        .querySelectorAll(
            ".characterButton"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.character
                        );

                    switchCharacter(index);

                }
            );
        });


    document
        .getElementById(
            "closeCharacterMenu"
        )
        .addEventListener(
            "click",
            closeCharacterMenu
        );
}


function openCharacterMenu() {

    document
        .getElementById(
            "characterMenu"
        )
        .style.display =
        "flex";
}


function closeCharacterMenu() {

    document
        .getElementById(
            "characterMenu"
        )
        .style.display =
        "none";
}


function switchCharacter(index) {

    if (
        !characters[index].userData.alive
    ) {
        showMessage(
            "This survivor is down."
        );

        return;
    }


    currentCharacter =
        index;

    playerGroup =
        characters[index];


    document
        .getElementById(
            "currentPlayer"
        )
        .textContent =
        characterNames[index];


    closeCharacterMenu();

    showMessage(
        "Switched to " +
        characterNames[index]
    );
}


// =====================================================
// MOVEMENT
// =====================================================

function updatePlayer(delta) {

    if (!playerGroup)
        return;


    let x = 0;
    let z = 0;


    if (keys["w"])
        z -= 1;

    if (keys["s"])
        z += 1;

    if (keys["a"])
        x -= 1;

    if (keys["d"])
        x += 1;


    // Touch joystick

    x += joystickX;
    z += joystickY;


    const length =
        Math.sqrt(
            x * x +
            z * z
        );


    if (length > 1) {

        x /= length;
        z /= length;
    }


    let speed =
        playerGroup.userData.speed;


    if (sprinting)
        speed *= 1.7;


    playerGroup.position.x +=
        x * speed * delta;

    playerGroup.position.z +=
        z * speed * delta;


    // Rotate toward movement

    if (length > 0.1) {

        const targetRotation =
            Math.atan2(
                x,
                z
            );

        playerGroup.rotation.y =
            THREE.MathUtils.lerp(
                playerGroup.rotation.y,
                targetRotation,
                0.15
            );
    }
}


// =====================================================
// NPC AI
// =====================================================

function updateNPCs(delta) {

    characters.forEach(
        (character, index) => {

            if (index === currentCharacter)
                return;

            if (
                !character.userData.alive
            )
                return;


            character.userData.aiTimer -=
                delta;


            if (
                character.userData.aiTimer <= 0
            ) {

                character.userData.aiTimer =
                    1 +
                    Math.random() * 2;


                // Smart NPC:
                // Move toward nearest repair part

                let nearest = null;
                let nearestDistance =
                    Infinity;


                repairParts.forEach(part => {

                    if (
                        part.userData.collected
                    )
                        return;


                    const distance =
                        character.position.distanceTo(
                            part.position
                        );


                    if (
                        distance <
                        nearestDistance
                    ) {

                        nearestDistance =
                            distance;

                        nearest =
                            part;
                    }

                });


                if (nearest) {

                    const direction =
                        new THREE.Vector3()
                            .subVectors(
                                nearest.position,
                                character.position
                            )
                            .normalize();


                    character.position.x +=
                        direction.x *
                        character.userData.speed *
                        delta;

                    character.position.z +=
                        direction.z *
                        character.userData.speed *
                        delta;
                }
            }
        }
    );
}


// =====================================================
// MONSTER AI
// =====================================================

function updateMonster(delta) {

    if (
        !monster ||
        gameOver ||
        gameWon
    )
        return;


    const distance =
        monster.position.distanceTo(
            playerGroup.position
        );


    // Monster becomes stronger at night

    const speed =
        isNight
            ? 3.1
            : 1.6;


    monster.userData.speed =
        speed;


    if (distance < 35) {

        const direction =
            new THREE.Vector3()
                .subVectors(
                    playerGroup.position,
                    monster.position
                )
                .normalize();


        monster.position.x +=
            direction.x *
            speed *
            delta;

        monster.position.z +=
            direction.z *
            speed *
            delta;


        monster.lookAt(
            playerGroup.position.x,
            monster.position.y,
            playerGroup.position.z
        );
    }


    // Monster proximity

    if (distance < 2.2) {

        health -=
            isNight
                ? 18 * delta
                : 8 * delta;


        updateHealth();


        if (health <= 0) {

            characterLost(
                currentCharacter
            );
        }
    }
}


// =====================================================
// INTERACTION
// =====================================================

function interact() {

    if (
        !gameStarted ||
        gameOver ||
        gameWon
    )
        return;


    // Collect repair parts

    for (
        let i = 0;
        i < repairParts.length;
        i++
    ) {

        const part =
            repairParts[i];


        if (
            part.userData.collected
        )
            continue;


        const distance =
            playerGroup.position.distanceTo(
                part.position
            );


        if (distance < 2.5) {

            part.userData.collected =
                true;

            part.visible =
                false;

            partsFound++;

            updateParts();

            showMessage(
                "Repair part found! " +
                partsFound +
                " / 8"
            );

            return;
        }
    }


    // Repair car when all parts collected

    const carDistance =
        playerGroup.position.distanceTo(
            car.position
        );


    if (
        carDistance < 5 &&
        partsFound === TOTAL_PARTS
    ) {

        winGame();

        return;
    }


    if (
        carDistance < 5
    ) {

        showMessage(
            "The car needs 8 repair parts."
        );

        return;
    }


    showMessage(
        "Nothing useful nearby."
    );
}


// =====================================================
// CHARACTER LOST
// =====================================================

function characterLost(index) {

    characters[index].userData.alive =
        false;

    characters[index].visible =
        false;


    // Find another survivor

    let next =
        characters.findIndex(
            character =>
                character.userData.alive
        );


    if (next === -1) {

        triggerGameOver(
            "All survivors are down."
        );

        return;
    }


    switchCharacter(next);

    showMessage(
        characterNames[index] +
        " has been lost."
    );
}


// =====================================================
// TIME + DAY/NIGHT
// =====================================================

function updateTime(delta) {

    timeElapsed += delta;


    if (
        timeElapsed >= TOTAL_TIME
    ) {

        triggerGameOver(
            "Dawn arrived before the car was repaired."
        );

        return;
    }


    // Night -> day -> night cycle

    const cycle =
        timeElapsed % 80;


    if (cycle < 40) {

        if (!isNight) {

            isNight = true;

            showMessage(
                "Night has fallen..."
            );
        }

    } else {

        if (isNight) {

            isNight = false;

            showMessage(
                "Daylight. The creature is weaker."
            );
        }
    }


    updateTimeHUD();
}


// =====================================================
// RADIATION
// =====================================================

function updateRadiation(delta) {

    // Radiation slowly increases

    radiation +=
        delta * 0.12;


    // Blue object area is more dangerous

    const blueObjectPosition =
        new THREE.Vector3(
            4,
            1,
            -2
        );


    const distance =
        playerGroup.position.distanceTo(
            blueObjectPosition
        );


    if (distance < 12) {

        radiation +=
            delta * 0.7;
    }


    radiation =
        Math.min(
            radiation,
            100
        );


    document
        .getElementById(
            "radiationBar"
        )
        .style.width =
        radiation + "%";


    if (radiation >= 100) {

        triggerGameOver(
            "Radiation level critical."
        );
    }
}


// =====================================================
// HUD
// =====================================================

function updateHealth() {

    document
        .getElementById(
            "healthBar"
        )
        .style.width =
        Math.max(
            health,
            0
        ) + "%";
}


function updateParts() {

    document
        .getElementById(
            "partsFound"
        )
        .textContent =
        partsFound;
}


function updateTimeHUD() {

    const remaining =
        Math.max(
            TOTAL_TIME -
            timeElapsed,
            0
        );


    const minutes =
        Math.floor(
            remaining / 60
        );


    const seconds =
        Math.floor(
            remaining % 60
        );


    document
        .getElementById(
            "timeCounter"
        )
        .textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;


    document
        .getElementById(
            "timeOfDay"
        )
        .textContent =
        isNight
            ? "NIGHT"
            : "DAY";
}


// =====================================================
// MESSAGE
// =====================================================

let messageTimeout;

function showMessage(text) {

    const box =
        document.getElementById(
            "messageBox"
        );

    const message =
        document.getElementById(
            "messageText"
        );


    message.textContent =
        text;

    box.style.display =
        "block";


    clearTimeout(
        messageTimeout
    );


    messageTimeout =
        setTimeout(() => {

            box.style.display =
                "none";

        }, 3000);
}


// =====================================================
// GAME OVER
// =====================================================

function triggerGameOver(reason) {

    if (gameOver)
        return;


    gameOver = true;


    document
        .getElementById(
            "gameOverReason"
        )
        .textContent =
        reason;


    document
        .getElementById(
            "gameOver"
        )
        .style.display =
        "flex";
}


// =====================================================
// WIN
// =====================================================

function winGame() {

    if (gameWon)
        return;


    gameWon = true;


    // Freeze monster

    monster.userData.speed =
        0;


    // Ending cutscene

    document
        .getElementById(
            "cutscene"
        )
        .style.display =
        "flex";


    const text =
        document.getElementById(
            "cutsceneText"
        );


    const scenes = [

        "The final part clicks into place...",

        "The car engine starts.",

        "A strange blue glow appears in the monster's eyes.",

        "The survivors run toward the highway.",

        "For a moment... it looks like they made it.",

        "CRASH.",

        "The radiation has already changed everything."

    ];


    let index = 0;


    function nextScene() {

        if (index >= scenes.length) {

            finishEnding();

            return;
        }


        text.textContent =
            scenes[index];


        index++;


        setTimeout(
            nextScene,
            2200
        );
    }


    nextScene();
}


// =====================================================
// ENDING
// =====================================================

function finishEnding() {

    document
        .getElementById(
            "cutscene"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "endingScreen"
        )
        .style.display =
        "flex";
}


// =====================================================
// RESTART
// =====================================================

document
    .getElementById(
        "restartButton"
    )
    .addEventListener(
        "click",
        () => {
            location.reload();
        }
    );


document
    .getElementById(
        "endingRestart"
    )
    .addEventListener(
        "click",
        () => {
            location.reload();
        }
    );


document
    .getElementById(
        "skipCutscene"
    )
    .addEventListener(
        "click",
        finishEnding
    );


// =====================================================
// CAMERA
// =====================================================

function updateCamera() {

    if (!playerGroup)
        return;


    const target =
        new THREE.Vector3(
            playerGroup.position.x,
            playerGroup.position.y + 2,
            playerGroup.position.z
        );


    const cameraTarget =
        new THREE.Vector3(
            playerGroup.position.x,
            playerGroup.position.y + 4,
            playerGroup.position.z + 8
        );


    camera.position.lerp(
        cameraTarget,
        0.08
    );


    camera.lookAt(
        target
    );
}


// =====================================================
// RAIN UPDATE
// =====================================================

function updateRain(delta) {

    if (!rain)
        return;


    rain.rotation.y +=
        delta * 0.02;


    const positions =
        rain.geometry.attributes
            .position.array;


    for (
        let i = 1;
        i < positions.length;
        i += 3
    ) {

        positions[i] -=
            delta * 25;


        if (
            positions[i] < 0
        ) {

            positions[i] =
                40;
        }
    }


    rain.geometry.attributes
        .position.needsUpdate =
        true;
}


// =====================================================
// MAIN LOOP
// =====================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    if (
        gameStarted &&
        !gameOver &&
        !gameWon
    ) {

        updatePlayer(delta);

        updateNPCs(delta);

        updateMonster(delta);

        updateTime(delta);

        updateRadiation(delta);
    }


    updateCamera();

    updateRain(delta);


    renderer.render(
        scene,
        camera
    );
}


// =====================================================
// RESIZE
// =====================================================

function onWindowResize() {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}
// ===============================
// START GAME
// ===============================

const loadingScreen =
  document.getElementById("loadingScreen");

setTimeout(() => {
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
}, 1500);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(
    clock.getDelta(),
    0.05
  );

  moveCurrentPlayer(delta);

  blueObject.rotation.y += delta;
  blueObject.rotation.x += delta * 0.5;

  camera.position.x =
    playerMeshes[game.currentPlayer].position.x;

  camera.position.z =
    playerMeshes[game.currentPlayer].position.z + 12;

  camera.position.y = 6;

  camera.lookAt(
    playerMeshes[game.currentPlayer].position.x,
    1.5,
    playerMeshes[game.currentPlayer].position.z
  );

  renderer.render(scene, camera);
}

animate();
