const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// اللاعب
const player = {
    x: 400,
    y: 300,
    speed: 5,
    health: 100,
    ammo: 30,
    kills: 0
};

// الأعداء (Bots)
const enemies = [];
for (let i = 0; i < 5; i++) {
    enemies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        health: 100
    });
}

// الأسلحة
const weapons = {
    pistol: { damage: 25, ammo: 12, fireRate: 500 },
    rifle: { damage: 15, ammo: 30, fireRate: 100 }
};
let currentWeapon = 'pistol';

// التحكم بالحركة
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// التصويب
canvas.addEventListener('click', () => {
    if (player.ammo > 0) {
        player.ammo--;
        document.getElementById('ammo').textContent = player.ammo;
        
        // اكتشاف إصابة العدو
        enemies.forEach(enemy => {
            const distance = Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2);
            if (distance < 50) {
                enemy.health -= weapons[currentWeapon].damage;
                if (enemy.health <= 0) {
                    player.kills++;
                    document.getElementById('kills').textContent = player.kills;
                }
            }
        });
    }
});

// تحديث اللعبة
function update() {
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;
}

// الرسم
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم اللاعب
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x - 10, player.y - 10, 20, 20);
    
    // رسم الأعداء
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => {
        if (enemy.health > 0) {
            ctx.fillRect(enemy.x - 10, enemy.y - 10, 20, 20);
        }
    });
}

// حلقة اللعبة
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
