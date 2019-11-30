
let puzzleImage;
let puzzleDimension =  3;
let shuffledGrid;
let gridCordMatrix;
let finalGridConfig; 

function preload(){
  puzzleImage = loadImage("https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg");
  gridCordMatrix = generateGridCordMatrix(puzzleDimension);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  let puzzleGrid = createGridFromImg(puzzleImage);
  finalGridConfig = getFinalGridConfig(puzzleGrid);
  displayGrid(puzzleGrid);
  shuffledGrid = shuffleGrid(puzzleGrid);
  setTimeout(()=>{clear(); displayGrid(shuffledGrid)}, 300);

}
function getFinalGridConfig(grid){
  let gridConfig = [];
  for (let row of grid.entries()){
    let rowArr = [];
    for (let col of row.entries()){
      rowArr.push({id: col.id, x: col.x, y: col.y });
      
    }
    gridConfig.push(rowArr);
  }
  return gridConfig;
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
function generateGridCordMatrix(dimension){
  let gridCordMatrix = [];
  let tileWidth = Math.floor(windowWidth / dimension);
  let tileHeight = Math.floor(windowHeight / dimension);
  for (let rows = 0; rows < tileWidth * dimension ; rows += tileWidth ){
    let rowArr = [];
    for (let cols = 0; cols < tileHeight * dimension ; cols += tileHeight ){
      rowArr.push([rows, cols]);
    }
    gridCordMatrix.push(rowArr);
  }
  return gridCordMatrix;
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
    if (mouseOn(this)) {
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

  swap = false;
}

function extractNeighbour(i,j){
  switch (shuffledGrid[i][j].emptyNeighbour){
    case "top":
      return [i,j - 1];
    case "bottom":
      return [i, j + 1];
    case "right":
      return [i + 1, j];
    case "left":
      return [i - 1, j];
  }
}

function mouseDragged(){
  for (let [i,row] of shuffledGrid.entries()){
    for (let [j, tile] of row.entries()){
      let xOffset = initMouseX - gridCordMatrix[i][j][0];
      let yOffset = initMouseY - gridCordMatrix[i][j][1];
      let mouseYDistance = abs(initMouseY - mouseY);
      let mouseXDistance = abs(initMouseX - mouseX);
      let emptyNeighbour = extractNeighbour(i, j);
    
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
      if (emptyNeighbour && swap){
        swapItems2DArr([i, j], emptyNeighbour);
        tile.x = shuffledGrid[emptyNeighbour[0]][emptyNeighbour[1]].x;
        tile.y = shuffledGrid[emptyNeighbour[0]][emptyNeighbour[1]].y;
        tile.emptyNeighbour = "";
      }
    }
  }
  clear();
  displayGrid(shuffledGrid);
}

function mouseReleased(){
  for (let [i, row] of shuffledGrid.entries()){
    for (let [j, tile] of row.entries()){
      tile.x = gridCordMatrix[i][j][0];
      tile.y = gridCordMatrix[i][j][1];
    }
  }
  clear();
  displayGrid(shuffledGrid);
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
