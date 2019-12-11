export function extractGridConfig(dimension, width){
  let gridConfig = [];
  let tileSize = Math.floor(width / dimension);

  let id = 0;
  for (let row = 0; row < tileSize * dimension ; row += tileSize ){
    let rowArr = [];
    for (let col = 0; col < tileSize * dimension ; col += tileSize ){
      rowArr.push({id: id, x: row, y: col, width: tileSize, height: tileSize});
      id++;
    }
    gridConfig.push(rowArr);
  }
  return gridConfig;
}

export function extractTilesFromImg(s, width, img, gridConfig){
  let pg = s.createGraphics(width, width);
  pg.background(img);
  
  let tileId = 0;
  let imgTiles = [];
  
  for (let row of gridConfig){
    let rowsArr = [];
    for (let  config of row){
      let splitImage = pg.get(config.x, config.y, config.width, config.height);
      let tile;
      if (tileId == (Math.pow(gridConfig.length, 2) - 1))
        tile = new Tile(s, tileId, config.x, config.y, config.width, config.height);
      else 
        tile = new Tile(s, tileId, config.x, config.y, config.width, config.height, splitImage);
      rowsArr.push(tile);
      tileId++;
    }
    imgTiles.push(rowsArr);
  }
  return imgTiles;
}

export function displayGrid(grid){
  for (let row of grid){
    for (let col of row){
      col.display();
    }
  }
}

export function reDesplayGrid(grid, gridConfig){
  for (let [i, row] of grid.entries()){
    for (let [j, col] of row.entries()){
    	col.x = gridConfig[i][j].x;
    	col.y = gridConfig[i][j].y;
    	col.width = gridConfig[i][j].width;
    	col.height = gridConfig[i][j].height;
    	col.display();
    }
  }
}

class Tile {
  constructor (s, id, x, y, tileWidth, tileHeight, img){
  	this.s = s;
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
      this.s.image(this.image, this.x, this.y, this.width - 5, this.height - 5);
    this.s.fill(255, 0, 0);
    this.s.text(this.id , this.x + 2 , this.y + 15);
  }
  clicked(emptyNeighbour){
    if (this.s.mouseOn(this)) {
      this.emptyNeighbour = emptyNeighbour;
    }
  }
}