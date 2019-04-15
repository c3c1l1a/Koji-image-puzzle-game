import React from 'react';
import styled from 'styled-components';

import GlobalContext from 'GlobalContext';

import Piece from './Piece';
import Effect from './Effect';
import GameOver from './GameOver';
import BottomBar from './BottomBar';
import BetAmount from './BetAmount';

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
`;

const ReRoll = styled.div`
    margin-top: 16px;
    font-size: ${({ blockSize }) => blockSize / 2}px;
    border: 5px solid white;
    border-radius: ${({ blockSize }) => blockSize / 4}px;
    background-color: rgba(0,0,0,0.1);
    :hover {
        background-color: rgba(0,0,0,0.6);
        ${({ disabled }) => disabled && 'background-color: rgba(240, 30, 10, 0.8);'}
    }

    :active {
        transform: scale(1.1, 1.1);
    }
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease-in-out;
    ${({ disabled }) => disabled && 'background-color: rgba(240, 30, 10, 0.8);'}
`;

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            board: [],
            effects: [],
            score: 0,
            scoreChange: 0,
            blockSize: 50,
            currentBet: 100,
            gameOver: false,
            rowsSpinning: 0,
        };

    }

    componentDidMount() {
        this.backgroundMusic = Sound.findAndLoop(this.context.sounds.backgroundMusic, this.props.muted);
        this.winSound = Sound.find(this.context.sounds.winSound);
        this.loseSound = Sound.find(this.context.sounds.loseSound);
        Scoring.getScores();

        document.addEventListener('keypress', (e) => {
            console.log(e.keyCode);
            if(e.keyCode === 32) {
                // space was pressed
                this.reroll();
            }
        })
        
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
            score: parseInt(this.context.general.startScore),
            currentBet: this.context.general.bets.split(',')[0],
            gameOver: false,
        }, () => this.checkMatches());
    }

    prepMatching(callback) {
        this.setState({
            pieceSelected: undefined,
            busy: true,
        }, () => callback());
    }

    copy(e) {
        return JSON.parse(JSON.stringify(e));
    }

    checkMatches() {
        let newBoard = this.copy(this.state.board);
        
        let found = Match.find(newBoard, this.context.general.width, this.context.general.height);
        console.log(found);
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
                Sound.play(this.winSound, this.props.muted);
                this.props.onFlash(Util.getColor(newBoard[found[0].x][found[0].y].type));

                newBoard = Match.mark(newBoard, found, this.context.general.width, this.context.general.height);
                this.collectEffects(newBoard, found);
                this.setState({ board: newBoard });
            }, () => {
            }, () => {
              if(!this.context.general.bets.split(',').includes(this.state.currentBet)) {
                this.setState({ currentBet: this.state.score });
              }
            });
        } else {
            this.setState({ scoreChange: -this.state.currentBet });
            Sound.play(this.loseSound, this.props.muted);
            // we are done, commit..., and check game over
            setTimeout(() => {
                this.setState({ busy: false, effects: [], gameOver: this.state.moves === 0 });
            }, this.context.general.animationTime);
        }
    }

    startSpin() {
        this.setState({
            rowsSpinning: this.context.general.width,
            score: this.state.score - this.state.currentBet,
        });

        this.spinterval = setInterval(() => {
            let newBoard = [];
            const numTypes = Util.getNumTypes();
            for(let i=0; i<this.context.general.width - this.state.rowsSpinning;i++) {
                newBoard.push([]);
                for(let j=0;j<this.context.general.height;j++) {
                    newBoard[i].push(this.state.board[i][j]);
                }
            }
            
            for(let i=this.context.general.width - this.state.rowsSpinning;i<this.context.general.width;i++) {
                newBoard.push([]);
                for(let j=0;j<this.context.general.height;j++) {
                    newBoard[i].push(Util.newElement(numTypes));
                }
            }

            this.setState({
                board: newBoard,
            });

        }, 100)
    }

    stopSpin() {
        if(this.state.rowsSpinning !== 1) {
            this.setState({ rowsSpinning: this.state.rowsSpinning - 1 });
        } else {
            this.setState({ rowsSpinning: 0 });
            clearInterval(this.spinterval);
            this.checkMatches();
        }
    }

    reroll() {
        if(this.state.rowsSpinning === 0) {
            if(this.state.score < this.state.currentBet) return;
            this.startSpin();
        } else {
            this.stopSpin();
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
        console.log(marked);
        let newScore = this.state.score;
        marked.forEach((mark) => {
            let amount = this.context.general.baseScore * (this.state.currentBet / 100);
            let color = Util.getColor(newBoard[mark.x][mark.y].type);
            effects.push({ x: mark.x, y: mark.y, amount, color });
            newScore += amount; 
        });

        newScore = Math.round(newScore);
        let scoreDelta = Math.round((newScore - this.state.score) - this.state.currentBet);

        this.setState({ score: newScore, effects: this.state.effects.concat(effects), scoreChange: scoreDelta });
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
                            matched={e.matched}
                            size={this.state.blockSize}
                            spinning={this.state.rowsSpinning}
                            height={this.context.general.height}
                            animate={this.state.animate}
                            color={Util.getColor(e.type)}
                            image={Util.getImage(e.type)}
                            onClick={() => this.reroll()}
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
                    scoreDelta={this.state.scoreChange}
                />
                <BetAmount
                    bets={this.context.general.bets}
                    size={this.state.blockSize}
                    currentBet={this.state.currentBet}
                    onChangeBet={(newBet) => {
                        if(this.state.rowsSpinning !== 0) return;
                        if (newBet === 'Max') {
                            this.setState({ currentBet: this.state.score });
                        } else {
                            this.setState({ currentBet: newBet });
                        }
                    }} 
                />
                <ReRoll disabled={this.state.rowsSpinning === 0 && this.state.score < this.state.currentBet} onClick={() => this.reroll()} blockSize={this.state.blockSize}>{this.state.rowsSpinning === 0 ? 'Spin Again' : 'Stop'}</ReRoll>

                {this.state.gameOver && (
                    <GameOver score={this.state.score} onClose={() => this.newGame()} />
                )}
            </Container>
        );
	}
}

Game.contextType = GlobalContext;

export default Game;
