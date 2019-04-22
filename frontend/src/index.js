const { koji } = process.env;

console.log(koji);

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  background(koji.colors.backgroundColor);

  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255);
  }
  ellipse(mouseX, mouseY, 80, 80);
}

export default {
  setup,
  draw,
}
