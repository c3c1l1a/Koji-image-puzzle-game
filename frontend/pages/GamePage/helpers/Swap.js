// helper functions for swapping two pieces

function setupAnimation(newBoard, p1, p2) {

    // change the deltas, to set up to animate the pieces
    if(p1.y === p2.y) {
        newBoard[p1.x][p1.y].deltaX = p1.x > p2.x ? -1 : 1;
        newBoard[p2.x][p2.y].deltaX = p1.x > p2.x ? 1 : -1;
        newBoard[p1.x][p1.y].deltaY = 0;
        newBoard[p2.x][p2.y].deltaY = 0;
    } else {
        newBoard[p1.x][p1.y].deltaY = p1.y > p2.y ? -1 : 1;
        newBoard[p2.x][p2.y].deltaY = p1.y > p2.y ? 1 : -1;
        newBoard[p1.x][p1.y].deltaX = 0;
        newBoard[p2.x][p2.y].deltaX = 0;
    }
    return newBoard;
}

function swapPieces(newBoard, p1, p2) {
    // reset fields from animation
    newBoard[p1.x][p1.y].deltaX = 0;
    newBoard[p2.x][p2.y].deltaX = 0;
    newBoard[p1.x][p1.y].deltaY = 0;
    newBoard[p2.x][p2.y].deltaY = 0;
    newBoard[p1.x][p1.y].selected = false;
    newBoard[p2.x][p2.y].selected = false;

    // swap the pieces in the dom
    let tmp = newBoard[p1.x][p1.y];
    newBoard[p1.x][p1.y] = newBoard[p2.x][p2.y];
    newBoard[p2.x][p2.y] = tmp;

    return newBoard;
}

export default {
    setupAnimation,
    swapPieces,
}