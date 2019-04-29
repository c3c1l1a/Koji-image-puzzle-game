/** 
 * common/index.js
 * 
 * What it Does:
 *   This file sets up our react app to render inside of the root html
 *   file. The global css file is included here as well as our service
 *   worker is registered.
 * 
 * Things to Change:
 *   Anything outside of react that needs to be included in your project
 *   can go here. If you want additional CSS files you can include them
 *   here.
 */

import './index.css';
import * as serviceWorker from '.internals/serviceWorker';
import * as p5 from './p5.min.js';
import wrapConsole from 'koji_utilities/wrapConsole';
import App from 'pages/HomePage';

const { koji } = process.env;
window.koji = koji;

wrapConsole();
console.log('[koji] frontend started');

// Wire debug hooks for theme if in development environment
if (process.env.NODE_ENV !== 'production') {
    window.addEventListener('message', ({ data }) => {
        // Global context injection
        if (data.action === 'injectGlobal') {
            const { scope, key, value } = data.payload;
            window.koji[scope][key] = value;
        }
    }, false);
}

Object.entries(App).map(([name, module]) => {
  window[name] = module;
});

new p5();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
if (process.env.NODE_ENV === 'production') serviceWorker.register();
