let img;
let button;
let sounds; // sounds

function preload() {

  // setup sounds
  soundFormats('mp3', 'ogg');
  sounds = {
    backgroundMusic: loadSound(Koji.config.sounds.backgroundMusic)
  };

}

function setup() {

  // make a full screen canvas
  createCanvas(window.innerWidth, window.innerHeight);

  img = loadImage(Koji.config.images.mouse); // Load the image


}

function draw() {
  // set the background color from the configuration options
  background(Koji.config.colors.backgroundColor);

  // format our text
  textSize(24);
  fill(Koji.config.colors.textColor);
  textAlign(CENTER);

  // print out our text
  text(Koji.config.strings.content, window.innerWidth / 2, 100);

  // play our background music
  if (!sounds.backgroundMusic.isPlaying()) {
    sounds.backgroundMusic.play();
  }

  // setup an image to follow our mouse
  let imageSize = 100;
  image(img, mouseX - (imageSize / 2), mouseY - (imageSize / 2), imageSize, imageSize);
}


// start audio context
function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  var synth = new p5.MonoSynth();
  synth.play('A4', 0.5, 0, 0.2);
}