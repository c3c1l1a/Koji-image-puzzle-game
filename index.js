
let puzzleImage;
let puzzleDimension =  3;
let shuffledGrid;
let gridCordMatrix;

function preload(){
  puzzleImage = loadImage("https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg");
  gridCordMatrix = generateGridCoordMatrix(puzzleDimension);
  //windowWidth = 800;
  //windowHeight = 800;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  let puzzleGrid = createGridFromImg(puzzleImage);
  displayGrid(puzzleGrid);
  shuffledGrid = shuffleGrid(puzzleGrid);
   setTimeout(()=>{clear(); displayGrid(shuffledGrid)}, 300);
}
function cloneShuffledGrid(){
  let clonedShuffledGrid = [];
  for (let row of shuffledGrid.entries()){
    let rowArr = [];
    for (let col of row.entries()){
      rowArr.push(Object.assign({}, col));
    }
    clonedShuffledGrid.push(rowArr);
  }
  return clonedShuffledGrid;
}
function shuffleGrid(grid){
  let flattenedCoords = [].concat.apply([], gridCordMatrix);
  let flattenedGrid = [].concat.apply([], grid);
  let row = 0;
  let shuffledFlattnedGrid = [];
  
  for (var i = flattenedCoords.length - 1; i >= 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    let temp = flattenedGrid[i];
    
    flattenedGrid[i] = flattenedGrid[j]; 
    flattenedGrid[j] = temp;

    flattenedGrid[i].x = flattenedCoords[i][0];
    flattenedGrid[i].y = flattenedCoords[i][1];
  }
  
  let gridShuffle = [];
  for(let i= 0;i < flattenedGrid.length;i = i+puzzleDimension)
      gridShuffle.push(flattenedGrid.slice(i,i+puzzleDimension));
  
  return gridShuffle;
}
function generateGridCoordMatrix(dimension){
  let gridCoordMatrix = [];
  let tileWidth = Math.floor(windowWidth / dimension);
  let tileHeight = Math.floor(windowHeight / dimension);
  for (let rows = 0; rows < tileWidth * dimension ; rows += tileWidth ){
    let rowArr = [];
    for (let cols = 0; cols < tileHeight * dimension ; cols += tileHeight ){
      rowArr.push([rows, cols]);
    }
    gridCoordMatrix.push(rowArr);
  }
  return gridCoordMatrix;
}

function createGridFromImg(img){
  let pg = createGraphics(windowWidth, windowHeight);
  pg.background(img);
  
  let splitImageWidth = pg.width / gridCordMatrix.length;
  let splitImageHeight = pg.height / gridCordMatrix.length;
  let tileId = 0;
  let puzzleGrid = [];
  
  for (let row of gridCordMatrix){
    let rowsArr = [];
    for (let col of row){
      let splitImage = pg.get(col[0], col[1], splitImageWidth, splitImageHeight);
      let tile;
      if (tileId == (Math.pow(gridCordMatrix.length, 2) - 1))
        tile = new Tile(tileId, col[0], col[1], splitImageWidth, splitImageHeight);
      else 
        tile = new Tile(tileId, col[0], col[1], splitImageWidth, splitImageHeight, splitImage);
      rowsArr.push(tile);
      tileId++;
    }
    puzzleGrid.push(rowsArr);
  }
  return puzzleGrid;
}

function displayGrid(grid){
  for (let row of grid){
    for (let col of row){
      col.display();
    }
  }
}

class Tile {
  constructor (id, x, y, tileWidth, tileHeight, img){
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = tileWidth;
    this.height = tileHeight;
    this.image = img;
    this.emptyNeighbour = "";
  }
  display(){
    if (this.image)      
      image(this.image, this.x, this.y, this.width - 5, this.height - 5);
    fill(255, 0, 0);
    text(this.id , this.x + 2 , this.y + 15);
  }
  clicked(emptyNeighbour){
    if (initMouseX > this.x && initMouseX < this.x + this.width && initMouseY > this.y && initMouseY < this.y + this.height) {
      this.emptyNeighbour = emptyNeighbour;
    }
  }
}

function mouseOn(obj){
  if (mouseX > obj.x && mouseX < obj.x + obj.width && mouseY > obj.y && mouseY < obj.y + obj.height ){
    return true;
  } else return false;
}

function objEmpty(obj){
  if (Object.entries(obj).length === 0 && obj.constructor === Object){
    return true;
  } else return false;
}
let swap = false;
let tempTile;
let tempEmpty;

function swapItems2DArr(i1, i2){
  
  let item1 = shuffledGrid[i1[0]][i1[1]];
  let item2 = shuffledGrid[i2[0]][i2[1]];
  
  shuffledGrid[i1[0]][i1[1]] = item2;
  shuffledGrid[i1[0]][i1[1]].x = gridCordMatrix[i1[0]][i1[1]][0];
  shuffledGrid[i1[0]][i1[1]].y = gridCordMatrix[i1[0]][i1[1]][1];
  
  shuffledGrid[i2[0]][i2[1]] = item1;
  shuffledGrid[i2[0]][i2[1]].x = gridCordMatrix[i2[0]][i2[1]][0];
  shuffledGrid[i2[0]][i2[1]].y = gridCordMatrix[i2[0]][i2[1]][1]; 
}

