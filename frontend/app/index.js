let myFont; //The font we'll use throughout the app

let gameOver = false; //If it's true the game will render the main menu
let gameBeginning = true; //Should be true only before the user starts the game for the first time

//===Game objects
//Declare game objects here like player, enemies etc
let player;
let enemies = [];
let stars = [];
let collectibles = [];
let explosions = [];

//===Buttons
let playButton;
let soundButton;


//===Score data
let score = 0;
let highScore = 0;
let highscoreGained = false;


//===Data taken from Game Settings
let startingLives;
let maxLives;
let lives;
let enemySpawnFrequency;
let fastEnemySpawnFrequency;
let lifeSpawnFrequency;
let shieldSpawnFrequency;
let enemyAverageSpeed;
let starCount;
let drawBackgroundStars;
let scoreGain;
let shieldDuration;
let enemyDestroyScoreModifier;

//===Images
let imgLife;
let imgBackground;
let imgPlayer;
let imgExplosion;
let imgCollectible = [];
let imgShield;
let imgEnemy = [];


//===Audio
let sndMusic;
let sndExplosion;
let sndShield;
let sndLife;
let sndLose;

let soundEnabled = true;
let canMute = true;

let soundImage;
let muteImage;


//===Size stuff
let objSize; //base size modifier of all objects, calculated based on screen size

//game size in tiles, using bigger numbers will decrease individual object sizes but allow more objects to fit the screen
//Keep in mind that if you change this, you might need to change text sizes as well
let gameSize = 18;
let gameWidth;

//Coordinates of left and right sides of the game view
let leftX, rightX;

let isMobile = false;
let touching = false; //Whether the user is currently touching/clicking

let touchCurrentX = 0;
let touchStartX = 0;
let usingKeyboard = false;
let timeElapsed = 0;


//===This function is called before starting the game
function preload() {
    //===Load font from google fonts link provided in game settings
    var link = document.createElement('link');
    link.href = Koji.config.strings.fontFamily;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    myFont = getFontFamily(Koji.config.strings.fontFamily);
    let newStr = myFont.replace("+", " ");
    myFont = newStr;
    //===

    //===Load images

    //Load background if there's any
    if (Koji.config.images.background != "") {
        imgBackground = loadImage(Koji.config.images.background);
    }

    imgLife = loadImage(Koji.config.images.lifeIcon);
    imgPlayer = loadImage(Koji.config.images.player);
    imgExplosion = loadImage(Koji.config.images.explosion);
    imgCollectible[0] = loadImage(Koji.config.images.lifeCollectible);
    imgCollectible[1] = loadImage(Koji.config.images.shieldCollectible);
    imgShield = loadImage(Koji.config.images.shield);
    imgEnemy[0] = loadImage(Koji.config.images.enemyRegular);
    imgEnemy[1] = loadImage(Koji.config.images.enemyFast);

    soundImage = loadImage(Koji.config.images.soundImage);
    muteImage = loadImage(Koji.config.images.muteImage);

    //===Load Sounds
    sndMusic = loadSound(Koji.config.sounds.backgroundMusic);
    sndExplosion = loadSound(Koji.config.sounds.explosion);
    sndShield = loadSound(Koji.config.sounds.shield);
    sndLife = loadSound(Koji.config.sounds.life);
    sndLose = loadSound(Koji.config.sounds.lose);


    //===Load settings from Game Settings
    startingLives = parseInt(Koji.config.strings.lives);
    lives = startingLives;
    maxLives = parseInt(Koji.config.strings.maxLives);

    enemySpawnFrequency = parseInt(Koji.config.strings.enemySpawnFrequency);
    fastEnemySpawnFrequency = parseInt(Koji.config.strings.fastEnemySpawnFrequency);
    lifeSpawnFrequency = parseInt(Koji.config.strings.lifeSpawnFrequency);
    shieldSpawnFrequency = parseInt(Koji.config.strings.shieldSpawnFrequency);
    enemyAverageSpeed = parseInt(Koji.config.strings.enemyAverageSpeed);
    starCount = parseInt(Koji.config.strings.starCount);
    drawBackgroundStars = Koji.config.strings.drawBackgroundStars;
    scoreGain = parseInt(Koji.config.strings.scoreGain);
    shieldDuration = parseInt(Koji.config.strings.shieldDuration) / 1000;
    enemyDestroyScoreModifier = parseInt(Koji.config.strings.enemyDestroyScoreModifier);

}
function setup() {
    width = window.innerWidth;
    height = window.innerHeight;

    //===How much of the screen should the game take, this should usually be left as it is
    let sizeModifier = 0.85;
    if (height > width) {
        sizeModifier = 1;
    }

    //Get the lower one, used for centering the game
    gameWidth = min(width, height);
    leftX = width / 2 - gameWidth / 2;
    rightX = width / 2 + gameWidth / 2;

    createCanvas(width, height);

    //Magically determine basic object size depending on size of the screen
    objSize = floor(min(floor(width / gameSize), floor(height / gameSize)) * sizeModifier);

    isMobile = detectMobile();

    //===Get high score data from local storage
    if (localStorage.getItem("highscore")) {
        highScore = localStorage.getItem("highscore");
    }

    textFont(myFont); //set our font

    playButton = new PlayButton();
    soundButton = new SoundButton();

    gameBeginning = true;

    //Remove comment if you want the music to start
    playMusic();


    spawnStarStart();

}

