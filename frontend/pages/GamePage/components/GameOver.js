import React from 'react';
import styled, { ThemeProvider } from 'styled-components';

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

    :hover {
        background-color: #DDD;
    }
`;

const GameOver = ({ onClose, score }) => (
    <Overlay>
        <Modal>
            <Text>Game Over</Text>
            <Text>Score: {score}</Text>
            <Button onClick={() => onClose()}>Play Again</Button>
        </Modal>
    </Overlay>
);

export default GameOver;
