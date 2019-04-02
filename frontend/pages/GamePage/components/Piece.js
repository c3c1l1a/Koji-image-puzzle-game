import React from 'react';
import styled from 'styled-components';

const Piece = styled.div.attrs((props) => ({
    style: {
        transform: `
            translate(
                ${props.deltaX * props.size}px,
                ${(props.y >= props.height ?
                    (props.height - props.y - 1) * props.size : props.y * props.size)
                    + (props.deltaY * props.size)}px
            ) ${props.deleted ? ' scale(0.01, 0.01)' : ''}
        `,        
    },
}))`
    ${(props) => props.animate && `transition: transform ${props.theme.general.animationLength / 1000}s ease-in-out`};
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
    margin: 3px;
    border-radius: 8px;
    box-shadow: 0 2px 10px 0 rgba(0,0,0,0.24);
    position: absolute;
    top: 0;
    left: ${(props) => props.x * props.size}px;
    background-color: ${({ color }) => color};

    ${({ selected }) => selected && `
        border: 2px dotted rgba(0,0,0,0.5);
        margin: 3px;
    `};

    ${(props) => props.image && `
        box-shadow: none;
        background: center / contain no-repeat url(${props.image});
    `}

    ${({ rowPower }) => rowPower && `
        border-radius: 100%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.42);
    `};

    ${(props) => props.typePower && `
        border-radius: 100%;
        box-shadow: inset 0 0 20px 15px rgba(0,0,0,0.70);
    `};
`;

export default Piece;