function draw() {

    //Draw background or a solid color
    if (imgBackground) {
        background(imgBackground);
    } else {
        background(Koji.config.colors.backgroundColor);
    }


    //===Update background stars
    for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].render();

        if (stars[i].pos.y > height && stars[i].timer > 2) {
            stars[i].pos.y = -20;
        }

    }

    //===Draw UI
    if (gameOver || gameBeginning) {

        //===Draw title
        let titleText = Koji.config.strings.title;
        let titleSize = floor(objSize * 2);
        textSize(titleSize);

        //Resize title until it fits the screen
        while (textWidth(titleText) > width * 0.9) {
            titleSize *= 0.9;
            textSize(titleSize);
        }

        fill(Koji.config.colors.titleColor);
        textAlign(CENTER, TOP);
        text(Koji.config.strings.title, width / 2, objSize * 3);

        //===Draw instructions
        let instructionsText = [];
        instructionsText[0] = Koji.config.strings.instructions1;
        instructionsText[1] = Koji.config.strings.instructions2;
        instructionsText[2] = Koji.config.strings.instructions3;

        let instructionsSize = [];

        for (let i = 0; i < instructionsText.length; i++) {
            instructionsSize[i] = floor(objSize * 0.75);
            textSize(instructionsSize[i]);

            //Resize text until it fits the screen
            while (textWidth(instructionsText[i]) > width * 0.9) {
                instructionsSize[i] *= 0.9;
                textSize(instructionsSize[i]);
            }
        }

        textSize(instructionsSize[0]);
        fill(Koji.config.colors.instructionsColor);
        textAlign(CENTER, TOP);
        text(instructionsText[0], width / 2, objSize * 6);

        textSize(instructionsSize[1]);
        fill(Koji.config.colors.instructionsColor);
        textAlign(CENTER, TOP);
        text(instructionsText[1], width / 2, objSize * 8);

        textSize(instructionsSize[2]);
        fill(Koji.config.colors.instructionsColor);
        textAlign(CENTER, TOP);
        text(instructionsText[2], width / 2, objSize * 10);


        //===
        playButton.update();
        playButton.btn.draw();

        //===Draw score text after the game
        if (!gameBeginning) {
            textSize(objSize * 0.9);
            fill(Koji.config.colors.scoreColor);
            textAlign(CENTER, TOP);
            text(Koji.config.strings.scoreText + " " + score, width / 2, playButton.pos.y + objSize * 4);
        }

        //===Notify the player if they got a new high score, otherwise show the previous high score
        if (highscoreGained) {
            textSize(objSize * 1);
            fill(Koji.config.colors.highscoreColor);
            textAlign(CENTER, BOTTOM);
            text(Koji.config.strings.highscoreGainedText, width / 2, height - objSize);
        } else {
            textSize(objSize * 1);
            fill(Koji.config.colors.highscoreColor);
            textAlign(CENTER, BOTTOM);
            text(Koji.config.strings.highscoreText + "\n" + highScore, width / 2, height - objSize);
        }
    } else {

        timeElapsed += 1 / frameRate();

        checkEnemySpawn();

        if (touching) {
            touchCurrentX = mouseX;
        }
        //Update and render all game objects here

        player.update();
        player.render();

        for (let i = 0; i < enemies.length; i++) {
            enemies[i].update();
            enemies[i].render();

            if (player.collisionWith(enemies[i])) {
                enemies[i].removable = true;
                enemies[i].collided = true;

                sndExplosion.setVolume(0.2); //too loud if default
                sndExplosion.play();


                if (player.shieldTimer <= 0) {
                    loseLife();
                } else {
                    let gain = scoreGain * enemyDestroyScoreModifier;
                    score += gain;
                    floatingTexts.push(new FloatingText(enemies[i].pos.x, enemies[i].pos.y, "+" + gain, Koji.config.colors.scoreColor, objSize));
                }

                player.pos.y += objSize;
            }
        }

        for (let i = 0; i < collectibles.length; i++) {
            collectibles[i].update();
            collectibles[i].render();

            //Pickup collectibles
            if (player.collisionWith(collectibles[i])) {
                collectibles[i].removable = true;
                collectibles[i].collided = true;

                if (collectibles[i].type == 0) {
                    addLife();
                }
                if (collectibles[i].type == 1) {
                    player.shieldTimer = shieldDuration;

                    sndShield.play();
                }
            }
        }

        for (let i = 0; i < explosions.length; i++) {
            explosions[i].update();
            explosions[i].render();
        }

        //===Update all floating text objects
        for (let i = 0; i < floatingTexts.length; i++) {
            floatingTexts[i].update();
            floatingTexts[i].render();
        }

        //===Ingame UI

        //===Score draw
        let scoreX = rightX - objSize / 2;
        let scoreY = objSize / 3;
        textSize(objSize);
        fill(Koji.config.colors.scoreColor);
        textAlign(RIGHT, TOP);
        text(score, scoreX, scoreY);

        //Lives draw
        let lifeSize = objSize;
        for (let i = 0; i < lives; i++) {
            image(imgLife, leftX + lifeSize / 2 + lifeSize * i, lifeSize / 2, lifeSize, lifeSize);
        }

        cleanup();
    }

    //Draw black bars if needed
    if (width > height) {
        noStroke();
        fill(0);
        rect(0, 0, leftX, height);
        rect(rightX, 0, width / 2 - gameWidth / 2, height);
    }

    soundButton.render();
}


