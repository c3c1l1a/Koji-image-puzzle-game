// just random stuff that doesn't fit anywhere else.
let { koji } = process.env;

function getBlockSize(rows, columns) {
    return Math.min(
        (window.innerWidth - 32) / rows,
        (window.innerHeight - 70) / (parseInt(columns) + 1)
    );
}

function getColor(type) {
    return koji.style[`piece${type + 1}`];
}

function getImage(type) {
    return koji.pieces[`image${type + 1}`];
}

function getNumTypes() {
    let i = 0;
    while(koji.pieces[`image${i + 1}`] && koji.pieces[`image${i + 1}`].length !== 0) i ++;
    console.log(i);
    return i;
}

function newElement(numTypes) {
    return {
        selected: false,
        type: Math.floor(Math.random() * numTypes),
        deltaY: 0,
        deltaX: 0,
        deleted: false,
        rowPower: false,
        typePower: false,
    };
}


export default {
    getBlockSize,
    newElement,
    getNumTypes,
    getColor,
    getImage,
};
