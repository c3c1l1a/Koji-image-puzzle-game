import * as p5 from './p5.min.js';
import wrapConsole from './helpers/wrapConsole';
import App from './src';

console.log('[koji] Frontend loaded');

Object.entries(App).map(([name, module]) => {
  window[name] = module;
});

new p5();
