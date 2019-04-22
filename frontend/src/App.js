import React from 'react';
import styled, { ThemeProvider } from 'styled-components';

import Game from './components/Game';
import Config from './config.json';
import GlobalContext from './GlobalContext';
import wrapConsole from './helpers/wrapConsole';

const Container = styled.div`
    padding: 0;
    margin: 0;
`;

class App extends React.PureComponent {
  constructor(props) {
      super(props);

      this.state = {};
  }

  componentWillMount() {
    wrapConsole(); // eslint-disable-line no-native-reassign
    console.log('[koji] frontend started');
  }

  render() {
    return (
      <Container>
        <ThemeProvider theme={Config}>
          <GlobalContext.Provider value={Config}>
            <Game />
          </GlobalContext.Provider>
        </ThemeProvider>
      </Container>
    );
  }
}

export default App;
