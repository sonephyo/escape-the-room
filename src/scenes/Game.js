import { Scene } from 'phaser';
import Character from '../classes/Character';
import DialogueBox from '../classes/DialogueBox';
import DialogueManager from '../classes/DialogueManager';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.controls = null;
        this.player = null;
        this.cursors = null;
        this.dialogueBox = null;
        this.spaceKey = null;
        this.activePhilosopher = null;
        this.dialogueManager = null;
        this.philosophers = [];
        this.labelsVisible = true;
        this.mapWidth = 0;
        this.mapHeight = 0;
    }

    preload() {
        this.load.image('campus_map', 'assets/campus_map.png');
    }

    create() {
        // Add campus map as background and get dimensions
        const mapImage = this.add.image(0, 0, 'campus_map').setOrigin(0, 0).setDepth(-1);
        this.mapWidth = mapImage.width;
        this.mapHeight = mapImage.height;

        let screenPadding = 20;
        let maxDialogueHeight = 200;

        // Set up philosophers at fixed positions
        this.philosophers = [];
        const philosopherConfigs = [
            { id: "socrates", name: "Socrates", x: 180, y: 80 },
            { id: "aristotle", name: "Aristotle", x: 1000, y: 80 },
            { id: "plato", name: "Plato", x: 180, y: 700 },
            { id: "descartes", name: "Descartes", x: 1000, y: 700 },
            { id: "leibniz", name: "Leibniz", x: 576, y: 384 },
            { id: "ada_lovelace", name: "Ada Lovelace", x: 576, y: 80 },
            { id: "turing", name: "Turing", x: 576, y: 700 },
            { id: "searle", name: "Searle", x: 180, y: 1400 },
            { id: "chomsky", name: "Chomsky", x: 1000, y: 1400 },
            { id: "dennett", name: "Dennett", x: 576, y: 1400 },
            { id: "miguel", name: "Miguel", x: 300, y: 1200 },
            { id: "paul", name: "Paul", x: 900, y: 1200 },
        ];
        philosopherConfigs.forEach(config => {
            this[config.id] = new Character(this, {
                id: config.id,
                name: config.name,
                spawnPoint: { x: config.x, y: config.y },
                atlas: config.id,
                defaultDirection: "front",
                worldLayer: null,
                handleCollisions: false
            });
            this.philosophers.push(this[config.id]);
        });
        this.togglePhilosopherLabels(true);

        // Set up player at a fixed position
        this.player = this.physics.add.sprite(100, 300, "sophia", "sophia-front")
            .setSize(30, 40)
            .setOffset(0, 6);

        this.createPlayerAnimations();
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.physics.world.setBoundsCollision(true, true, true, true);

        this.setupCamera();
        this.setupControls(this.cameras.main);
        this.setupDialogueSystem();

        this.dialogueBox = new DialogueBox(this);
        this.dialogueText = this.add
            .text(60, this.game.config.height - maxDialogueHeight - screenPadding + screenPadding, '', {
                font: "18px monospace",
                fill: "#ffffff",
                padding: { x: 20, y: 10 },
                wordWrap: { width: 680 },
                lineSpacing: 6,
                maxLines: 5
            })
            .setScrollFactor(0)
            .setDepth(30)
            .setVisible(false);

        this.spaceKey = this.input.keyboard.addKey('SPACE');
        
        // Initialize the dialogue manager
        this.dialogueManager = new DialogueManager(this);
        this.dialogueManager.initialize(this.dialogueBox);
    }

    checkPhilosopherInteraction() {
        let nearbyPhilosopher = null;

        for (const philosopher of this.philosophers) {
            if (philosopher.isPlayerNearby(this.player)) {
                nearbyPhilosopher = philosopher;
                break;
            }
        }
        
        if (nearbyPhilosopher) {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                if (!this.dialogueBox.isVisible()) {
                    this.dialogueManager.startDialogue(nearbyPhilosopher);

                    // Show Akool modal overlay with iframe
                    const akoolModal = document.getElementById('akool-modal');
                    const akoolVideoChat = document.getElementById('akool-video-chat');
                    const closeAkoolModal = document.getElementById('close-akool-modal');

                    // Make sure the modal is displayed
                    akoolModal.style.display = 'flex';

                    // Insert the iframe dynamically (you may already have this part correct)
                    akoolVideoChat.innerHTML = `<iframe src='http://localhost:5173/streaming/avatar' width='100%' height='100%' frameborder='0' allow='camera; microphone; autoplay'></iframe>`;

                    // Close modal functionality
                    closeAkoolModal.onclick = function() {
                        akoolModal.style.display = 'none';
                        akoolVideoChat.innerHTML = ''; // Clear the iframe when closing the modal
                    };
                } else if (!this.dialogueManager.isTyping) {
                    this.dialogueManager.continueDialogue();
                }
            }

            if (this.dialogueBox.isVisible()) {
                nearbyPhilosopher.facePlayer(this.player);
            }
        } else if (this.dialogueBox.isVisible()) {
            this.dialogueManager.closeDialogue();
        }
    }

    setupPlayer(worldLayer) {
        this.player = this.physics.add.sprite(100, 300, "sophia", "sophia-front")
            .setSize(30, 40)
            .setOffset(0, 6);

        this.physics.add.collider(this.player, worldLayer);
        
        this.philosophers.forEach(philosopher => {
            this.physics.add.collider(this.player, philosopher.sprite);
        });

        this.createPlayerAnimations();

        // Set world bounds for physics
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.physics.world.setBoundsCollision(true, true, true, true);
    }

    createPlayerAnimations() {
        const anims = this.anims;
        const animConfig = [
            { key: "sophia-left-walk", prefix: "sophia-left-walk-" },
            { key: "sophia-right-walk", prefix: "sophia-right-walk-" },
            { key: "sophia-front-walk", prefix: "sophia-front-walk-" },
            { key: "sophia-back-walk", prefix: "sophia-back-walk-" }
        ];
        
        animConfig.forEach(config => {
            anims.create({
                key: config.key,
                frames: anims.generateFrameNames("sophia", { prefix: config.prefix, start: 0, end: 8, zeroPad: 4 }),
                frameRate: 10,
                repeat: -1,
            });
        });
    }

    setupCamera() {
        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0, 0, this.mapWidth, this.mapHeight);
        return camera;
    }

    setupControls(camera) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: camera,
            left: this.cursors.left,
            right: this.cursors.right,
            up: this.cursors.up,
            down: this.cursors.down,
            speed: 500,
        });
        
        this.labelsVisible = true;
        
        // Add ESC key for pause menu
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.dialogueBox.isVisible()) {
                this.scene.pause();
                this.scene.launch('PauseMenu');
            }
        });
    }

    setupDialogueSystem() {
        const screenPadding = 20;
        const maxDialogueHeight = 200;
        
        this.dialogueBox = new DialogueBox(this);
        this.dialogueText = this.add
            .text(60, this.game.config.height - maxDialogueHeight - screenPadding + screenPadding, '', {
                font: "18px monospace",
                fill: "#ffffff",
                padding: { x: 20, y: 10 },
                wordWrap: { width: 680 },
                lineSpacing: 6,
                maxLines: 5
            })
            .setScrollFactor(0)
            .setDepth(30)
            .setVisible(false);

        this.spaceKey = this.input.keyboard.addKey('SPACE');
        
        this.dialogueManager = new DialogueManager(this);
        this.dialogueManager.initialize(this.dialogueBox);
    }

    update(time, delta) {
        const isInDialogue = this.dialogueBox.isVisible();
        
        if (!isInDialogue) {
            this.updatePlayerMovement();
        }
        
        this.checkPhilosopherInteraction();
        
        this.philosophers.forEach(philosopher => {
            philosopher.update(this.player, isInDialogue);
        });
        
        if (this.controls) {
            this.controls.update(delta);
        }
    }

    updatePlayerMovement() {
        const speed = 300;
        const prevVelocity = this.player.body.velocity.clone();
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
        }

        this.player.body.velocity.normalize().scale(speed);

        // Clamp player position to map bounds
        this.player.x = Phaser.Math.Clamp(this.player.x, 0, this.mapWidth);
        this.player.y = Phaser.Math.Clamp(this.player.y, 0, this.mapHeight);

        const currentVelocity = this.player.body.velocity.clone();
        const isMoving = Math.abs(currentVelocity.x) > 0 || Math.abs(currentVelocity.y) > 0;
        
        if (this.cursors.left.isDown && isMoving) {
            this.player.anims.play("sophia-left-walk", true);
        } else if (this.cursors.right.isDown && isMoving) {
            this.player.anims.play("sophia-right-walk", true);
        } else if (this.cursors.up.isDown && isMoving) {
            this.player.anims.play("sophia-back-walk", true);
        } else if (this.cursors.down.isDown && isMoving) {
            this.player.anims.play("sophia-front-walk", true);
        } else {
            this.player.anims.stop();
            if (prevVelocity.x < 0) this.player.setTexture("sophia", "sophia-left");
            else if (prevVelocity.x > 0) this.player.setTexture("sophia", "sophia-right");
            else if (prevVelocity.y < 0) this.player.setTexture("sophia", "sophia-back");
            else if (prevVelocity.y > 0) this.player.setTexture("sophia", "sophia-front");
            else {
                // If prevVelocity is zero, maintain current direction
                // Get current texture frame name
                const currentFrame = this.player.frame.name;
                
                // Extract direction from current animation or texture
                let direction = "front"; // Default
                
                // Check if the current frame name contains direction indicators
                if (currentFrame.includes("left")) direction = "left";
                else if (currentFrame.includes("right")) direction = "right";
                else if (currentFrame.includes("back")) direction = "back";
                else if (currentFrame.includes("front")) direction = "front";
                
                // Set the static texture for that direction
                this.player.setTexture("sophia", `sophia-${direction}`);
            }
        }
    }

    togglePhilosopherLabels(visible) {
        this.philosophers.forEach(philosopher => {
            if (philosopher.nameLabel) {
                philosopher.nameLabel.setVisible(visible);
            }
        });
    }
}