import { h, Component } from 'preact';
import index from '../index.js';

export default class GameContainer extends Component {
	componentDidMount(){
		this.p5Game = new p5(index, document.getElementById('game-container'));
	}

	componentWillUnmount() {
    	this.p5Game.remove();
	}
	render(){
		return <div id={'game-container'}></div>;
	}
}