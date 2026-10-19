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

    // Enemies
    private enemy!: Phaser.Physics.Arcade.Sprite;
    private enemyDirection = 1;
    private enemySpeed = 150;

    private enemyLeft = 0;
    private enemyRight = 0;

    private enemy2!: Phaser.Physics.Arcade.Sprite;

    private enemy2DirectionX = 1;
    private enemy2DirectionY = 1;
    private enemy2Speed = 250;

    // Patrol rectangle taken from Tiled
    private enemy2Left = 0;
    private enemy2Right = 0;
    private enemy2Top = 0;
    private enemy2Bottom = 0;

    // 0 = horizontal, 1 = diagonal, 2 = vertical
    private enemy2PatrolMode = 0;
    private enemy2ModeTimer = 0;
    private enemy2ModeDuration = 2500;

    // Fireball projectiles
    private fireballs!: Phaser.Physics.Arcade.Group;
    private enemyFireballTimer = 0;
    private enemyFireballCooldown = 1000; // 1.5 seconds
    private enemyFireballSpeed = 250;


    // ============================================================
    // BONES / COLLECTIBLES
    // ============================================================

    private bones!: Phaser.Physics.Arcade.Group;
    private boneCount = 0;

    private keys!: Phaser.Physics.Arcade.Group;
    private keyCount = 0;


    // ============================================================
    // UI
    // ============================================================

    private boneText!: Phaser.GameObjects.Text;

    // LOSE CODE
    private isLosing = false;
    
    

    


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor() {
        super("MazeScene");
    }

    init(data: { level?: number }) {
        this.currentLevel = data.level ?? 1;
        this.isLosing = false;
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
            `${import.meta.env.BASE_URL}assets/dog.png`
        );

        // Enemies
        this.load.image(
            "enemy-walk1",
            `${import.meta.env.BASE_URL}assets/enemy-walk1.png`
        );

        this.load.image(
            "enemy-walk2",
            `${import.meta.env.BASE_URL}assets/enemy-walk2.png`
        );

        // Enemy 2
        this.load.image(
            "dog2",
            `${import.meta.env.BASE_URL}assets/dog2.png`
        );


        // -------------------------
        // Environment / Tiles
        // -------------------------

        this.load.image(
            "grass",
            `${import.meta.env.BASE_URL}assets/tiles/grass.jpg`
        );

        this.load.image(
            "RockTile",
            `${import.meta.env.BASE_URL}assets/tiles/RockTile.png`
        );

        this.load.image(
            "plant repack_0",
            `${import.meta.env.BASE_URL}assets/tiles/plant repack_0.png`
        );

        this.load.image(
            "tileset1",
            `${import.meta.env.BASE_URL}assets/tiles/tileset1.png`
        );


        // -------------------------
        // Collectibles
        // -------------------------

        this.load.image(
            "bone",
            `${import.meta.env.BASE_URL}assets/bone.png`
        );

        this.load.image(
            "key",
            `${import.meta.env.BASE_URL}assets/key.png`
        );

        // -------------------------
        // Tiled Maps
        // -------------------------

        this.load.tilemapTiledJSON(
            "level1",
            `${import.meta.env.BASE_URL}maps/level1.tmj`
        );

        this.load.tilemapTiledJSON(
            "level2",
            `${import.meta.env.BASE_URL}maps/level2.tmj`
        );

        this.load.tilemapTiledJSON(
            "boss_level",
            `${import.meta.env.BASE_URL}maps/boss_level.tmj`
        );

        // LOSE ANIMATION
        
        this.load.video(
            "loseVideo",
            `${import.meta.env.BASE_URL}assets/lose-animation.mp4`
        );

        this.load.image(
        "fireball",
        `${import.meta.env.BASE_URL}assets/fireball.png`
        );

    }

    // Enemy Animations
    private createEnemyAnimation() {
        this.anims.create({
            key: "enemy-walk",
            frames: [
                { key: "enemy-walk1" },
                { key: "enemy-walk2" }
            ],
            frameRate: 6,
            repeat: -1
        });
    }

    

    // ============================================================
    // Temporary Text Display
    // ============================================================

    
    private showNotification(
        x: number,
        y: number,
        message: string,
        color = "#ffcc00"
    ): void {
        const notifyText = this.add.text(x, y, message, {
            fontSize: "28px",
            fontStyle: "bold",
            color: color,
            backgroundColor: "#222222",
            padding: {
                x: 16,
                y: 10
            },
            stroke: "#000000",
            strokeThickness: 5
        });

        notifyText.setOrigin(0.5);
        notifyText.setScrollFactor(0);
        notifyText.setDepth(2000);

        this.tweens.add({
            targets: notifyText,
            y: y - 40,
            alpha: 0,
            duration: 2000,
            ease: "Cubic.easeOut",
            onComplete: () => {
                notifyText.destroy();
            }
        });
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
            : this.currentLevel === 2
            ? "level2"
            : "boss_level";

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
            const keyTileset = map.addTilesetImage("key", "key");

            map.createLayer("Ground", grassTileset!);
            map.createLayer("plant", plantTileset!);
            map.createLayer("key", keyTileset!);
            

            wallsLayer = map.createLayer(
                "walls",
                rockTileset!
            )! as Phaser.Tilemaps.TilemapLayer;

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
            )! as Phaser.Tilemaps.TilemapLayer;
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
        // KEY OBJECTS
        // Read the key objects placed in Tiled
        // ========================================================

        const keyLayer = map.getObjectLayer("key");

        // Create a Phaser physics group for the keys
        this.keys = this.physics.add.group();


        // Loop through every object in the Tiled key layer
        keyLayer?.objects.forEach((object) => {

            // Only create a key if the object is named "key"
            if (object.name === "key") {

                const key = this.keys.create(
                    object.x! + 16,
                    object.y! - 16,
                    "key"
                );

                // Make the key 32x32
                key.setDisplaySize(32, 32);
            }
        }
        
    );


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

        if (this.currentLevel === 3) {
            // Position the player in the boss level
            this.player.setPosition(682, 172);

            // Find enemy_bounds in the Tiled "exit" object layer
            const exitLayer = map.getObjectLayer("exit");

            const boundsObject = exitLayer?.objects.find(
                (object) => object.name === "enemy_bounds"
            );

            if (
                boundsObject &&
                boundsObject.width !== undefined &&
                boundsObject.height !== undefined
            ) {
                // Use the rectangle in Tiled as the patrol area
                this.enemy2Left = boundsObject.x!;
                this.enemy2Right = boundsObject.x! + boundsObject.width;
                this.enemy2Top = boundsObject.y!;
                this.enemy2Bottom = boundsObject.y! + boundsObject.height;

                // Start near the center of the patrol area
                this.enemy2 = this.physics.add.sprite(
                    (this.enemy2Left + this.enemy2Right) / 2,
                    (this.enemy2Top + this.enemy2Bottom) / 2,
                    "dog2"
                );

                this.enemy2.setDisplaySize(38, 38);
                this.enemy2.setCollideWorldBounds(true);

                // Prevent the enemy from passing through walls
                this.physics.add.collider(this.enemy2, wallsLayer!);

                // Start moving horizontally
                this.enemy2DirectionX = 1;
                this.enemy2DirectionY = 1;
                this.enemy2PatrolMode = 0;
                this.enemy2ModeTimer = 0;

                this.enemy2.setVelocityX(this.enemy2Speed);
                this.enemy2.setVelocityY(0);
            } else {
                console.warn(
                    'Could not find "enemy_bounds" in the Tiled "exit" layer.'
                );
            }

            
        }
        

        if (this.currentLevel === 2) {

            // Find the object layer from Tiled
            const loseLayer = map.getObjectLayer("lose_object_layer1");

            const exitLayer2 = map.getObjectLayer("entrance-1");

            // Find the rectangle named ground_hole
            const hole = loseLayer?.objects.find(
                (object) => object.name === "ground_hole"
            );

            // Find boss entrance rectangle
            const entrance = exitLayer2?.objects.find(
                (object) => object.name === "boss_entrance"
            );

            // Boss entrance logic
            if (entrance) {

                const exit = this.add.rectangle(
                    entrance.x! + entrance.width! / 2,
                    entrance.y! + entrance.height! / 2,
                    entrance.width!,
                    entrance.height!
                );

                this.physics.add.existing(exit, true);
                
                
                this.physics.add.overlap(
                    this.player,
                    exit,
                    () => {
                        if (this.boneCount >= 9) {
                            console.log("EXIT REACHED!");
                            this.scene.restart({ level: 3 });
                        } else {
                            this.showNotification(
                                400,
                                288,
                                `Collect ${9 - this.boneCount} more bones!`,
                                "#ff3333"
                            );
                        }
                    }
                );
            
                
            }

            if (hole && hole.width !== undefined && hole.height !== undefined) {

                // Create an invisible rectangle at the object's position
                const loseZone = this.add.rectangle(
                    hole.x! + hole.width / 2,
                    hole.y! + hole.height / 2,
                    hole.width,
                    hole.height,
                    0xff0000,
                    0
                );

                // Give the rectangle a static physics body
                this.physics.add.existing(loseZone, true);

                // Detect when the dog enters the zone
                
                this.physics.add.overlap(this.player, loseZone, () => {
                    if (this.isLosing) return;

                    this.isLosing = true;
                    this.boneCount = 3;

                    console.log("GROUND HOLE REACHED!");

                    this.playLoseAnimation();
                });

            } else {
                console.warn(
                    "Could not find ground_hole in lose_object_layer1"
                );
            }
        }


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
                        if (this.boneCount >= 3) {
                            console.log("EXIT REACHED!");
                            this.scene.restart({ level: 2 });
                        } else {
                            this.showNotification(
                                400,
                                288,
                                `Collect ${3 - this.boneCount} more bones!`,
                                "#ff3333"
                            );
                        }
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

        this.add.text(
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
        // Temporary Text
        // ========================================================

        


        // ========================================================
        // BONE/KEY COLLECTION
        // Detect when the dog touches a bone or key
        // ========================================================

        this.physics.add.overlap(
            this.player,
            this.bones,
            (_player, bone) => {
                (bone as Phaser.GameObjects.GameObject).destroy();

                this.boneCount++;

                this.boneText.setText(
                    `Bones: ${this.boneCount}`
                );
            }
        );

        this.physics.add.overlap(
            this.player,
            this.keys,
            (_player, key) => {
                (key as Phaser.GameObjects.GameObject).destroy();

                this.keyCount++;

                this.showNotification(
                    400,
                    288,
                    "You found a key!",
                    "#00ff00"
                );
            }
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

        // Enemy

        this.createEnemyAnimation();

        if (this.currentLevel === 2) {
            // Patrol range inside the bottom corridor
            this.enemyLeft = 216;
            this.enemyRight = 690;

            // Center of the corridor
            const enemyY = 420;

            this.enemy = this.physics.add.sprite(
                this.enemyLeft,
                enemyY,
                "enemy-walk1"
            );

            this.enemy.play("enemy-walk");

            this.enemy.setDisplaySize(38, 38);
            this.enemy.setCollideWorldBounds(true);

            // Stop the enemy from walking through stone walls
            this.physics.add.collider(this.enemy, wallsLayer!);

            // Start walking right
            this.enemyDirection = 1;
            this.enemy.setVelocityX(this.enemySpeed);
        }

        
        // Lose condition: If the player touches the enemy, they lose and restart the level.

        this.physics.add.overlap(this.player, this.enemy, () => {
            if (this.isLosing) {
                this.player.setVelocity(0, 0);
                return;
            }

            this.isLosing = true;
            this.boneCount = 3;
            
            // Stop the player and enemy.
            this.player.setVelocity(0, 0);
            this.enemy.setVelocity(0, 0);

            // Show the notification first.
            this.showNotification(
                400,
                288,
                "You lost!",
                "#ff3333"
            );

            // Restart Level 2 after the notification has time to show.
            this.time.delayedCall(2000, () => {
                this.scene.restart({ level: 2 });
            });       
        });

        // Lose condition for Boss Level (Level 3): If the player touches the enemy, they lose and restart the level.

        this.physics.add.overlap(this.player, this.enemy2, () => {
            if (this.isLosing) {
                this.player.setVelocity(0, 0);
                return;
            }

            this.isLosing = true;
            this.boneCount = 0;
            
            // Stop the player and enemy.
            this.player.setVelocity(0, 0);
            this.enemy2.setVelocity(0, 0);

            // Show the notification first.
            this.showNotification(
                400,
                288,
                "You lost!",
                "#ff3333"
            );

            // Restart Level 3 after the notification has time to show.
            this.time.delayedCall(2000, () => {
                this.scene.restart({ level: 3 });
            });       
        });

        // ============================================================
        // Fireball Projectiles for Boss Level (Level 3)
        // ========================================================

        // Create a group to manage the boss's fireballs
        this.fireballs = this.physics.add.group({
            defaultKey: "fireball",
            maxSize: 30
        });

        // Fireball hits player
        this.physics.add.overlap(
            this.player,
            this.fireballs,
            (_player, fireball) => {
                if (this.isLosing) return;

                this.isLosing = true;
                this.player.setVelocity(0, 0);
                this.enemy2.setVelocity(0, 0);

                // Remove the fireball that hit the player
                (fireball as Phaser.GameObjects.GameObject).destroy();

                this.showNotification(
                    400,
                    288,
                    "You got burned!",
                    "#ff3333"
                );

                // Restart the boss level after the message
                this.time.delayedCall(2000, () => {
                    this.scene.restart({ level: 3 });
                });
            }
        );

        // Fireballs disappear when they hit walls
        this.physics.add.collider(
            this.fireballs,
            wallsLayer!,
            (_fireball, wallObject) => {
                (wallObject as Phaser.GameObjects.GameObject).destroy();
            }
        );
    }

    
    private playLoseAnimation() {
        // Stop the player from moving.
        this.player.setVelocity(0, 0);

        // Pause the game physics during the animation.
        this.physics.world.pause();

        
        

        const video = this.add.video(
            this.scale.width / 2,
            this.scale.height / 2,
            "loseVideo"
        );

        video.setOrigin(0.5);
        video.setScrollFactor(0);
        video.setDepth(1000);
        video.setDisplaySize(100, 100);

        video.once("complete", () => {
            this.physics.world.resume();
            this.scene.restart({ level: 2 });
        });

        video.play(false);

    }

    private shootFireball(): void {
        if (!this.enemy2 || !this.player || this.isLosing) {
            return;
        }

        // Get a fireball from the group, or create one
        const fireball = this.fireballs.get(
            this.enemy2.x,
            this.enemy2.y,
            "fireball"
        ) as Phaser.Physics.Arcade.Sprite | null;

        if (!fireball) return;

        fireball.enableBody(true, this.enemy2.x, this.enemy2.y, true, true);
        fireball.setActive(true);
        fireball.setVisible(true);
        fireball.setDisplaySize(20, 20);

        // Calculate the angle from the enemy to the player's current position
        const angle = Phaser.Math.Angle.Between(
            this.enemy2.x,
            this.enemy2.y,
            this.player.x,
            this.player.y
        );

        // Give the fireball velocity toward the player
        this.physics.velocityFromRotation(
            angle,
            this.enemyFireballSpeed,
            fireball.body!.velocity
        );

        // Rotate the image to face the direction it travels
        fireball.setRotation(angle);

        // Remove it after 3 seconds if it doesn't hit anything
        this.time.delayedCall(3000, () => {
            if (fireball.active) {
                fireball.destroy();
            }
        });
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

        // Enemy patrol logic for level 2
        if (this.currentLevel === 2 && this.enemy) {
            if (this.enemy.x >= this.enemyRight) {
                this.enemyDirection = -1;
            } else if (this.enemy.x <= this.enemyLeft) {
                this.enemyDirection = 1;
            }

            this.enemy.setVelocityX(
                this.enemySpeed * this.enemyDirection
            );

            // Flip the sprite when moving left or right.
            this.enemy.setFlipX(this.enemyDirection < 0);
        }

        // Enemy 2 patrol logic for Boss Level (Level 3)
        if (this.currentLevel === 3 && this.enemy2 && !this.isLosing) {
            const halfWidth = this.enemy2.displayWidth / 2;
            const halfHeight = this.enemy2.displayHeight / 2;

            // Switch between horizontal, diagonal, and vertical movement
            this.enemy2ModeTimer += this.game.loop.delta;

            if (this.enemy2ModeTimer >= this.enemy2ModeDuration) {
                this.enemy2ModeTimer = 0;
                this.enemy2PatrolMode =
                    (this.enemy2PatrolMode + 1) % 3;
            }

            // Bounce off the left and right edges
            if (this.enemy2.x + halfWidth >= this.enemy2Right) {
                this.enemy2DirectionX = -1;
            } else if (this.enemy2.x - halfWidth <= this.enemy2Left) {
                this.enemy2DirectionX = 1;
            }

            // Bounce off the top and bottom edges
            if (this.enemy2.y + halfHeight >= this.enemy2Bottom) {
                this.enemy2DirectionY = -1;
            } else if (this.enemy2.y - halfHeight <= this.enemy2Top) {
                this.enemy2DirectionY = 1;
            }

            // Mode 0: Horizontal
            if (this.enemy2PatrolMode === 0) {
                this.enemy2.setVelocity(
                    this.enemy2Speed * this.enemy2DirectionX,
                    0
                );
            }

            // Mode 1: Diagonal
            else if (this.enemy2PatrolMode === 1) {
                this.enemy2.setVelocity(
                    this.enemy2Speed * this.enemy2DirectionX,
                    this.enemy2Speed * this.enemy2DirectionY
                );
            }

            // Mode 2: Vertical
            else {
                this.enemy2.setVelocity(
                    0,
                    this.enemy2Speed * this.enemy2DirectionY
                );
            }

            // Flip the sprite based on its current direction
            if (this.enemy2.body!.velocity.x !== 0) {
                this.enemy2.setFlipX(this.enemy2.body!.velocity.x < 0);
            }

            
        }
        // Fireball shooting logic for Boss Level (Level 3)

        // Boss shoots fireballs every 1.5 seconds
        if (this.currentLevel === 3 && this.enemy2 && !this.isLosing) {
            this.enemyFireballTimer += this.game.loop.delta;

            if (this.enemyFireballTimer >= this.enemyFireballCooldown) {
                this.enemyFireballTimer = 0;
                this.shootFireball();
            }
        }

        //Finish the game when the player collects the key in level 3
        if (this.currentLevel === 3) {
            if (this.keyCount === 1) {
                this.showNotification(
                    400,
                    288,
                    "You found the key! Game Over!",
                    "#00ff00"
                );
                this.physics.world.pause();
            }
        }

        
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