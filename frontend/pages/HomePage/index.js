import React from 'react';
import styled, { keyframes } from 'styled-components';

import GlobalContext from '../../common/GlobalContext';
import Request from '../../koji_utilities/request';

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
    width: 60vmin;
    pointer-events: none;
    background-image: url(${({ theme }) => theme.images.icon});
    background-size: cover;
`;

class HomePage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            response: '',
        };
    }

    componentDidMount() {
        Request(this.context.backend.SampleRoute).then((resp) => console.log(resp));
    }

    render() {
        return (
            <Container>
                <Icon />
                <Content>{this.context.strings.content}</Content>
                <Content>{this.state.response}</Content>
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

HomePage.contextType = GlobalContext;

export default HomePage;
