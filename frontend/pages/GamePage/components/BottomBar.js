import React from 'react';
import styled from 'styled-components';

const BottomBox = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 0 8px;
    justify-content: space-between;
    align-items: center;
    font-size: ${({ size }) => size / 2}px;
`;

const ScoreDelta = styled.div.attrs((props) => ({
    style: {
        transform: `${props.scoreDeltaChange ? 'scale(1.5, 1.5)' : 'scale(1, 1)'}`,
    },
}))`
    transition: transform 0.25s ease-in-out;
    color: #FF4136;

    ${({ positive }) => positive && `
        color: #2ECC40;
        ::before {
            content: '+';
        }
    `}
`;

const Score = styled.div.attrs((props) => ({
    style: {
        transform: `${props.scoreChange ? 'scale(1.1, 1.1)' : 'scale(1, 1)'}`,
    },
}))`
    transition: transform 0.4s ease-in-out;
`;

class BottomBar extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            scoreChange: false,
            scoreDeltaChange: false,
        };
    }

    componentWillReceiveProps(newProps) {
        if(this.props.score !== newProps.score) {
            this.setState({ scoreChange: true });
            setTimeout(() => this.setState({ scoreChange: false }), 400);
        }

        if(this.props.scoreDelta !== newProps.scoreDelta) {
            this.setState({ scoreDeltaChange: true });
            setTimeout(() => this.setState({ scoreDeltaChange: false }), 200);
        }
    }

    render() {
        return (
            <BottomBox size={this.props.size}>
                <Score scoreChange={this.state.scoreChange}>{this.props.score}</Score>
                <ScoreDelta positive={this.props.scoreDelta > 0} scoreDeltaChange={this.state.scoreDeltaChange}>{this.props.scoreDelta}</ScoreDelta>
            </BottomBox>
        );
    }
}

export default BottomBar;
