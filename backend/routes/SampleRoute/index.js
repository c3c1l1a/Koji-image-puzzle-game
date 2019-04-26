/** 
 * routes/SampleRoute/index.js
 * 
 * What it does:
 *   Just an example of a route in koji with a corresponding koji.json
 *   file. The request preview window should show up to your right and
 *   send request should return 'Hello World!'
 * 
 * Things to Change:
 *   Make this route your own, create new routes with this as a base and
 *   edit this file to create any backend routes that you want
 */

export default async (req, res) => {
    console.log('request running...');
    res.status(200).json({ response: 'Hello World!' });
}
