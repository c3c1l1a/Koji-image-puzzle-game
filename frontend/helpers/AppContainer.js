import React from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeProvider } from 'styled-components';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import ReactGA from 'react-ga';

import Router from './Router';

import GlobalStyle from 'GlobalStyles';
import GlobalContext from 'GlobalContext';

const { koji } = process.env;

const Wrapper = styled.div`
    margin: 0 auto;
    width: 100vw;
    min-height: 100vh;
`;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { ...(koji || {}) };
    }
    
    componentDidMount() {
        // add google analytics if we have it
        if(koji.metadata.gaCode) {
            ReactGA.initialize(koji.metadata.gaCode);
            ReactGA.pageview(window.location.pathname + window.location.search);
        }

        // Wire debug hooks for theme if in development environment
        if (process.env.NODE_ENV !== 'production') {
            window.addEventListener('message', ({ data }) => {
                // Global context injection
                if (data.action === 'injectGlobal') {
                    const { scope, key, value } = data.payload;
                    this.setState((prevState) => {
                        prevState[scope][key] = value;
                        return prevState;
                    });
                }
            }, false);
        }
    }

    render() {
        return (
            <ThemeProvider theme={this.state}>
                <GlobalContext.Provider value={this.state}>
                    <GlobalStyle />
                    <Wrapper>
                        <Router />
                    </Wrapper>
                </GlobalContext.Provider>
            </ThemeProvider>
        );
    }
}

export default App;