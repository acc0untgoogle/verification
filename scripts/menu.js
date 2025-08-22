
class MenuScene extends Phaser.Scene {
  constructor() { super("MenuScene"); }

  create() {
    this.add.text(400, 200, "تلك الغرفة مجددًا", { fontSize: "40px", fill: "#fff" }).setOrigin(0.5);
    this.add.text(400, 300, "اضغط مفتاح المسافة للبدء", { fontSize: "24px", fill: "#ccc" }).setOrigin(0.5);

    this.input.keyboard.on("keydown-SPACE", () => {
      this.scene.start("MainScene");
    });
  }
}
