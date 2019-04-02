import React from 'react';
import styled, { keyframes } from 'styled-components';

const pow = keyframes`
    0% {
        transform: rotate(-45deg) scale(0.5, 0.5);
    }

    30% {
        opacity: 1;
    }

    70% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: rotate(-15deg) scale(1, 1);
    }
`;

const Effect = styled.div`
    animation: ${pow} ${({ theme }) => theme.general.animationLength / 1000}s ease-in-out;
    opacity: 0;
    position: absolute;
    top: ${(props) => (props.y * props.size)}px;
    left: ${(props) => ((props.x - 1) * props.size)}px;
    color: #000;
    width: ${({ size }) => size * 3}px;
    text-align: center;
    font-size: ${({ size }) => size}px;
    color: ${({ color }) => color};
    text-shadow: 0 1px 6px rgba(0,0,0,0.42);
`;

export default Effect;
