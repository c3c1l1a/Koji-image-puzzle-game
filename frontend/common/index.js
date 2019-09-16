/* eslint-disable */

/**
 * common/index.js
 *
 * What it Does:
 *   This file sets up our p5 app to render inside of the root html
 *   file. The global css file is included here as well as our service
 *   worker is registered.
 */
import Koji from '@withkoji/vcc'
import './index.css'

Koji.pageLoad()
window.Koji = Koji

// Load p5 sketches here!
require('script-loader!app/index.js')

new p5()

// DO NOT TOUCH
if (module.hot) {
  module.hot.accept('script-loader!app/index.js', () => {
    const oldCanvas = document.getElementsByTagName('canvas')[0]
    oldCanvas.parentNode.removeChild(oldCanvas)

    require('script-loader!app/index.js')
    new p5()
  })
}
