document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const healthElement = document.getElementById('health');
    const ammoElement = document.getElementById('ammo');
    const weaponButtons = document.querySelectorAll('.weapon-btn');
    
    // ضبط حجم الكانفاس
    canvas.width = 800;
    canvas.height = 400;
    
    // حالة اللعبة
    const gameState = {
        score: 0,
        health: 100,
        enemies: [],
        bullets: [],
        lastEnemySpawn: 0,
        enemySpawnRate: 2000, // كل 2 ثانية
        mouseX: 0,
        mouseY: 0,
        player: {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 40,
            height: 60,
            speed: 5
        },
        weapons: {
            pistol: {
                name: 'مسدس',
                damage: 25,
                ammo: 30,
                maxAmmo: 30,
                fireRate: 500, // كل نصف ثانية
                lastFired: 0,
                color: '#f9b208',
                bulletSpeed: 10,
                bulletSize: 5
            },
            rifle: {
                name: 'بندقية',
                damage: 15,
                ammo: 90,
                maxAmmo: 90,
                fireRate: 100,
                lastFired: 0,
                color: '#e94560',
                bulletSpeed: 15,
                bulletSize: 3
            },
            shotgun: {
                name: 'شوتغن',
                damage: 40,
                ammo: 24,
                maxAmmo: 24,
                fireRate: 1000,
                lastFired: 0,
                color: '#00b4d8',
                bulletSpeed: 8,
                bulletSize: 8,
                spread: 0.2
            }
        },
        currentWeapon: 'pistol'
    };
    
    // اختيار السلاح
    weaponButtons.forEach(button => {
        button.addEventListener('click', () => {
            weaponButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            gameState.currentWeapon = button.dataset.weapon;
        });
    });
    
    // متابعة حركة الفأرة
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        gameState.mouseX = e.clientX - rect.left;
        gameState.mouseY = e.clientY - rect.top;
    });
    
    // إطلاق النار
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // زر الفأرة الأيسر
            fire();
        }
    });
    
    function fire() {
        const now = Date.now();
        const weapon = gameState.weapons[gameState.currentWeapon];
        
        if (weapon.ammo <= 0) return;
        if (now - weapon.lastFired < weapon.fireRate) return;
        
        weapon.lastFired = now;
        weapon.ammo--;
        updateAmmo();
        
        // حساب اتجاه الرصاصة
        const angle = Math.atan2(
            gameState.mouseY - gameState.player.y,
            gameState.mouseX - gameState.player.x
        );
        
        // إنشاء الرصاصة/الرصاصات
        if (gameState.currentWeapon === 'shotgun') {
            // الشوتغن يطلق عدة رصاصات باتجاهات متفرقة قليلاً
            for (let i = 0; i < 5; i++) {
                const spreadAngle = angle + (Math.random() - 0.5) * weapon.spread;
                createBullet(spreadAngle, weapon);
            }
        } else {
            createBullet(angle, weapon);
        }
    }
    
    function createBullet(angle, weapon) {
        gameState.bullets.push({
            x: gameState.player.x,
            y: gameState.player.y,
            dx: Math.cos(angle) * weapon.bulletSpeed,
            dy: Math.sin(angle) * weapon.bulletSpeed,
            size: weapon.bulletSize,
            color: weapon.color,
            damage: weapon.damage
        });
    }
    
    function spawnEnemy() {
        const size = 30 + Math.random() * 20;
        const x = Math.random() * (canvas.width - size);
        
        gameState.enemies.push({
            x: x,
            y: -size,
            width: size,
            height: size,
            speed: 1 + Math.random() * 2,
            health: 50 + Math.random() * 50,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
    }
    
    function update() {
        const now = Date.now();
        
        // توليد أعداء جدد
        if (now - gameState.lastEnemySpawn > gameState.enemySpawnRate) {
            spawnEnemy();
            gameState.lastEnemySpawn = now;
            
            // زيادة صعوبة اللعبة مع الوقت
            gameState.enemySpawnRate = Math.max(500, gameState.enemySpawnRate - 50);
        }
        
        // تحديث موقع الأعداء
        gameState.enemies.forEach(enemy => {
            enemy.y += enemy.speed;
            
            // اكتشاف الاصطدام مع اللاعب
            if (
                enemy.y + enemy.height > gameState.player.y &&
                enemy.x < gameState.player.x + gameState.player.width &&
                enemy.x + enemy.width > gameState.player.x
            ) {
                gameState.health -= 10;
                updateHealth();
                enemy.health = 0; // تدمير العدو
            }
        });
        
        // تحديث موقع الرصاصات
        gameState.bullets.forEach(bullet => {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
        });
        
        // اكتشاف اصطدام الرصاصات بالأعداء
        gameState.bullets.forEach((bullet, bulletIndex) => {
            gameState.enemies.forEach((enemy, enemyIndex) => {
                if (
                    bullet.x > enemy.x &&
                    bullet.x < enemy.x + enemy.width &&
                    bullet.y > enemy.y &&
                    bullet.y < enemy.y + enemy.height
                ) {
                    enemy.health -= bullet.damage;
                    gameState.bullets.splice(bulletIndex, 1);
                    
                    if (enemy.health <= 0) {
                        gameState.score += Math.floor(enemy.width);
                        updateScore();
                        gameState.enemies.splice(enemyIndex, 1);
                    }
                }
            });
        });
        
        // إزالة الرصاصات التي خرجت من الشاشة
        gameState.bullets = gameState.bullets.filter(bullet => 
            bullet.x >= 0 && bullet.x <= canvas.width &&
            bullet.y >= 0 && bullet.y <= canvas.height
        );
        
        // إزالة الأعداء الذين خرجوا من الشاشة
        gameState.enemies = gameState.enemies.filter(enemy => 
            enemy.y <= canvas.height
        );
        
        // تحقق من انتهاء اللعبة
        if (gameState.health <= 0) {
            alert(`انتهت اللعبة! النقاط النهائية: ${gameState.score}`);
            resetGame();
        }
    }
    
    function draw() {
        // مسح الشاشة
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // رسم اللاعب (الشخصية)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            gameState.player.x - gameState.player.width / 2,
            gameState.player.y - gameState.player.height,
            gameState.player.width,
            gameState.player.height
        );
        
        // رسم السلاح
        const weapon = gameState.weapons[gameState.currentWeapon];
        ctx.strokeStyle = weapon.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(gameState.player.x, gameState.player.y - gameState.player.height / 2);
        ctx.lineTo(gameState.mouseX, gameState.mouseY);
        ctx.stroke();
        
        // رسم الأعداء
        gameState.enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // رسم شريط الصحة
            const healthPercent = Math.max(0, Math.min(1, enemy.health / 100));
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * healthPercent, 5);
        });
        
        // رسم الرصاصات
        gameState.bullets.forEach(bullet => {
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    function updateScore() {
        scoreElement.textContent = gameState.score;
    }
    
    function updateHealth() {
        healthElement.textContent = gameState.health;
    }
    
    function updateAmmo() {
        const weapon = gameState.weapons[gameState.currentWeapon];
        ammoElement.textContent = `${weapon.ammo}/${weapon.maxAmmo}`;
    }
    
    function resetGame() {
        gameState.score = 0;
        gameState.health = 100;
        gameState.enemies = [];
        gameState.bullets = [];
        gameState.enemySpawnRate = 2000;
        
        // إعادة تعيين الذخيرة لكل الأسلحة
        Object.keys(gameState.weapons).forEach(weapon => {
            gameState.weapons[weapon].ammo = gameState.weapons[weapon].maxAmmo;
        });
        
        updateScore();
        updateHealth();
        updateAmmo();
    }
    
    // حلقة اللعبة الرئيسية
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    // بدء اللعبة
    resetGame();
    gameLoop();
});
