/* global Koji, createCanvas, background, textSize, text */

// Load assets
function preload() {

}

// Setup your props
function setup() {
    createCanvas(windowWidth, windowHeight)
    background(255)
}

// An infinite loop that never ends in p5
function draw() {
    textSize(50)
    text('🤩', width/2 - 22.5, height/2)
}
