import React from 'react';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import GlobalContext from 'GlobalContext';
import { Helmet } from 'react-helmet';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

import Game from './components/Game';

const Container = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    height: 100vh;
    background: url(${({ theme }) => theme.general.backgroundImage});
    background-size: cover;
    background-position: center;
    flex-direction: column;
    text-align:center;
`;

function getFontFamily(ff) {
    const start = ff.indexOf('family=');
    if(start === -1) return 'sans-serif';
    let end = ff.indexOf('&', start);
    if(end === -1) end = undefined;
    return ff.slice(start + 7, end);
}

const Cover = styled.div`
    transition: opacity 0.7s ease-in-out;
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(transparent 0, ${({ color }) => color});
    opacity: ${({ colorSwitch }) => colorSwitch ? 1 : 0};
`;

const Content = styled.div`
    width: 100%;
    height: 100vh;
    opacity: 1;
    z-index: 1;
    color: ${({ theme }) => theme.style.textColor};
    text-shadow: 0 1px 6px rgba(0,0,0,0.7);
    font-family: '${({ theme }) => getFontFamily(theme.general.fontFamily)}', sans-serif;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const VolumeControl = styled.div`
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 14px;
    background-color: rgba(0,0,0,0.6);
    border-radius: 6px;
    padding: 6px;
    display: flex;
    align-items: center;
    color: white;

    &:hover {
        background-color: rgba(0,0,0,0.9);
    }
`;

const Title = styled.h1`
    font-size: 32px;
    margin: 0;
    margin-bottom: 12px;
`;

const Animation = keyframes`
    0% {
        transform: scale(1,1);
    }
    50% {
        transform: scale(0.85,0.85);
    }
    100% {
        transform: scale(1,1);
    }
`;

const Start = styled.button`
    max-width: 320px;
    font-size: 24px;
    background: rgba(0,0,0,0.7);
    border: 4px solid ${({ theme }) => theme.style.textColor};
    color: ${({ theme }) => theme.style.textColor};
    box-shadow: 0 2px 12px rgba(0,0,0,0.24);
    text-shadow: 0 1px 6px rgba(0,0,0,0.4);
    cursor: pointer;
    padding: 10px 64px;
    border-radius: 1000px;
    margin-bottom: 10vh;
    animation: ${Animation} 2s ease-in-out infinite;

    transition: background-color 0.1s ease-in-out;

    &:hover {
        background-color: rgba(0,0,0,0.3);
    }
`;

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            color: '#fff',
            start: false,
            muted: localStorage.getItem('muted') === 'true' || false,
        };
    }

  flash(color) {
    this.setState({ color, colorSwitch: true });
    setTimeout(() => this.setState({ colorSwitch: false }), 700);
  }

  toggleMute(muted) {
      this.setState({ muted });
      localStorage.setItem('muted', muted);
  }

  render() {
    return (
        <Container color={this.state.color}>
            <Helmet defaultTitle={this.context.general.name}>
                <link href={this.context.general.fontFamily} rel="stylesheet" />
                <link rel="icon" href={this.context.metadata.icon} sizes="32x32" />
            </Helmet>
            <Cover color={this.state.color} colorSwitch={this.state.colorSwitch} />
            <Content>
                <VolumeControl>
                    {this.state.muted ? 
                        <FaVolumeMute onClick={() => this.toggleMute(false)} />
                      : <FaVolumeUp onClick={() => this.toggleMute(true)} />
                    }
                </VolumeControl>
                <Title>{this.context.general.name}</Title>
                {this.state.start ? (
                    <Game onFlash={(color) => this.flash(color)} muted={this.state.muted} />
                ) : (
                    <Start onClick={() => this.setState({ start: true })}>{this.context.general.buttonText}</Start>
                )}
            </Content>
        </Container>
    );
  }
}

HomePage.contextType = GlobalContext;

export default HomePage;