function extractNeighbour(i,j){
  switch (shuffledGrid[i][j].emptyNeighbour){
    case "top":
      //console.log("top");
      return [i,j - 1];
    case "bottom":
      //console.log("bottom");
      return [i, j + 1];
    case "right":
      //console.log("right");
      return [i + 1, j];
    case "left":
      //console.log("left");
      return [i - 1, j];
  }
}
function count(n){
  return n++;
}

function mouseDragged(){
  for (let [i,row] of shuffledGrid.entries()){
    for (let [j, tile] of row.entries()){
      let xOffset = initMouseX - gridCordMatrix[i][j][0];
      let yOffset = initMouseY - gridCordMatrix[i][j][1];
      let mouseYDistance = abs(initMouseY - mouseY);
      let mouseXDistance = abs(initMouseX - mouseX);
      let emptyNeighbour = extractNeighbour(i, j);
     
      if (emptyNeighbour && swap){
        swapItems2DArr([i, j], emptyNeighbour);
        tile.x = shuffledGrid[emptyNeighbour[0]][emptyNeighbour[1]].x;
        tile.y = shuffledGrid[emptyNeighbour[0]][emptyNeighbour[1]].y;
        tile.emptyNeighbour = "";
      }
      
      if (emptyNeighbour && mouseOn(tile) ){
        let emptyTileX = shuffledGrid[emptyNeighbour[0]][emptyNeighbour[1]].x;
        let emptyTileY = shuffledGrid[emptyNeighbour[0]][emptyNeighbour[1]].y;
        
        let totalXDistance = abs(emptyTileX - gridCordMatrix[i][j][0]);
        let totalYDistance = abs(emptyTileY - gridCordMatrix[i][j][1]);
        
        let yInRange = abs(tile.y - (emptyTileY + gridCordMatrix[i][j][1])/2) <=
                       abs((emptyTileY - gridCordMatrix[i][j][1])/2);
      
        let xInRange = abs(tile.x - (emptyTileX + gridCordMatrix[i][j][0])/2) <=
                       abs((emptyTileX - gridCordMatrix[i][j][0])/2);
      
        if (totalXDistance == 0 && yInRange){
          tile.y = mouseY - yOffset;
          if ( mouseYDistance >= totalYDistance/2)
            swap = true; 
        } else if (totalYDistance == 0 && xInRange){
          tile.x = mouseX - xOffset;
          if ( mouseXDistance >= totalXDistance/2)
            swap = true; 
        }
      } 
    }
  }
  clear();
  displayGrid(shuffledGrid);
}

function mouseReleased(){
  swap = false;
}


let initMouseX, initMouseY;
function mousePressed(){
  initMouseX = mouseX;
  initMouseY = mouseY;
  for (let row = 0; row < puzzleDimension; row++){
    for (let col = 0; col < puzzleDimension; col++){
      let emptyTileId = puzzleDimension * puzzleDimension - 1;
      
      if ( shuffledGrid[row - 1] && shuffledGrid[row - 1][col].id == emptyTileId )
        shuffledGrid[row][col].clicked("left");
      
      if ( shuffledGrid[row + 1] && shuffledGrid[row + 1][col].id == emptyTileId)
        shuffledGrid[row][col].clicked("right");

      if ( shuffledGrid[col - 1]  && shuffledGrid[row][col - 1].id == emptyTileId)
        shuffledGrid[row][col].clicked("top");
      
      if ( shuffledGrid[col + 1] && shuffledGrid[row][col + 1].id == emptyTileId)
        shuffledGrid[row][col].clicked("bottom");
    }
  }
}

function temp(){
  for (let neighbour of neighbours){
        if (neighbour.id == puzzleDimension * puzzleDimension - 1){
          clear();
          let tempShuffledGrid = [];
          for (let [i,row] of shuffledGrid.entries() ){
            let rowArr = [];
            for (let [j, col] of row.entries()){
              let xOffset = initMouseX - this.x;
              let yOffset = initMouseY - this.y;
              let xMouseDistance = mouseX - initMouseX;
              let yMouseDistance = mouseY - initMouseY;
              let totalXDistance = this.x - gridCordMatrix[i][j][0];
              let totalYDistance = this.y - gridCordMatrix[i][j][1];
              let speed = 0.1;
              
              if (col.id == neighbour.id ){
                col = this;
                if (totalXDistance == 0){
                  col.x = gridCordMatrix[i][j][0];
                  col.y = mouseY - yOffset;
                  col.y += speed * Math.sign(totalXDistance);
                  //if (mouseRelease){
                  //  col.y = gridCordMatrix[i][j][1];
                  //}
                  //
                } 
                if (totalYDistance == 0){
                  col.y = gridCordMatrix[i][j][1];
                  col.x = mouseX - xOffset;
                  col.x += speed * Math.sign(totalYDistance);
                  //if (mouseRelease)
                  //  col.x = gridCordMatrix[i][j][0];
                  
                }
                //col.y = gridCordMatrix[i][j][1];
                //col.x = mouseX - xOffset;
                
          
              } else if (col.id == this.id ){
                col = neighbour;
                //col.x += -xOffset;
                //col.y += -xOffset;
                col.x = gridCordMatrix[i][j][0];
                col.y = gridCordMatrix[i][j][1];
              }
              rowArr.push(col);
            }
            tempShuffledGrid.push(rowArr);
            shuffledGrid = tempShuffledGrid;
          }
           displayGrid(shuffledGrid);
        }
      }
}
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}