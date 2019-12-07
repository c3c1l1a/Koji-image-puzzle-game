/* eslint-disable */


/**
 * common/index.js
 *
 * What it Does:
 *   This file sets up our p5 app to render inside of the root html
 *   file. The global css file is included here as well as our service
 *   worker is registered.
 */
import Koji from '@withkoji/vcc';
import { h, render } from 'preact';
import './index.css';

Koji.pageLoad()
window.Koji = Koji

function init(){
	let GameContainer = require('../app/components/GameContainer').default;
	console.log(GameContainer);
	render(<GameContainer />, document.body, root);
}
init();

// DO NOT TOUCH
if (module.hot) {
  module.hot.accept('../app/components/GameContainer', () => init());
}
