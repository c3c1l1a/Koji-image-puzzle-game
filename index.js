let puzzleImage;
let puzzleDimension =  3;
let shuffledGrid;
let originalGridConfig;
let gameStarted = false;
let win = false
let cnvWidth;
let moves=0;

function preload(){
  puzzleImage = loadImage("https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg");
}

function setup() {
  cnvWidth = windowWidth > windowHeight? windowHeight: windowWidth;
  let cnv = createCanvas(cnvWidth, cnvWidth);
  positionDomElms();

  originalGridConfig = getOriginalGridConfig(puzzleDimension);
  let puzzleGrid = createGridFromImg(puzzleImage);
  displayGrid(puzzleGrid);
  shuffledGrid = shuffleGrid(puzzleGrid);
  setTimeout(()=>{clear(); displayGrid(shuffledGrid); gameStarted=true}, 3000);
}

function positionDomElms(){
  removeElements();
  let sidebar = createDiv();
  sidebar.id("sidebar");

  if (windowWidth > windowHeight){
    sidebar.position(cnvWidth+10, 0+10);
    sidebar.size(windowWidth - windowHeight, windowHeight);
  } else {
    sidebar.position(0+10, cnvWidth+10);
    sidebar.size(windowWidth, 30);
  }
  let movesElm = createP(moves).id("moves");
  sidebar.child(movesElm);
}

function shuffleGrid(grid){
  let flattenedGridConfig = [].concat.apply([], originalGridConfig);
  let flattenedGrid = [].concat.apply([], grid);
  let row = 0;
  let shuffledFlattnedGrid = [];
  
  for (var i = flattenedGridConfig.length - 1; i >= 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    let temp = flattenedGrid[i];
    
    flattenedGrid[i] = flattenedGrid[j]; 
    flattenedGrid[j] = temp;

    flattenedGrid[i].x = flattenedGridConfig[i].x;
    flattenedGrid[i].y = flattenedGridConfig[i].y;
  }
  
  let gridShuffle = [];
  for(let i= 0;i < flattenedGrid.length;i = i+puzzleDimension)
      gridShuffle.push(flattenedGrid.slice(i,i+puzzleDimension));
  
  return gridShuffle;
}
function getOriginalGridConfig(dimension){
  let originalGridConfig = [];
  let tileWidth = Math.floor(cnvWidth / dimension);
  let tileHeight = Math.floor(cnvWidth / dimension);
  let id = 0;
  for (let row = 0; row < tileWidth * dimension ; row += tileWidth ){
    let rowArr = [];
    for (let col = 0; col < tileHeight * dimension ; col += tileHeight ){
      rowArr.push({id: id, x: row, y: col, width: tileWidth, height: tileHeight});
      id++;
    }
    originalGridConfig.push(rowArr);
  }
  return originalGridConfig;
}

function createGridFromImg(img){
  let pg = createGraphics(cnvWidth, cnvWidth );
  pg.background(img);
  
  let tileId = 0;
  let puzzleGrid = [];
  
  console.log(originalGridConfig);
  for (let row of originalGridConfig){
    let rowsArr = [];
    for (let  config of row){
      let splitImage = pg.get(config.x, config.y, config.width, config.height);
      let tile;
      if (tileId == (Math.pow(originalGridConfig.length, 2) - 1))
        tile = new Tile(tileId, config.x, config.y, config.width, config.height);
      else 
        tile = new Tile(tileId, config.x, config.y, config.width, config.height, splitImage);
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
  shuffledGrid[i1[0]][i1[1]].x = originalGridConfig[i1[0]][i1[1]].x;
  shuffledGrid[i1[0]][i1[1]].y = originalGridConfig[i1[0]][i1[1]].y;

  shuffledGrid[i2[0]][i2[1]] = item1;
  shuffledGrid[i2[0]][i2[1]].x = originalGridConfig[i2[0]][i2[1]].x;
  shuffledGrid[i2[0]][i2[1]].y = originalGridConfig[i2[0]][i2[1]].y;

  moves++;
  positionDomElms();
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
  if (gameStarted && !win){
    for (let [i,row] of shuffledGrid.entries()){
      for (let [j, tile] of row.entries()){
        let xOffset = initMouseX - originalGridConfig[i][j].x;
        let yOffset = initMouseY - originalGridConfig[i][j].y;
        let mouseYDistance = abs(initMouseY - mouseY);
        let mouseXDistance = abs(initMouseX - mouseX);
        let emptyNeighbour = extractNeighbour(i, j);
      
        if (emptyNeighbour && mouseOn(tile) ){
          let emptyTileX = shuffledGrid[emptyNeighbour[0]][emptyNeighbour[1]].x;
          let emptyTileY = shuffledGrid[emptyNeighbour[0]][emptyNeighbour[1]].y;
          
          let totalXDistance = abs(emptyTileX - originalGridConfig[i][j].x);
          let totalYDistance = abs(emptyTileY - originalGridConfig[i][j].y);
          
          let yInRange = abs(tile.y - (emptyTileY + originalGridConfig[i][j].y)/2) <=
                         abs((emptyTileY - originalGridConfig[i][j].y)/2);
        
          let xInRange = abs(tile.x - (emptyTileX + originalGridConfig[i][j].x)/2) <=
                         abs((emptyTileX - originalGridConfig[i][j].x)/2);
        
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
    checkoriginalGridConfig();
  }
}

function checkoriginalGridConfig(){
  for (let [i, row] of shuffledGrid.entries()){
    for (let [j, tile] of row.entries()){
      if (tile.x != originalGridConfig[i][j].x || tile.y != originalGridConfig[i][j].y || tile.id != originalGridConfig[i][j].id)
        return;
    }
  }
  logWinningMessage();
}

function logWinningMessage(){
  setTimeout(()=>{clear(); win=true}, 500);
  console.log("you win");
}


function mouseReleased(){
  if (gameStarted && !win){
    for (let [i, row] of shuffledGrid.entries()){
      for (let [j, tile] of row.entries()){
        tile.x = originalGridConfig[i][j].x;
        tile.y = originalGridConfig[i][j].y;
      }
    }
    clear();
    displayGrid(shuffledGrid);
  }
}


let initMouseX, initMouseY;
function mousePressed(){
  if (gameStarted && !win){
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
}
