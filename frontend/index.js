import React from 'react';
import ReactDOM from 'react-dom';

import AppContainer from 'helpers/AppContainer';

import 'sanitize.css';

ReactDOM.render(
  <AppContainer />,
  document.getElementById('app'),
);

if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install();
}
