import React from 'react';
import styled, { keyframes } from 'styled-components';
import { GlobalContext } from '../GlobalContext';

const Container = styled.div`
    background-color: ${({ theme }) => theme.colors.backgroundColor};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: ${({ theme }) => theme.colors.textColor};
    text-align: center;
`;

const AppLogoSpin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Content = styled.p`

`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.linkColor};
`;

const Icon = styled.div`
    animation: ${AppLogoSpin} infinite 20s linear;
    height: 40vmin;
    width: 40vmin;
    pointer-events: none;
    background-image: url(${({ theme }) => theme.images.icon});
    background-size: cover;
`;

class Game extends React.PureComponent {
  render() {
    return (
      <Container>
        <Icon />
        <Content>{this.context.strings.content}</Content>
        <Link
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
          >
            Learn React
        </Link>
      </Container>
    );
  }
}

Game.contextType = GlobalContext;

export default Game;


// import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <p>
//             Edit <code>src/App.js</code> and save to reload.
//           </p>
//           <a
//             className="App-link"
//             href="https://reactjs.org"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Learn React
//           </a>
//         </header>
//       </div>
//     );
//   }
// }

// export default App;
