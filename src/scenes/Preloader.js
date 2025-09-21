import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor () {
        super('Preloader');
    }

    preload () {
        this.load.setPath('assets');

        // General assets
        this.load.image('background', 'talking_philosophers.jpg');

        // Tilesets
        this.load.image("tuxmon-tiles", "tilesets/tuxmon-sample-32px-extruded.png");
        this.load.image("greece-tiles", "tilesets/ancient_greece_tileset.png");
        this.load.image("plant-tiles", "tilesets/plant.png");

        // Tilemap
        this.load.tilemapTiledJSON("map", "tilemaps/philoagents-town.json");

        // Character assets
        this.load.atlas("sophia", "characters/sophia/atlas.png", "characters/sophia/atlas.json");
        this.load.atlas("socrates", "characters/socrates/atlas.png", "characters/socrates/atlas.json");
        this.load.atlas("plato", "characters/plato/atlas.png", "characters/plato/atlas.json");
        this.load.atlas("aristotle", "characters/aristotle/atlas.png", "characters/aristotle/atlas.json");
        this.load.atlas("descartes", "characters/descartes/atlas.png", "characters/descartes/atlas.json");
        this.load.atlas("leibniz", "characters/leibniz/atlas.png", "characters/leibniz/atlas.json");
        this.load.atlas("ada_lovelace", "characters/ada/atlas.png", "characters/ada/atlas.json");
        this.load.atlas("turing", "characters/turing/atlas.png", "characters/turing/atlas.json");
        this.load.atlas("searle", "characters/searle/atlas.png", "characters/searle/atlas.json");
        this.load.atlas("chomsky", "characters/chomsky/atlas.png", "characters/chomsky/atlas.json");
        this.load.atlas("dennett", "characters/dennett/atlas.png", "characters/dennett/atlas.json");
        this.load.atlas("miguel", "characters/miguel/atlas.png", "characters/miguel/atlas.json");
        this.load.atlas("paul", "characters/paul/atlas.png", "characters/paul/atlas.json");
    }

    create () {
        // Set up the background image
        const bg = this.add.image(0, 0, 'background');
        bg.setOrigin(0, 0);

        const camWidth = this.cameras.main.width;
        const camHeight = this.cameras.main.height;
        const imgWidth = bg.width-100;
        const imgHeight = bg.height-100;

        // Scale the image to fit the screen
        const scaleX = camWidth / imgWidth;
        const scaleY = camHeight / imgHeight;
        const fitScale = Math.min(scaleX, scaleY); // Fit image within screen size

        bg.setScale(fitScale);

        // Center the image after scaling
        bg.setPosition(
            (camWidth - imgWidth * fitScale) / 2,
            (camHeight - imgHeight * fitScale) / 2
        );

        // Adjust camera bounds to match the background size
        this.cameras.main.setBounds(0, 0, imgWidth * fitScale, imgHeight * fitScale);

        // Start the MainMenu scene after setting up the background
        this.scene.start('MainMenu');
    }
}