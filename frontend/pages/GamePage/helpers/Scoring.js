// High score table stuff
import { Request, Routes } from 'helpers/api';

function getScores() {
    return new Promise((resolve, reject) => {
        Request(Routes.GetScores).then((response) => {
            resolve(response);
        })
    })
}

function addScore(name, score) {
    return new Promise((resolve, reject) => {
        Request(Routes.AddScore, {
            body: {
                name,
                score,
            }
        }).then((response) => {
            console.log(response);
        })
    });
}

export default {
    getScores,
    addScore,
};