//===Go through objects and see which ones need to be removed
//A good practive would be for objects to have a boolean like removable, and here you would go through all objects and remove them if they have removable = true;
function cleanup() {
    for (let i = 0; i < floatingTexts.length; i++) {
        if (floatingTexts[i].timer <= 0) {
            floatingTexts.splice(i, 1);
        }
    }

    for (let i = 0; i < enemies.length; i++) {

        if (enemies[i].collided) {
            //explosion
            let x = (player.pos.x + enemies[i].pos.x) / 2;
            let y = (player.pos.y + enemies[i].pos.y) / 2;
            explosions.push(new Explosion(x, y));
        } else {
            //Get score when an enemy disappears
            if (enemies[i].removable) {
                score += scoreGain;
                checkHighscore();
            }
        }

        if (enemies[i].removable) {
            enemies.splice(i, 1);
        }
    }

    for (let i = 0; i < collectibles.length; i++) {

        if (collectibles[i].collided) {
            //effect
            let txt;
            let color;
            if (collectibles[i].type == 0) {
                txt = Koji.config.strings.lifeText;
                color = Koji.config.colors.lifeColor;
            }
            if (collectibles[i].type == 1) {
                txt = Koji.config.strings.shieldText;
                color = Koji.config.colors.shieldColor;
            }
            floatingTexts.push(new FloatingText(collectibles[i].pos.x, collectibles[i].pos.y, txt, color, objSize));
        }

        if (collectibles[i].removable) {
            collectibles.splice(i, 1);
        }
    }

    for (let i = 0; i < explosions.length; i++) {
        if (explosions[i].timer <= 0) {
            explosions.splice(i, 1);
        }
    }

}

