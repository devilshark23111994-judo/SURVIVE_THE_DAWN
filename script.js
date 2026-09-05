const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 5 Squad members
let squad = [
    { id: 0, name: "Boss (Self)", x: 400, y: 140, active: true, color: "#00ffcc" },
    { id: 1, name: "Rohit", x: 350, y: 110, active: true, color: "#ffcc00" },
    { id: 2, name: "Kabir", x: 450, y: 110, active: true, color: "#ffcc00" },
    { id: 3, name: "Tanya", x: 350, y: 190, active: true, color: "#ffcc00" },
    { id: 4, name: "Sneha", x: 450, y: 190, active: true, color: "#ffcc00" }
];

let controlledIndex = 0;
let car = { x: 400, y: 150, repair: 0 };
let monster = { x: 100, y: 60, speed: 0.9 };
let radiationBlobs = [];
let trees = [
    {x: 90, y: 40}, {x: 240, y: 210}, {x: 610, y: 45}, {x: 710, y: 200}, {x: 180, y: 120}, {x: 640, y: 130}
];

let gameTime = 120;
let isGameOver = false;

// Touch Drag Joystick Variables
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

    let speed = 2.5;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        curr.x += (dx > 0 ? speed : -speed);
        curr.y += (dy > 0 ? speed : -speed);

        // Boundary checks
        if (curr.x < 20) curr.x = 20;
        if (curr.x > canvas.width - 20) curr.x = canvas.width - 20;
        if (curr.y < 20) curr.y = 20;
        if (curr.y > canvas.height - 20) curr.y = canvas.height - 20;
    }
});

window.addEventListener('touchend', () => {
    isTouching = false;
});

// Switch control between squad members
function switchCharacter() {
    if (isGameOver) return;
    let startIndex = controlledIndex;
    do {
        controlledIndex = (controlledIndex + 1) % squad.length;
    } while (!squad[controlledIndex].active && controlledIndex !== startIndex);

    squad.forEach((m, idx) => {
        if (idx === controlledIndex) {
            m.color = "#00ffcc";
        } else if (m.active) {
            m.color = "#ffcc00";
        }
    });
}

// Fix car action
function performAction() {
    if (isGameOver) return;
    let curr = squad[controlledIndex];
    let dist = Math.hypot(curr.x - car.x, curr.y - car.y);
    
    if (dist < 45) {
        car.repair += 10;
        document.getElementById("repair-progress").innerText = car.repair + "%";
        
        if (car.repair >= 100) {
            triggerHighwayEscape();
        }
    }
}

// Monster AI & Mechanics
function updateMonster() {
    if (isGameOver) return;
    
    let activeMembers = squad.filter(m => m.active);
    if (activeMembers.length === 0) {
        triggerGameOver("Poori team safa chat ho gayi!");
        return;
    }

    let target = activeMembers[0];
    let minDst = Math.hypot(target.x - monster.x, target.y - monster.y);
    activeMembers.forEach(m => {
        let d = Math.hypot(m.x - monster.x, m.y - monster.y);
        if (d < minDst) {
            minDst = d;
            target = m;
        }
    });

    if (monster.x < target.x) monster.x += monster.speed;
    if (monster.x > target.x) monster.x -= monster.speed;
    if (monster.y < target.y) monster.y += monster.speed;
    if (monster.y > target.y) monster.y -= monster.speed;

    activeMembers.forEach(m => {
        if (Math.hypot(m.x - monster.x, m.y - monster.y) < 20) {
            m.active = false;
            m.color = "#333333";
            if (squad[controlledIndex].id === m.id) {
                switchCharacter();
            }
        }
    });

    let aliveCount = squad.filter(m => m.active).length;
    document.getElementById("squad-status").innerText = `${aliveCount} / 5 Alive`;

    if (aliveCount === 0) {
        triggerGameOver("Sabhi 5 dost mutant ka shikar ho gaye...");
    }

    // Radiation blob attack on car
    if (Math.random() < 0.02) {
        radiationBlobs.push({ x: monster.x, y: monster.y, targetX: car.x, targetY: car.y });
    }

    radiationBlobs.forEach((blob, index) => {
        let dx = blob.targetX - blob.x;
        let dy = blob.targetY - blob.y;
        blob.x += dx * 0.05;
        blob.y += dy * 0.05;

        if (Math.hypot(blob.x - car.x, blob.y - car.y) < 22) {
            if (car.repair > 0) car.repair -= 5;
            document.getElementById("repair-progress").innerText = car.repair + "%";
            radiationBlobs.splice(index, 1);
        }
    });
}

// Game Rendering Loop
function gameLoop() {
    if (isGameOver) return;

    ctx.fillStyle = "#050a05";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Trees
    ctx.fillStyle = "#0d1a0d";
    trees.forEach(t => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1b331b";
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Car
    ctx.shadowBlur = 12;
    ctx.shadowColor = car.repair >= 100 ? "#00ff00" : "#ff3300";
    ctx.fillStyle = car.repair >= 100 ? "#114411" : "#441111";
    ctx.fillRect(car.x - 26, car.y - 13, 52, 26);
    ctx.strokeStyle = car.repair >= 100 ? "#00ff00" : "#ff3300";
    ctx.lineWidth = 2;
    ctx.strokeRect(car.x - 26, car.y - 13, 52, 26);
    ctx.shadowBlur = 0;

    // Squad
    squad.forEach(member => {
        if (member.active) {
            ctx.fillStyle = member.color;
            ctx.beginPath();
            ctx.arc(member.x, member.y, 10, 0, Math.PI * 2);
            ctx.fill();
            if (member.id === squad[controlledIndex].id) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    });

    // Monster
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#9900ff";
    ctx.fillStyle = "#5500aa";
    ctx.beginPath();
    ctx.arc(monster.x, monster.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Radiation Blobs
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#00ffff";
    ctx.fillStyle = "#00ffff";
    radiationBlobs.forEach(blob => {
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.shadowBlur = 0;

    updateMonster();

    gameTime -= 0.035;
    let mins = Math.floor(gameTime / 60);
    let secs = Math.floor(gameTime % 60);
    document.getElementById("time-display").innerText = `0${mins}:${secs < 10 ? '0' : ''}${secs} AM`;

    if (gameTime <= 0 && car.repair < 100) {
        triggerGameOver("Subah ho gayi aur gaadi fix nahi hui! Radiation ne sabko nigal liya.");
    }

    requestAnimationFrame(gameLoop);
}

// Highway Escape & Sad Ending
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

gameLoop();
