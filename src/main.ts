import Phaser from "phaser";

class MazeScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super("MazeScene");
    }

    preload() {
    this.load.image("dog", "/assets/dog.png");
    this.load.image("grass", "/assets/tiles/grass.jpg");
    this.load.image("RockTile", "/assets/tiles/RockTile.png");

    this.load.tilemapTiledJSON("level1", "/maps/level1.tmj");
    }

    create() {
    const map = this.make.tilemap({
        key: "level1"
    });

    const grassTileset = map.addTilesetImage(
        "grass",
        "grass"
    );

    const rockTileset = map.addTilesetImage(
        "RockTile",
        "RockTile"
    );

    map.createLayer("Ground", grassTileset!);

    const wallsLayer = map.createLayer(
        "walls",
        rockTileset!
    );

    this.physics.world.setBounds(
    0,
    0,
    map.widthInPixels,
    map.heightInPixels
    );

    wallsLayer!.setCollisionByExclusion([-1]);

    this.player = this.physics.add.sprite(150, 150, "dog");
    this.player.setDisplaySize(50, 70);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(
    this.player,
    wallsLayer!
    );

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
    parent: "app",

    width: 800,
    height: 576,

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