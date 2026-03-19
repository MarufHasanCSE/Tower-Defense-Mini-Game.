const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hpEl = document.getElementById('hp');
const moneyEl = document.getElementById('money');

let hp = 10;
let money = 100;
let enemies = [];
let towers = [];
let frame = 0;

const path = [
    { x: 0, y: 200 },
    { x: 150, y: 200 },
    { x: 150, y: 100 },
    { x: 450, y: 100 },
    { x: 450, y: 300 },
    { x: 600, y: 300 }
];

function spawnEnemy() {
    enemies.push({
        x: path[0].x,
        y: path[0].y,
        pathIndex: 0,
        hp: 50,
        speed: 1.5
    });
}

function update() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const target = path[e.pathIndex + 1];

        if (target) {
            const dx = target.x - e.x;
            const dy = target.y - e.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 2) {
                e.pathIndex++;
            } else {
                e.x += (dx / dist) * e.speed;
                e.y += (dy / dist) * e.speed;
            }
        } else {
            enemies.splice(i, 1);
            hp--;
            hpEl.textContent = hp;
        }
    }

    towers.forEach(t => {
        t.cooldown--;
        if (t.cooldown <= 0) {
            const target = enemies.find(e => Math.hypot(e.x - t.x, e.y - t.y) < t.range);
            if (target) {
                target.hp -= 10;
                t.cooldown = 30;
                t.targetLine = { x: target.x, y: target.y, alpha: 1 };
                if (target.hp <= 0) {
                    enemies.splice(enemies.indexOf(target), 1);
                    money += 20;
                    moneyEl.textContent = money;
                }
            }
        }
    });

    if (hp <= 0) {
        alert("Base Overrun!");
        location.reload();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 40;
    ctx.beginPath();
    path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    enemies.forEach(e => {
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    towers.forEach(t => {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(t.x - 15, t.y - 15, 30, 30);
        
        if (t.targetLine && t.targetLine.alpha > 0) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${t.targetLine.alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);
            ctx.lineTo(t.targetLine.x, t.targetLine.y);
            ctx.stroke();
            t.targetLine.alpha -= 0.1;
        }
    });

    update();
    frame++;
    if (frame % 100 === 0) spawnEnemy();
    requestAnimationFrame(draw);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (money >= 50) {
        towers.push({ x, y, range: 120, cooldown: 0, targetLine: null });
        money -= 50;
        moneyEl.textContent = money;
    }
});

draw();