import ResizeObserver from 'resize-observer-polyfill';
import { extractGridConfig, extractTilesFromImg, displayGrid, reDesplayGrid } from './components/lib';

export default function(s){
	let puzzleImage;
	let gridDimension = 3;
	let imgTileGrid;
	let gridConfig;
	
	const ro = new ResizeObserver((entries, observer) => {
	    for (const entry of entries) {
	        const {left, top, width, height} = entry.contentRect;
	        
	        let cnvWidth = width > s.windowHeight? s.windowHeight: width;
	        cnvWidth = s.abs(width - s.windowHeight) < cnvWidth / 5? cnvWidth*4/5: cnvWidth ;
	        console.log(cnvWidth);
	  		
	  		gridConfig = extractGridConfig(gridDimension, cnvWidth);
	  		s.preload = function(){
				puzzleImage = s.loadImage(`https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg`);
			}
	        s.setup = function(){
				s.createCanvas(cnvWidth, cnvWidth);
				imgTileGrid = extractTilesFromImg(s, cnvWidth, puzzleImage, gridConfig);
				displayGrid(imgTileGrid);
			}

	        s.windowResized = function(){
	        	s.clear();
	        	let newGridConfig = extractGridConfig(gridDimension, cnvWidth);
	        	reDesplayGrid(imgTileGrid, newGridConfig);
	        	
	        }
	    }
	});

	ro.observe(document.getElementById('game-container'));
}