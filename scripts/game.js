
let currentLevel = 0;
let player, cursors, door, spikes, platforms, infoText;
let jumpCount = 0;

class MainScene extends Phaser.Scene {
  constructor() { super("MainScene"); }

  preload() {
    this.load.image("player", "assets/player.png");
    this.load.image("platform", "assets/platform.png");
    this.load.image("door", "assets/door.png");
    this.load.image("spike", "assets/spike.png");
  }

  create() {
    this.loadLevel(currentLevel);
    cursors = this.input.keyboard.createCursorKeys();
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  loadLevel(index) {
    this.physics.world.gravity.y = levels[index].gravity;
    this.add.text(20, 20, levels[index].name, { fontSize: "20px", fill: "#fff" }).setScrollFactor(0);
    infoText = this.add.text(20, 50, levels[index].instruction, { fontSize: "16px", fill: "#ccc" }).setScrollFactor(0);

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 580, "platform").setScale(2, 0.5).refreshBody();
    platforms.create(400, 300, "platform");

    player = this.physics.add.sprite(100, 450, "player").setCollideWorldBounds(true);
    door = this.physics.add.staticSprite(700, 500, "door");
    spikes = this.physics.add.staticGroup();
    spikes.create(400, 570, "spike");

    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, door, this.reachDoor, null, this);
    this.physics.add.overlap(player, spikes, this.playerDies, null, this);
  }

  reachDoor() {
    if (levels[currentLevel].winCondition === "reachDoor") {
      this.nextLevel();
    }
  }

  playerDies() {
    if (levels[currentLevel].winCondition === "die" || levels[currentLevel].winCondition === "dieTwice") {
      this.nextLevel();
    } else {
      player.setPosition(100, 450);
    }
  }

  nextLevel() {
    currentLevel++;
    if (currentLevel >= levels.length) {
      currentLevel = 0;
      this.scene.start("MenuScene");
    } else {
      this.scene.restart();
    }
  }

  update() {
    let speed = 160;
    if (levels[currentLevel].invertedControls) speed *= -1;

    if (cursors.left.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown) player.setVelocityX(speed);
    else player.setVelocityX(0);

    if ((cursors.up.isDown || cursors.space.isDown) && player.body.touching.down) {
      player.setVelocityY(levels[currentLevel].gravity > 0 ? -330 : 330);
    }

    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) this.scene.restart();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: "arcade", arcade: { gravity: { y: 300 }, debug: false } },
  scene: [MenuScene, MainScene]
};
new Phaser.Game(config);
