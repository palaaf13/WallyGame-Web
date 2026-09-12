import Phaser from "phaser";

class MazeScene extends Phaser.Scene {
    // ============================================================
    // LEVEL
    // ============================================================

    private currentLevel = 1;
    

    // ============================================================
    // PLAYER
    // ============================================================

    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;


    // ============================================================
    // BONES / COLLECTIBLES
    // ============================================================

    private bones!: Phaser.Physics.Arcade.Group;
    private boneCount = 0;


    // ============================================================
    // UI
    // ============================================================

    private boneText!: Phaser.GameObjects.Text;
    private instructions!: Phaser.GameObjects.Text;
    

    


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor() {
        super("MazeScene");
    }

    init(data: { level?: number }) {
        this.currentLevel = data.level ?? 1;
    }

    // ============================================================
    // PRELOAD
    // Load all images, tilesets, and maps here
    // ============================================================

    preload() {

        // -------------------------
        // Player
        // -------------------------

        this.load.image(
            "dog",
            "/assets/dog.png"
        );


        // -------------------------
        // Environment / Tiles
        // -------------------------

        this.load.image(
            "grass",
            "/assets/tiles/grass.jpg"
        );

        this.load.image(
            "RockTile",
            "/assets/tiles/RockTile.png"
        );

        this.load.image(
            "plant repack_0",
            "/assets/tiles/plant repack_0.png"
        );

        this.load.image(
            "tileset1",
            "/assets/tiles/tileset1.png"
        );


        // -------------------------
        // Collectibles
        // -------------------------

        this.load.image(
            "bone",
            "/assets/bone.png"
        );


        // -------------------------
        // Tiled Maps
        // -------------------------

        this.load.tilemapTiledJSON(
            "level1",
            "/maps/level1.tmj"
        );

        this.load.tilemapTiledJSON(
            "level2",
            "/maps/level2.tmj"
        );
    }


    // ============================================================
    // CREATE
    // Set up the level, player, collectibles, UI, and collisions
    // ============================================================

    create() {

        // ========================================================
        // LOAD LEVEL 1
        // ========================================================

        const mapKey = this.currentLevel === 1
            ? "level1"
            : "level2";

        const map = this.make.tilemap({
            key: mapKey
        });


        // ========================================================
        // LOAD TILESETS
        // These names must match the tileset names in Tiled
        // ========================================================

        let wallsLayer: Phaser.Tilemaps.TilemapLayer;

        if (this.currentLevel === 1) {

            const grassTileset = map.addTilesetImage("grass", "grass");
            const rockTileset = map.addTilesetImage("RockTile", "RockTile");
            const plantTileset = map.addTilesetImage(
                "Plants",
                "plant repack_0"
            );

            map.createLayer("Ground", grassTileset!);
            map.createLayer("plant", plantTileset!);

            

            wallsLayer = map.createLayer(
                "walls",
                rockTileset!
            )!;

        } else {

            const tileset1 = map.addTilesetImage(
                "tileset1",
                "tileset1"
            );

            map.createLayer(
                "ground_under_walls",
                tileset1!
            );

            map.createLayer(
                "ground",
                tileset1!
            );

            wallsLayer = map.createLayer(
                "walls",
                tileset1!
            )!;
        }


        // ========================================================
        // WORLD BOUNDS
        // Makes the physics world match the Tiled map size
        // ========================================================

        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );


        // ========================================================
        // WALL COLLISION
        // Makes all non-empty tiles in the walls layer solid
        // ========================================================

        wallsLayer!.setCollisionByExclusion([-1]);


        // ========================================================
        // BONE OBJECTS
        // Read the bone objects placed in Tiled
        // ========================================================

        const objectLayer = map.getObjectLayer("bone");

        // Create a Phaser physics group for the bones
        this.bones = this.physics.add.group();


        // Loop through every object in the Tiled bone layer
        objectLayer?.objects.forEach((object) => {

            // Only create a bone if the object is named "Bone"
            if (object.name === "Bone") {

                const bone = this.bones.create(
                    object.x! + 16,
                    object.y! - 16,
                    "bone"
                );

                // Make the bone 32x32
                bone.setDisplaySize(32, 32);
            }
        });


