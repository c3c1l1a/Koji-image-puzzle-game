import Util from './Util.js';

function find(newBoard, width, height) {
    let marked = [];
    // verticals
    let streak = 0;
    let streakType = -1;
    for(let i = 0; i < width; i++) {
        streakType = -1;
        streak = 0;
        for(let j = 0; j < height; j++) {
            if(streakType === newBoard[i][j].type || streakType === -1) {
                // continue streak
                streakType = newBoard[i][j].type;
                streak ++;
            } else {
                if(streak >= 3) {
                    marked = marked.concat(addMarked(i, j - streak, streak, 'y'));
                }
                streak = 1;
                streakType = newBoard[i][j].type;
            }
        }
        if(streak >= 3) {
            marked = marked.concat(addMarked(i, height - streak, streak, 'y'));
        }
    }

    // now horizontals
    for(let j = 0; j < height; j++) {
        streakType = -1;
        streak = 0;
        for(let i = 0; i < width; i++) {
            if(streakType === newBoard[i][j].type || streakType === -1) {
                // continue streak
                streakType = newBoard[i][j].type;
                streak ++;
            } else {
                if(streak >= 3) {
                    marked = marked.concat(addMarked(i - streak, j, streak, 'x'));
                }
                streak = 1;
                streakType = newBoard[i][j].type;
            }
        }
        if(streak >= 3) {
            marked = marked.concat(addMarked(width - streak, j, streak, 'x'));
        }
    }

    return findPowerups(newBoard, marked);
}

function addMarked(x, y, length, direction) {
    let marked = [];

    for(let k = 0; k < length; k++) {
        // add a new thing to marked
        marked.push({x, y});

        if(length === 4 && k === 1) {
            marked[marked.length - 1].rowPower = true;
        } else if(length === 5 && k === 2) {
            marked[marked.length - 1].typePower = true;
        }

        if(direction === 'x') x ++;
        else y ++;
    }

    return marked;
}

function pruneMarked(marked) {
    // some quick set theory for your afternoon
    return marked.filter((a, i, self) => self.findIndex(b => a.x === b.x && a.y === b.y) === i);
}

function findPowerups(newBoard, marked) {
    let newMarked = [];
    marked.forEach((p) => {
        if (newBoard[p.x][p.y].rowPower) {
            newMarked = newMarked.concat(addRow(newBoard, p.y));
        } else if(newBoard[p.x][p.y].typePower) {
            newMarked = newMarked.concat(addType(newBoard, newBoard[p.x][p.y].type));
        }
    });

    return pruneMarked(marked.concat(newMarked));
}

function addRow(newBoard, row) {
    let marked = [];
    for(let x = 0; x < newBoard.length; x++) {
        marked.push({ x, y: row });
    }
    return marked;
}

function addType(newBoard, type) {
    let marked = [];
    for(let x = 0; x < newBoard.length; x++) {
        for(let y = 0; y < newBoard[0].length; y++) {
            if (newBoard[x][y].type === type) {
                marked.push({ x, y });
            }
        }
    }
    return marked;
}

function addPieces(newBoard, marked) {
    let numTypes = Util.getNumTypes();
    marked.forEach((mark) => {
        if(!mark.rowPower && !mark.typePower) {
            newBoard[mark.x].push(Util.newElement(numTypes));
        }
    })
    return newBoard;
}

function mark(newBoard, marked, width, height) {
    marked.forEach((mark) => {
        let { x, y } = mark;

        if (mark.rowPower) {
            newBoard[x][y].rowPower = true;
            newBoard[x][y].deleted = false;
        } else if (mark.typePower) {
            newBoard[x][y].typePower = true;
            newBoard[x][y].deleted = false;
        } else {
            // dont delete the same block twice
            if(newBoard[x][y].deleted !== true) {
                newBoard[x][y].deleted = true;
                while(--y >= 0) {
                    newBoard[x][y].deltaY ++;
                }
            }
        }
    });

    for(let i=0;i<width;i++) {
        if (newBoard[i].length > height) {
            // there are shadow elements, deal with them
            for (let j=height;j<newBoard[i].length;j++) {
                newBoard[i][j].deltaY += newBoard[i].length - height;
            }
        }
    }

    return newBoard;
}

function sweep(newBoard, width, height) {
    for(let i = 0; i < width; i++) {
        for(let j = 0; j < height; j++) {
            newBoard[i][j].deltaY = 0;
            if(newBoard[i][j].deleted) {
                newBoard[i].splice(j, 1);
                newBoard[i].unshift(newBoard[i].splice(height - 1, 1)[0]);
                newBoard[i][0].deltaY = 0;
            }
        }
    }
    return newBoard;
}

export default {
    find,
    mark,
    addPieces,
    sweep,
}
