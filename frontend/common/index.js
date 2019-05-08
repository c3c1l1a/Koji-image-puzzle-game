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
import Koji from 'koji-tools';
import './index.css';

Koji.pageLoad();
window.Koji = Koji;

require('script-loader!app/index.js');
new p5();
