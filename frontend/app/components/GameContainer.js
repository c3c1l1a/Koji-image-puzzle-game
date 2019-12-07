import { h, Component } from 'preact';

export default class GameContainer extends Component {
	componentWillMount() {
		require('script-loader!app/index.js');
	}

	commponentDidMount(){
		this.p5Game = new p5(null, document.getElementById('game-container'));
	}

	componentWillUnmount() {
    	this.p5Game.remove();
	}
	render(){
		return <div id={'game-container'}></div>;
	}
}