        // ========================================================
        // PLAYER
        // ========================================================

        this.player = this.physics.add.sprite(
            100,
            100,
            "dog"
        );

        // Player size
        this.player.setDisplaySize(
            25,
            35
        );

        // Prevent the dog from leaving the game world
        this.player.setCollideWorldBounds(true);

        if (this.currentLevel === 1) {

            const exitLayer = map.getObjectLayer("level1_exit");

            const exitObject = exitLayer?.objects.find(
                (object) => object.name === "exit_square1"
            );

            if (exitObject) {

                const exit = this.add.rectangle(
                    exitObject.x! + exitObject.width! / 2,
                    exitObject.y! + exitObject.height! / 2,
                    exitObject.width!,
                    exitObject.height!
                );

                this.physics.add.existing(exit, true);

                this.physics.add.overlap(
                    this.player,
                    exit,
                    () => {
                        console.log("EXIT REACHED!");
                        this.scene.restart({ level: 2 });
                    }
                );
            }
        }


        // ========================================================
        // UI - BONE COUNTER
        // ========================================================

        this.boneText = this.add.text(
            20,
            20,
            "Bones: 0",
            {
                fontSize: "28px",
                color: "#ffffff",
                backgroundColor: "#f77a05",
                padding: {
                    x: 10,
                    y: 5
                }
            }
        );


        // ========================================================
        // UI - INSTRUCTIONS
        // ========================================================

        this.instructions = this.add.text(
            20,
            520,
            "Use arrow keys to move, collect bones!",
            {
                fontSize: "20px",
                color: "#ffffff",
                backgroundColor: "#3a6451",
                padding: {
                    x: 10,
                    y: 5
                }
            }
        );


        // ========================================================
        // BONE COLLECTION
        // Detect when the dog touches a bone
        // ========================================================

        this.physics.add.overlap(
            this.player,
            this.bones,
            this.collectBone,
            undefined,
            this
        );


        // ========================================================
        // WALL COLLISION
        // Prevent the dog from walking through walls
        // ========================================================

        this.physics.add.collider(
            this.player,
            wallsLayer!
        );


        // ========================================================
        // KEYBOARD CONTROLS
        // ========================================================

        this.cursors =
            this.input.keyboard!.createCursorKeys();
    }


    // ============================================================
    // UPDATE
    // Runs every frame and handles player movement
    // ============================================================

    update() {

        // Player movement speed
        const speed = 200;


        // Stop the dog before checking for input
        this.player.setVelocity(0);


        // -------------------------
        // Move Left
        // -------------------------

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        }


        // -------------------------
        // Move Right
        // -------------------------

        if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }


        // -------------------------
        // Move Up
        // -------------------------

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        }


        // -------------------------
        // Move Down
        // -------------------------

        if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        
    }


    // ============================================================
    // COLLECT BONE
    // Called when the player touches a bone
    // ============================================================

    private collectBone(
        player: Phaser.GameObjects.GameObject,
        bone: Phaser.GameObjects.GameObject
    ) {

        // Remove the bone from the game
        bone.destroy();


        // Increase the bone counter
        this.boneCount++;


        // Update the UI
        this.boneText.setText(
            `Bones: ${this.boneCount}`
        );
    }

    
}



// =================================================================
// PHASER GAME CONFIGURATION
// =================================================================

const config: Phaser.Types.Core.GameConfig = {

    // Automatically choose WebGL or Canvas
    type: Phaser.AUTO,

    // HTML element where Phaser is placed
    parent: "app",

    // Game resolution
    width: 800,
    height: 576,

    // Background color
    backgroundColor: "#87CEEB",

    // Physics settings
    physics: {
        default: "arcade",

        arcade: {
            debug: false
        }
    },

    // Game scenes
    scene: MazeScene
};


// =================================================================
// START GAME
// =================================================================

new Phaser.Game(config);