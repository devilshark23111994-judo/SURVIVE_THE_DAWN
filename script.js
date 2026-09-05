const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load the uploaded meme image as the player sprite
const playerImg = new Image();
playerImg.src = '1000011853.jpg'; // Aapki uploaded photo

// Squad setup
let squad = [
    { id: 0, name: "Boss (Meme)", x: 400, y: 150, active: true, color: "#00ffcc" },
    { id: 1, name: "Rohit", x: 260, y: 90, active: true, color: "#ffea00" },
    { id: 2, name: "Kabir", x: 540, y: 100, active: true, color: "#ffea00" },
    { id: 3, name: "Tanya", x: 230, y: 200, active: true, color: "#ffea00" },
    { id: 4, name: "Sneha", x: 570, y: 210, active: true, color: "#ffea00" }
];

let controlledIndex = 0;
let car = { x: 400, y: 150, repair: 0 };
let monster = { x: 100, y: 50, speed: 0.8 };
let radiationBlobs = [];

let trees = [
    {x: 80, y: 50}, {x: 200, y: 220}, {x: 620, y: 60}, {x: 720, y: 210}, {x: 160, y: 130}, {x: 650, y: 140}
];

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

    let speed = 2.2;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        curr.x += (dx > 0 ? speed : -speed);
        curr.y += (dy > 0 ? speed : -speed);

        if (curr.x < 15) curr.x = 15;
        if (curr.x > canvas.width - 15) curr.x = canvas.width - 15;
        if (curr.y < 25) curr.y = 25;
        if (curr.y > canvas.height - 15) curr.y = canvas.height - 15;
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
    let dist = Math.hypot(curr.x - car.x, curr.y - car.y);
    
    if (dist < 40) {
        car.repair += 10;
        document.getElementById("repair-progress").innerText = car.repair + "%";
        
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

    squad.forEach((m, idx) => {
        if (m.active && idx !== controlledIndex) {
            m.x += (Math.random() - 0.5) * 1.0;
            m.y += (Math.random() - 0.5) * 1.0;
        }

        if (Math.hypot(m.x - monster.x, m.y - monster.y) < 18) {
            m.active = false;
            if (squad[controlledIndex].id === m.id) {
                switchCharacter();
            }
        }
    });

    let aliveCount = squad.filter(m => m.active).length;
    document.getElementById("squad-status").innerText = `${aliveCount} / 5`;

    if (aliveCount === 0) {
        triggerGameOver("Sabhi 5 dost mutant ka shikar ho gaye...");
    }

    if (Math.random() < 0.02) {
        radiationBlobs.push({ x: monster.x, y: monster.y, targetX: car.x, targetY: car.y });
    }

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

// Rendering Loop with Y-Sorting & Dynamic Horror Jumpscare Effect on Meme Face
function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let renderQueue = [];

    trees.forEach(t => {
        renderQueue.push({ type: 'tree', y: t.y, x: t.x });
    });

    renderQueue.push({ type: 'car', y: car.y, x: car.x });

    squad.forEach(m => {
        if (m.active) {
            renderQueue.push({ type: 'player', y: m.y, x: m.x, color: m.color, id: m.id });
        }
    });

    renderQueue.push({ type: 'monster', y: monster.y, x: monster.x });

    renderQueue.sort((a, b) => a.y - b.y);

    renderQueue.forEach(obj => {
        if (obj.type === 'tree') {
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.beginPath();
            ctx.ellipse(obj.x, obj.y + 6, 12, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#0e1f0e";
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#1b381b";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } 
        else if (obj.type === 'car') {
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(obj.x - 24, obj.y - 6, 48, 14);

            ctx.shadowBlur = 10;
            ctx.shadowColor = car.repair >= 100 ? "#00ff00" : "#ff3300";
            ctx.fillStyle = car.repair >= 100 ? "#0f3d0f" : "#3d0f0f";
            ctx.fillRect(obj.x - 22, obj.y - 12, 44, 20);
            ctx.strokeStyle = car.repair >= 100 ? "#00ff00" : "#ff3300";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(obj.x - 22, obj.y - 12, 44, 20);
            ctx.shadowBlur = 0;
        } 
        else if (obj.type === 'player') {
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.beginPath();
            ctx.ellipse(obj.x, obj.y + 4, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Check distance to monster to trigger scary horror red flash / glitch on the face
            let distToMonster = Math.hypot(obj.x - monster.x, obj.y - monster.y);
            let isScared = distToMonster < 90;

            ctx.save();
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, 14, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            if (isScared) {
                // Horror jump-scare tint (Red glowing eerie effect)
                ctx.fillStyle = "#ff0033";
                ctx.fillRect(obj.x - 14, obj.y - 14, 28, 28);
            }

            // Draw user's meme photo cropped circularly as the character face
            if (playerImg.complete && playerImg.naturalWidth !== 0) {
                ctx.drawImage(playerImg, obj.x - 14, obj.y - 14, 28, 28);
            } else {
                ctx.fillStyle = obj.color;
                ctx.fillRect(obj.x - 10, obj.y - 10, 20, 20);
            }
            ctx.restore();

            // Ring around active player
            if (obj.id === squad[controlledIndex].id) {
                ctx.strokeStyle = isScared ? "#ff0000" : "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 16, 0, Math.PI * 2);
                ctx.stroke();
            }
        } 
        else if (obj.type === 'monster') {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.beginPath();
            ctx.ellipse(obj.x, obj.y + 5, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 15;
            ctx.shadowColor = "#9900ff";
            ctx.fillStyle = "#8800cc";
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    ctx.shadowBlur = 8;
    ctx.shadowColor = "#00ffff";
    ctx.fillStyle = "#00ffff";
    radiationBlobs.forEach(blob => {
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, 4, 0, Math.PI * 2);
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
