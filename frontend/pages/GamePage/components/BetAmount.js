import React from 'react';
import styled from 'styled-components';

const BottomBox = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 0 8px;
    justify-content: center;
    align-items: center;
    font-size: ${({ size }) => size / 4}px;
`;

const Button = styled.div`
    padding: 5px;
    margin-right: 8px;
    border: 2px solid white;
    border-radius: 4px;
    cursor: pointer;
    ${({ active }) => active && `
        background-color: rgba(22,230,50,0.7);
        transform: scale(1.1, 1.1);
    `}
`;

const BetAmount = ({ size, currentBet, onChangeBet, bets }) => (
    <BottomBox size={size}>
        {bets.split(',').map((bet) => (
            <Button key={bet} active={currentBet === bet} onClick={() => onChangeBet(bet)}>{bet}</Button>
        ))}
            <Button key={'Max'} active={!bets.split(',').includes(currentBet)} onClick={() => onChangeBet('Max')}>Max</Button>
    </BottomBox>
);

export default BetAmount;
