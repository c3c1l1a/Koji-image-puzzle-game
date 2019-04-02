
function find(sound) {
    return (sound && sound.length > 0) ? new Audio(sound) : undefined;
}

function findAndLoop(sound, muted) {
    let found = find(sound);
    if(found) {
        found.loop = true;
        found.autoplay = true;
        if(muted) {
            found.pause();
        }
    }
    return found;
}

function play(sound, muted) {
    if(sound && !muted) {
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }
}

export default {
    find,
    findAndLoop,
    play,
}