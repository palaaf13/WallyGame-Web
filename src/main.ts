import Phaser from "phaser";

class MazeScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super("MazeScene");
    }

    preload() {
        this.load.image("dog", "/assets/dog.png");
    }

    create() {
    this.add.text(500, 80, "DOG MAZE", {
        fontSize: "48px",
        color: "#ffffff"
    }).setOrigin(0.5);

    // Create the player
    this.player = this.physics.add.sprite(
        150,
        150,
        "dog"
    );

    // Resize the dog
    this.player.setDisplaySize(80, 100);

    // Keep the dog inside the game
    this.player.setCollideWorldBounds(true);

    // Keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    
    }

    update() {
        const speed = 200;

        // Stop the dog before checking movement
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        }

        if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        }

        if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,

    width: 1000,
    height: 700,

    backgroundColor: "#87CEEB",

    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },

    scene: MazeScene
};

new Phaser.Game(config);