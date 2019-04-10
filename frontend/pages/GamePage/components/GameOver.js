import React from 'react';
import styled, { ThemeProvider } from 'styled-components';

import Scoring from '../helpers/Scoring.js';

const Overlay = styled.div`
    transition: background-color 0.5s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background-color: rgba(0,0,0,0.4);
    flex-direction: column;
    text-align:center;
    position: absolute;
    top: 0;
    left:0;
`;

const Modal = styled.div`
    width: 250px;
    background-color: ${({ theme }) => theme.style.backgroundColor};
    box-shadow: 0 6px 22px 0 rgba(0,0,0,0.42);
    padding: 16px;
`;

const Text = styled.h1`
    font-size: 32px;
`;

const Button = styled.button`
    outline: none;
    border: 1px solid ${({ theme }) => theme.style.textColor};
    color: ${({ theme }) => theme.style.textColor};
    background: none;
    font-size: 24px;
    transition: background 0.1s ease-in-out;
    cursor: pointer;
    margin-top: 16px;

    :hover {
        background-color: #DDD;
    }
`;

const Score = styled.div`
    font-size: 20px;
    color: ${({ theme }) => theme.style.textColor};
    ${(props) => props.me && `
        color: ${props.theme.style.primaryColor};
        font-weight: bold;
    `}
`;

const TextInput = styled.input.attrs(() => ({ type: 'text' }))`
    font-size: 18px;
    width: 100%;
    margin-bottom: 16px;
`;

class GameOver extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            scores: [],
            screen: 'name',
            name: '',
        };
    }

    componentDidMount() {
        Scoring.getScores().then((resp) => {
            console.log(resp);
            this.setState({ scores: resp.scores });
        });
    }

    submitScore() {
        Scoring.addScore(this.state.name, this.props.score);
        this.setState({ screen: 'scores' });
    }

    render() {
        return (
            <Overlay>
                {this.state.screen === 'name' && (
                    <Modal>
                        <Text>Game Over</Text>
                        <Text>Score: {this.props.score}</Text>
                        <TextInput placeholder="Name" value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} />
                        <Button onClick={() => this.submitScore()}>Submit Score</Button>
                    </Modal>
                )}
                {this.state.screen === 'scores' && (
                    <Modal>
                        <Text>High Scores</Text>
                        {this.state.scores.concat([{name: this.state.name, score: this.props.score, me: true }]).sort((a, b) => a.score < b.score).slice(0, 10).sort((a, b) => a.score < b.score).map((score, i) => (
                            <Score me={score.me}>{i + 1}: {score.name} - {score.score}</Score>
                        ))}
                        <Button onClick={() => this.props.onClose()}>Play Again</Button>
                    </Modal>
                )}
            </Overlay>
        );
    }
}

export default GameOver;
