import React from 'react';
import styled, { ThemeProvider } from 'styled-components';

import HomePage from '../pages/HomePage';
import GlobalContext from './GlobalContext';
import wrapConsole from '../koji_utilities/wrapConsole';

const  { koji } = process.env;

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
        <ThemeProvider theme={koji}>
          <GlobalContext.Provider value={koji}>
            <HomePage />
          </GlobalContext.Provider>
        </ThemeProvider>
      </Container>
    );
  }
}

export default App;
