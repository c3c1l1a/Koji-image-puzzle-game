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

const Moves = styled.div.attrs((props) => ({
    style: {
        transform: `${props.movesChange ? 'scale(2, 2)' : 'scale(1, 1)'}`,
    },
}))`
    transition: transform 0.25s ease-in-out;
`;

const Score = styled.div.attrs((props) => ({
    style: {
        transform: `${props.scoreChange ? 'scale(2, 2)' : 'scale(1, 1)'}`,
    },
}))`
    transition: transform 0.4s ease-in-out;
`;

class BottomBar extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            scoreChange: false,
            movesChange: false,
        };
    }

    componentWillReceiveProps(newProps) {
        if(this.props.score !== newProps.score) {
            this.setState({ scoreChange: true });
            setTimeout(() => this.setState({ scoreChange: false }), 400);
        }

        if(this.props.moves !== newProps.moves) {
            this.setState({ movesChange: true });
            setTimeout(() => this.setState({ movesChange: false }), 200);
        }
    }

    render() {
        return (
            <BottomBox size={this.props.size}>
                <Score scoreChange={this.state.scoreChange}>{this.props.score}</Score>
                <Moves movesChange={false}>{this.props.moves} {this.props.moves === 1 ? 'Move' : 'Moves'} Left</Moves>
            </BottomBox>
        );
    }
}

export default BottomBar;
