import React from 'react';
import styled from 'styled-components';

import GlobalContext from 'GlobalContext';

import Piece from './Piece';
import Effect from './Effect';
import GameOver from './GameOver';
import BottomBar from './BottomBar';

import Sound from '../helpers/Sound.js';
import Match from '../helpers/Match.js';
import Swap from '../helpers/Swap.js';
import Delete from '../helpers/Delete.js';
import Util from '../helpers/Util.js';
import Scoring from '../helpers/Scoring.js';

const Pieces = styled.div`
	display: flex;
	align-items: center;
	width: ${({ width }) => width}px;
	height: ${({ height }) => height}px;
    position: relative;
    margin: 0 auto;
    overflow: hidden;
`;

const Container = styled.div`
    width: ${({ width }) => width}px;
    margin: 0 auto;
    margin-bottom: 24px;
`;

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            board: [],
            effects: [],
            score: 0,
            moves: 0,
            multiplier: 1,
            blockSize: 50,
            swipeStart: { x: 0, y: 0 },
            swipeDelta: { x: 0, y: 0 },
            swiping: false,
            pieceSelected: false,
            gameOver: false,
        };

    }

    componentDidMount() {
        this.backgroundMusic = Sound.findAndLoop(this.context.sounds.backgroundMusic, this.props.muted);
        this.swappingSound = Sound.find(this.context.sounds.swappingSound);
        this.matchingSound = Sound.find(this.context.sounds.matchingSound);
        Scoring.getScores();
        
        // calculate max size for blocks given screen size.
        this.setState({
            blockSize: Util.getBlockSize(this.context.general.width, this.context.general.height),
        });
        
        this.newGame();
    }

    componentWillReceiveProps(newProps) {
        if(this.backgroundMusic) {
            if(newProps.muted && !this.props.muted) {
                this.backgroundMusic.pause();
            } else if(!newProps.muted && this.props.muted) {
                this.backgroundMusic.play();
            }
        }
    }

    newGame() {
        // make a new state of the game at the base start point
        let newBoard = [];
        const numTypes = Util.getNumTypes();
        for(let i=0;i<this.context.general.width;i++) {
            newBoard.push([]);
            for(let j=0;j<this.context.general.height;j++) {
                newBoard[i].push(Util.newElement(numTypes));
            }
        }

        this.setState({
            board: newBoard,
            moves: parseInt(this.context.general.moves),
            score: 0,
            multiplier: 1,
            gameOver: false,
        }, () => this.checkMatches());
    }
        
    prepMatching(callback) {
        this.setState({
            pieceSelected: undefined,
            busy: true,
            moves: this.state.moves - 1,
            multiplier: 1,
        }, () => callback());
    }

    copy(e) {
        return JSON.parse(JSON.stringify(e));
    }

    checkMatches() {
        let newBoard = this.copy(this.state.board);
        
        let found = Match.find(newBoard, this.context.general.width, this.context.general.height);
        if (found.length > 0) {
            // we have at least one match, deal with it.

            this.manageAnimation(() => {
                // setup
                newBoard = this.copy(this.state.board);
                newBoard = Match.addPieces(newBoard, found);
                this.setState({ board: newBoard });
            }, () => {
                // animate
                newBoard = this.copy(this.state.board);
                Sound.play(this.matchingSound, this.props.muted);
                this.props.onFlash(Util.getColor(newBoard[found[0].x][found[0].y].type));

                newBoard = Match.mark(newBoard, found, this.context.general.width, this.context.general.height);
                this.collectEffects(newBoard, found);
                this.setState({ board: newBoard });
            }, () => {
                // update dom
                newBoard = this.copy(this.state.board);
                newBoard = Match.sweep(newBoard, this.context.general.width, this.context.general.height);
                // cleaned, reset state then lets run it again
                this.setState({ board: newBoard, multiplier: this.state.multiplier + 1 });
            }, () => {
                // callback
                this.checkMatches();
            });
        } else {
            // we are done, commit..., and check game over
            setTimeout(() => {
                this.setState({ busy: false, effects: [], gameOver: this.state.moves === 0 });
            }, this.context.general.animationTime);
        }
    }

    swapPieces(p1, p2) {
        let newBoard = {};
        // animate swap
        this.manageAnimation(() => {
            // setup
            Sound.play(this.swappingSound, this.props.muted);
        }, () => {
            // animate
            newBoard = this.copy(this.state.board);
            newBoard = Swap.setupAnimation(newBoard, p1, p2);
            this.setState({ board: newBoard })
        }, () => {
            // update dom
            newBoard = this.copy(this.state.board);
            newBoard = Swap.swapPieces(newBoard, p1, p2);
            // cleaned, on to the next thing
            this.setState({ board: newBoard });
        }, () => {
            // callback
            this.prepMatching(() => this.checkMatches());
        });
    }

    pieceClick(x, y) {
        if(this.state.busy) return;
        let newBoard = this.copy(this.state.board);

        if (this.state.pieceSelected) {
            // check orothogonality
            if (Math.abs(x - this.state.pieceSelected.x) + Math.abs(y - this.state.pieceSelected.y) === 1) {
                // we have orthogorality, swap pieces and see if theres a match.
                this.swapPieces({ x, y }, this.state.pieceSelected);
            } else {
                newBoard[this.state.pieceSelected.x][this.state.pieceSelected.y].selected = false;
                this.setState({ board: newBoard, pieceSelected: undefined });
            }
        } else {
            newBoard[x][y].selected = true;
            this.setState({ board: newBoard, pieceSelected: { x, y } });
        }
    }

    manageAnimation(setup, animationState, finalState, callback) {
        // a function that spaces out all of the different parts of the animation cycle
        // this is needed because sometimes we need transition to be on in the css
        // and sometimes we need it to be off.
        const propagationDelay = 10;
        setup();
        setTimeout(() => {
            this.setState({ animate: true }, () => {
                setTimeout(() => {
                    animationState();
                    setTimeout(() => {
                        this.setState({ animate: false }, () => {
                            setTimeout(() => {
                                finalState();
                                setTimeout(() => callback(), propagationDelay);
                            }, propagationDelay);
                        });
                    }, this.context.general.animationLength);
                }, propagationDelay);
            });
        }, propagationDelay);
    }

    collectEffects(newBoard, marked) {
        let effects = [];
        let newScore = this.state.score;
        marked.forEach((mark) => {
            let amount = this.context.general.baseScore * this.state.multiplier;
            let color = Util.getColor(newBoard[mark.x][mark.y].type);
            effects.push({ x: mark.x, y: mark.y, amount, color });
            newScore += amount; 
        });

        this.setState({ score: newScore, effects: this.state.effects.concat(effects) });
    }

    startSwipe(e, x, y) {
        this.setState({ swiping: true, swipeStart: { x: e.clientX, y: e.clientY } });
        this.pieceClick(x, y);
    }

    moveSwipe(e) {
        if (this.state.swiping) {
            this.setState({ swipeDelta: {
                x: e.clientX - this.state.swipeStart.x,
                y: e.clientY - this.state.swipeStart.y,
            }});
        }
    }

    endSwipe(e) {
        e.preventDefault();
        let dx = this.state.swipeDelta.x;
        let dy = this.state.swipeDelta.y;
        this.setState({ swiping: false, swipeStart: { x: 0, y: 0 }, swipeDelta: { x: 0, y: 0 } });

        if(Math.abs(dx) + Math.abs(dy) > this.state.blockSize / 2) {
            if(Math.abs(dx) > Math.abs(dy)) {
                this.pieceClick(this.state.pieceSelected.x + (dx > 0 ? 1 : -1), this.state.pieceSelected.y);
            } else {
                this.pieceClick(this.state.pieceSelected.x, this.state.pieceSelected.y + (dy > 0 ? 1 : -1));
            }
        } else {
            // if the swipe is not far its a click, just hang out.
        }
    }

	render() {
		return (
            <Container width={this.context.general.width * this.state.blockSize}>
                <Pieces width={this.context.general.width * this.state.blockSize} height={this.context.general.height * this.state.blockSize}>
                    {this.state.board.map((row, x) => row.map((e, y) => (
                        <Piece
                            key={`(${x},${y})`}
                            type={e.type}
                            selected={e.selected}
                            rowPower={e.rowPower}
                            typePower={e.typePower}
                            deleted={e.deleted}
                            deltaY={e.deltaY}
                            deltaX={e.deltaX}
                            x={x}
                            y={y}
                            size={this.state.blockSize}
                            height={this.context.general.height}
                            animate={this.state.animate}
                            color={Util.getColor(e.type)}
                            image={Util.getImage(e.type)}
                            onTouchEnd={(e) => this.endSwipe(e)}
                            onMouseUp={(e) => this.endSwipe(e)}
                            onTouchMove={(e) => this.moveSwipe(e.touches[0])}
                            onMouseMove={(e) => this.moveSwipe(e)}
                            onTouchStart={(e) => this.startSwipe(e.touches[0], x, y)}
                            onMouseDown={(e) => this.startSwipe(e, x, y)}
                        />
                    )))}
                    {this.state.effects.map((effect) => (
                        <Effect
                            x={effect.x}
                            y={effect.y}
                            size={this.state.blockSize}
                            color={effect.color}
                        >{effect.amount}</Effect>
                    ))}
                </Pieces>
                <BottomBar
                    size={this.state.blockSize}
                    score={this.state.score}
                    moves={this.state.moves}
                />

                {this.state.gameOver && (
                    <GameOver score={this.state.score} onClose={() => this.newGame()} />
                )}
            </Container>
        );
	}
}

Game.contextType = GlobalContext;

export default Game;
