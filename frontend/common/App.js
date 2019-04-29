/**
 * common/App.js
 * 
 * What it Does:
 *   This is our root React Element. The rest of our app is initialized here.
 *   In this file we set up the react context and styled-components theme
 *   to use our koji customization properties. Now anywhere in our react
 *   or styled components we can use these customizations. This file also
 *   sets up wrapConsole.js, which allows us to see console.log()'s in the
 *   koji preview window. Lastly this file sets up an event listener on 
 *   postMessage to see if the editor has sent us any new customization
 *   updates.
 * 
 * Things to Change:
 *   Any element or library that should be globally available accross all
 *   pages should be put here. Also this is a great place to put a router
 *   if you want multiple pages in your application.
 */

import React from 'react';
import styled, { ThemeProvider } from 'styled-components';

import Router from './Router';
import GlobalContext from './GlobalContext';
import wrapConsole from 'koji_utilities/wrapConsole';

const  { koji } = process.env;

const Container = styled.div`
    padding: 0;
    margin: 0;
`;

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      koji: koji || {},
    }
  }

  componentWillMount() {
    wrapConsole(); // eslint-disable-line no-native-reassign
    console.log('[koji] frontend started');

    // Wire debug hooks for theme if in development environment
    if (process.env.NODE_ENV !== 'production') {
        window.addEventListener('message', ({ data }) => {
            // Global context injection
            if (data.action === 'injectGlobal') {
                const { scope, key, value } = data.payload;
                let temp_koji = JSON.parse(JSON.stringify(this.state.koji));
                temp_koji[scope][key] = value;
                this.setState({ koji: temp_koji });
            }
        }, false);
    }
  }

  render() {
    return (
      <Container>
        <ThemeProvider theme={this.state.koji}>
          <GlobalContext.Provider value={this.state.koji}>
            <Router />
          </GlobalContext.Provider>
        </ThemeProvider>
      </Container>
    );
  }
}

export default App;
