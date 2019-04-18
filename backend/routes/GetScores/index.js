import Jiro from '@madewithjiro/jiro-sdk';
const { Store } = new Jiro();

export default async (req, res) => {
    // Get all the most recent posts
    console.log('Getting all of the scores')
    let scores = await Store.get('gems', 'scores');
    if(!scores) scores = { scores: [] };
    
    res.status(200).json({ scores: scores.scores });
}
