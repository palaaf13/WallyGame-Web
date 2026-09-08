import Phaser from "phaser";

class MazeScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private bones!: Phaser.Physics.Arcade.Group;
    private boneCount = 0;
    private boneText!: Phaser.GameObjects.Text;

    private collectBone(
        player: Phaser.GameObjects.GameObject,
        bone: Phaser.GameObjects.GameObject
    ) {
        bone.destroy();

        this.boneCount++;

        this.boneText.setText(`Bones: ${this.boneCount}`);
    }

    constructor() {
        super("MazeScene");
    }

    preload() {
    this.load.image("dog", "/assets/dog.png");
    this.load.image("grass", "/assets/tiles/grass.jpg");
    this.load.image("RockTile", "/assets/tiles/RockTile.png");
    this.load.image("bone", "/assets/bone.png");

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

    const objectLayer = map.getObjectLayer("bone");

    this.bones = this.physics.add.group();

    objectLayer?.objects.forEach((object) => {
    if (object.name === "Bone") {
        const bone = this.bones.create(
            object.x!,
            object.y!,
            "bone"
        );

        bone.setDisplaySize(32, 32);
    }
    });

    this.player = this.physics.add.sprite(100, 100, "dog");
    this.player.setDisplaySize(50, 70);
    this.player.setCollideWorldBounds(true);

    this.physics.add.overlap(
        this.player,
        this.bones,
        this.collectBone,
        undefined,
        this
    );

    this.boneText = this.add.text(20, 20, "Bones: 0", {
        fontSize: "28px",
        color: "#ffffff",
        backgroundColor: "#f77a05",
        padding: {
            x: 10,
            y: 5
        }
    });

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