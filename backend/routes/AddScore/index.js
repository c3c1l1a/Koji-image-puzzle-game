/**
 * Create a new post
 */

import * as uuid from 'uuid';
import Jiro from '@madewithjiro/jiro-sdk';
const { Store } = new Jiro();

export default async (req, res) => {
    const { name, score } = req.body;
    console.log(name);

    if (!name || !score) {
        res.status(400).json({ error: 'Request is missing information' });
        return;
    }

    console.log('Adding to high score table');

    // Build the post object
    const scoreData = {
        name,
        score,
        datePosted: Math.floor(Date.now() / 1000),
    };
    console.log(scoreData);

    // Insert the post
    let scores = (await Store.get('gems', 'scores'));
    if(!scores) scores = [];
    else scores = scores.scores;
    scores.push(scoreData);
    await Store.set('gems', 'scores', {
        scores,
    });
    console.log('Score Added!');

    // Return the post id to the client
    res.status(200).json({ success: true });
}
