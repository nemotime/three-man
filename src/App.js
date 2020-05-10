import React, { Component } from 'react';
import './App.css';
import one from './assets/one.png';
import two from './assets/two.png';
import three from './assets/three.png';
import four from './assets/four.png';
import five from './assets/five.png';
import six from './assets/six.png';

/*
State for players, state for 3-man, state for rules
Player order: Have player order for 7's 11's etc
Allow input for rules

FORMAT:
###########################################################################
o Dice Total
o Single Dice Value
Value: ______ Consequence:___________ Amount of Sips: ______________

e.g. When 4 total is rolled, give sips (4 sips)
###########################################################################

Dimuneur for placing mines to cancel a roll, count how many sips people have drank and grant them a "CAN" to mine people's rolls
People who are mined have a % chance to hit the mine
Parse for "next player" and "previous player" maybe RANDOM PLAYER?
*/

class App extends Component {
  render() {
    const playerCount = this.state.players.filter((player) => player.name)
      .length;
    return (
      <div className="App">
        <h1>Three Man</h1>
        <h2>
          Player order:{' '}
          {this.state.players.map((player, index) => (
            <span>
              {player.name}
              {index === playerCount - 1 || playerCount === 0 ? '' : ', '}
            </span>
          ))}
        </h2>
        <h2>{this.state.promptTextSum}</h2>
        <div className="buttons">
          {this.state.playersSet ? (
            [1, 2, 3, 4, 5].map((number) => {
              let text = number === 1 ? 'die' : 'dice';
              return (
                <button
                  key={number}
                  onClick={() => this.diceRoll(number)}
                  className="button"
                >
                  {number} {text}
                </button>
              );
            })
          ) : (
            <div>
              <h2>Please enter player names to start</h2>
              <form onSubmit={this.handleSubmit}>
                {this.state.players.map((player, idx) => (
                  <div className="player">
                    <input
                      type="text"
                      placeholder={`Player #${idx + 1} name`}
                      value={player.name}
                      onChange={this.handlePlayerNameChange(idx)}
                    />
                    <button
                      type="button"
                      onClick={this.handleRemovePlayer(idx)}
                      className="small"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={this.handleAddPlayer}
                  className="small"
                >
                  Add Player
                </button>
                <button>Vamanos</button>
              </form>
            </div>
          )}
        </div>
        {this.state.rolls.map((roll, index) => (
          <DiceImage roll={roll} key={index} />
        ))}
      </div>
    );
  }
  state = {
    numberOfDice: null,
    rolls: [],
    rollSum: null,
    promptTextSum: '',
    playersSet: false,
    players: [{ name: '' }],
    currentPlayer: 0,
  };

  handlePlayerNameChange = (idx) => (evt) => {
    const newPlayers = this.state.players.map((player, sidx) => {
      if (idx !== sidx) return player;
      return { ...player, name: evt.target.value };
    });

    this.setState({ players: newPlayers });
  };

  handleSubmit = (evt) => {
    this.setState({
      playersSet: true,
    });
  };

  handleAddPlayer = () => {
    this.setState({
      players: this.state.players.concat([{ name: '' }]),
    });
  };

  handleRemovePlayer = (idx) => () => {
    this.setState({
      players: this.state.players.filter((s, sidx) => idx !== sidx),
    });
  };
  diceRoll = (numberOfDice) => {
    let rolls = [];
    let rollSum = 0;
    for (let i = 0; i < numberOfDice; i++) {
      rolls[i] = Math.floor(Math.random() * 6) + 1;
      rollSum += rolls[i];
    }
    this.setState(
      {
        numberOfDice,
        rolls,
        rollSum,
      },
      () => {
        this.getResult();
        this.resolveRules();
      },
    );
  };
  resolveRules() {
    return;
  }
  getResult() {
    var text;

    switch (this.state.rollSum) {
      case 2:
        text = 'You drink.';
        break;
      case 3:
        text = 'You are Three Man';
        break;
      case 7:
        text = 'Person before you drinks';
        break;
      case 11:
        text = 'Person after you drinks';
        break;
      case 12:
        text = 'Make a new rule';
        this.makeRule();
        break;
      default:
        text = 'Nothing happens';
        break;
    }
    console.log(text);
    return this.setState({
      promptTextSum: text,
    });
  }
  makeRule() {}
}

const DiceImage = ({ roll }) => {
  if (roll === 1) {
    return <img className="dice-image" src={one} alt="1" />;
  } else if (roll === 2) {
    return <img className="dice-image" src={two} alt="2" />;
  } else if (roll === 3) {
    return <img className="dice-image" src={three} alt="3" />;
  } else if (roll === 4) {
    return <img className="dice-image" src={four} alt="4" />;
  } else if (roll === 5) {
    return <img className="dice-image" src={five} alt="5" />;
  } else if (roll === 6) {
    return <img className="dice-image" src={six} alt="6" />;
  }
};

export default App;