function checkEnemySpawn() {

    if (timeElapsed > 1) {
        if (enemies.length < 5) {
            spawnEnemy(0);
        }

        //roll for ordinary
        let roll = random() * 100;
        if (roll < enemySpawnFrequency * 0.05) {
            spawnEnemy(0);
        }

        //roll for fast
        roll = random() * 100;
        if (roll < fastEnemySpawnFrequency * 0.05) {
            spawnEnemy(1);
        }
        //roll for life
        roll = random() * 100;
        if (roll < lifeSpawnFrequency * 0.05) {
            spawnLife();
        }

        //roll for shield
        roll = random() * 100;
        if (roll < shieldSpawnFrequency * 0.05) {
            spawnShield();
        }
    }
}

function spawnEnemy(type) {
    enemies.push(new Enemy(random(leftX + objSize, rightX - objSize), -objSize, type));
}

function spawnLife() {
    collectibles.push(new Collectible(random(leftX + objSize, rightX - objSize), -objSize, 0));
}

function spawnShield() {
    collectibles.push(new Collectible(random(leftX + objSize, rightX - objSize), -objSize, 1));
}


//===Spawn stars across the screen
function spawnStarStart() {
    if (drawBackgroundStars) {
        for (let i = 0; i < starCount; i++) {
            let starX = random() * width;
            let starY = random() * height;
            stars.push(new Star(starX, starY));
        }
    }
}

//===Handle input
function touchStarted() {

    if (soundButton.checkClick()) {
        toggleSound();
        return;
    }

    if (!gameOver && !gameBeginning) {
        //Ingame
        touching = true;
        touchStartX = mouseX;
    }

    usingKeyboard = false;
}

function touchEnded() {
    touching = false;

    //===This is required to fix a problem where the music sometimes doesn't start on mobile
    if (soundEnabled) {
        if (getAudioContext().state !== 'running') {
            getAudioContext().resume();
        }
    }

}

function keyPressed() {
    if (!gameOver && !gameBeginning) {
        if (player) {
            if (keyCode == LEFT_ARROW) {
                player.moveDir = -1;
            }

            if (keyCode == RIGHT_ARROW) {
                player.moveDir = 1;
            }
        }

        console.log("dsfd");
    }

    usingKeyboard = true;
}

function keyReleased() {
    if (!gameOver && !gameBeginning) {
        if (player) {
            if (keyCode == LEFT_ARROW && player.moveDir == -1) {
                player.moveDir = 0;
            }

            if (keyCode == RIGHT_ARROW && player.moveDir == 1) {
                player.moveDir = 0;
            }
        }
    }
}

//===Call this every time you want to start or reset the game
//This is a good place to clear all arrays like enemies, bullets etc before starting a new game
function init() {
    gameOver = false;

    lives = startingLives;
    highscoreGained = false;
    score = 0;

    floatingTexts = [];
    explosions = [];
    collectibles = [];
    enemies = [];

    player = new Player(width / 2, height * 0.66);

    timeElapsed = 0;

}

//===Call this when a lose life event should trigger
function loseLife() {

    lives--;

    if (lives <= 0) {
        gameOver = true;
        checkHighscore();

        sndLose.play();
    }
}


function addLife() {
    if (lives < maxLives) {
        lives++;
    } else {
        score += scoreGain;
    }

    sndLife.play();
}


//===The way to use Floating Text:
//floatingTexts.push(new FloatingText(...));
//Everything else like drawing, removing it after it's done etc, will be done automatically
function FloatingText(x, y, txt, color, size) {
    this.pos = createVector(x, y);
    this.size = 1;
    this.maxSize = size;
    this.timer = 1;
    this.txt = txt;
    this.color = color;

    this.update = function () {
        if (this.timer > 0.3) {
            if (this.size < this.maxSize) {
                this.size = Smooth(this.size, this.maxSize, 2);
            }
        } else {
            this.size = Smooth(this.size, 0.1, 2);
        }

        this.timer -= 1 / frameRate();
    }

    this.render = function () {
        textSize(this.size);
        fill(this.color);
        textAlign(CENTER, BOTTOM);
        text(this.txt, this.pos.x, this.pos.y);
    }
}
