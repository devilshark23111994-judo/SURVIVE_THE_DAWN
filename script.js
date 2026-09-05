const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// All 5 squad members (Index 0 is Main Player, 1-4 are Smart NPCs)
let squad = [
    { id: 0, name: "Boss (Self)", x: 400, y: 180, active: true, color: "#00ffcc" },
    { id: 1, name: "Rohit", x: 370, y: 160, active: true, color: "#ffcc00" },
    { id: 2, name: "Kabir", x: 430, y: 160, active: true, color: "#ffcc00" },
    { id: 3, name: "Tanya", x: 370, y: 220, active: true, color: "#ffcc00" },
    { id: 4, name: "Sneha", x: 430, y: 220, active: true, color: "#ffcc00" }
];

let controlledIndex = 0; // Index of the character currently controlled by player
let car = { x: 400, y: 190, repair: 0 };
let monster = { x: 100, y: 80, speed: 1.2 };
let radiationBlobs = [];

let gameTime = 120;
let isGameOver = false;

// Move currently controlled character
function movePlayer(dir) {
    if (isGameOver) return;
    let curr = squad[controlledIndex];
    if (!curr.active) return;

    if (dir === 'UP' && curr.y > 30) curr.y -= 15;
    if (dir === 'DOWN' && curr.y < 220) curr.y += 15;
    if (dir === 'LEFT' && curr.x > 30) curr.x -= 15;
    if (dir === 'RIGHT' && curr.x < 770) curr.x += 15;
}

// Switch control to the next active squad member
function switchCharacter() {
    if (isGameOver) return;
    let startIndex = controlledIndex;
    do {
        controlledIndex = (controlledIndex + 1) % squad.length;
    } while (!squad[controlledIndex].active && controlledIndex !== startIndex);

    // Update colors to highlight active character
    squad.forEach((m, idx) => {
        if (idx === controlledIndex) {
            m.color = "#00ffcc"; // Active color
        } else if (m.active) {
            m.color = "#ffcc00"; // NPC color
        }
    });
}

// Fix car action
function performAction() {
    if (isGameOver) return;
    let curr = squad[controlledIndex];
    let dist = Math.hypot(curr.x - car.x, curr.y - car.y);
    
    if (dist < 40) {
        car.repair += 10;
        document.getElementById("repair-progress").innerText = car.repair + "%";
        
        if (car.repair >= 100) {
            triggerHighwayEscape();
        }
    }
}

// Monster logic & squad damage/death system
function updateMonster() {
    if (isGameOver) return;
    
    // Monster chases the closest active squad member
    let activeMembers = squad.filter(m => m.active);
    if (activeMembers.length === 0) {
        triggerGameOver("Poori team safa chat ho gayi! Game Over.");
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

    // Move monster towards target
    if (monster.x < target.x) monster.x += monster.speed;
    if (monster.x > target.x) monster.x -= monster.speed;
    if (monster.y < target.y) monster.y += monster.speed;
    if (monster.y > target.y) monster.y -= monster.speed;

    // Monster attacks / kills member if too close
    activeMembers.forEach(m => {
        if (Math.hypot(m.x - monster.x, m.y - monster.y) < 20) {
            m.active = false;
            m.color = "#555555"; // Dead color
            
            // If the controlled character died, auto-switch to someone else alive
            if (squad[controlledIndex].id === m.id) {
                switchCharacter();
            }
        }
    });

    // Update squad status UI
    let aliveCount = squad.filter(m => m.active).length;
    document.getElementById("squad-status").innerText = `${aliveCount} / 5 Alive`;

    if (aliveCount === 0) {
        triggerGameOver("Sabhi 5 dost mutant ka shikar ho gaye...");
    }

    // Randomly throw radiation blob at car
    if (Math.random() < 0.02) {
        radiationBlobs.push({ x: monster.x, y: monster.y, targetX: car.x, targetY: car.y });
    }

    // Move blobs
    radiationBlobs.forEach((blob, index) => {
        let dx = blob.targetX - blob.x;
        let dy = blob.targetY - blob.y;
        blob.x += dx * 0.05;
        blob.y += dy * 0.05;

        if (Math.hypot(blob.x - car.x, blob.y - car.y) < 20) {
            if (car.repair > 0) car.repair -= 5;
            document.getElementById("repair-progress").innerText = car.repair + "%";
            radiationBlobs.splice(index, 1);
        }
    });
}

// Main Game Loop
function gameLoop() {
    if (isGameOver) return;

    // Clear canvas
    ctx.fillStyle = "#0d1a0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Car
    ctx.fillStyle = car.repair >= 100 ? "#00ff00" : "#ff3300";
    ctx.fillRect(car.x - 20, car.y - 10, 40, 20);

    // Draw Squad Members
    squad.forEach(member => {
        if (member.active) {
            ctx.fillStyle = member.color;
            ctx.beginPath();
            ctx.arc(member.x, member.y, 12, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw Monster
    ctx.fillStyle = "#9900ff";
    ctx.beginPath();
    ctx.arc(monster.x, monster.y, 16, 0, Math.PI * 2);
    ctx.fill();

    // Draw Radiation Blobs
    ctx.fillStyle = "#00ffff";
    radiationBlobs.forEach(blob => {
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    updateMonster();

    gameTime -= 0.05;
    if (gameTime <= 0 && car.repair < 100) {
        triggerGameOver("Subah ho gayi aur gaadi fix nahi hui! Radiation ne sabko nigal liya.");
    }

    requestAnimationFrame(gameLoop);
}

// Highway Escape & Sad Twist Ending
function triggerHighwayEscape() {
    isGameOver = true;
    setTimeout(() => {
        document.getElementById("ending-screen").classList.remove("hidden");
        document.getElementById("ending-title").innerText = "THE HIGHWAY TRAGEDY";
        document.getElementById("ending-msg").innerText = "Sabhi dost gaadi mein baithkar highway par nikal pade. Subah ki pehli kiran aate hi achanak gaadi ke andar excess radiation fail gayi, steering lock ho gaya aur gaadi ek bhayanak ped se takra kar crash ho gayi...\n\n(Background mein ek dardnak sad music baj raha hai)";
    }, 1000);
}

function triggerGameOver(reason) {
    isGameOver = true;
    document.getElementById("ending-screen").classList.remove("hidden");
    document.getElementById("ending-title").innerText = "GAME OVER";
    document.getElementById("ending-msg").innerText = reason;
}

// Start game
gameLoop();

