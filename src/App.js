import React, { Component } from 'react';
import './App.css';
import one from './assets/one.png';
import two from './assets/two.png';
import three from './assets/three.png';
import four from './assets/four.png';
import five from './assets/five.png';
import six from './assets/six.png';

/*
#######################
ORDER OF PRIORITY
#######################
1. Program for giving sips to desired player, update player sips using prevState

2. Simulate dice rolling

3. Demineur for placing mines to cancel a roll, count how many sips people have drank and grant them a "CAN" to mine people's rolls
People who are mined have a % chance to hit the mine

4. Allow input for rules, states for it
Parse for "next player" and "previous player" maybe RANDOM PLAYER?

FORMAT:
###########################################################################
o Dice Total
o Single Dice Value
Value: ______ Consequence:___________ Amount of Sips: ______________

e.g. When 4 total is rolled, give sips (4 sips)
###########################################################################


###############################
              DONE
###############################
Player order: Have player order for 7's 11's etc
State for players, state for 3-man

*/

class App extends Component {
  render() {
    const playerCount = this.state.players.filter((player) => player.name)
      .length;
    const { players, currentPlayer, givingSips, givenSips } = this.state;
    return (
      <div className="App">
        <h1 className="titleTop">
          {this.state.threeMan !== null
            ? this.state.players[this.state.threeMan].name + ' is '
            : ''}
          <span className="three">Three</span>
          <span className="man">man</span>
        </h1>
        <h2>
          Player order:{' '}
          {this.state.players.map((player, index) => (
            <span>
              {player.name}
              {index === playerCount - 1 || playerCount === 0 ? '' : ', '}
            </span>
          ))}
        </h2>
        {this.state.playersSet ? (
          <h1 className="turnPlaceholder">
            {this.state.players[this.state.currentPlayer].name}
            's turn
          </h1>
        ) : (
          ''
        )}
        <div className="buttons">
          {this.state.playersSet ? (
            [1, 2].map((number) => {
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
                <button>Vamonos</button>
              </form>
            </div>
          )}
          {this.state.playersSet ? (
            <button className="endButton" onClick={this.setNextPlayer}>
              End Turn
            </button>
          ) : (
            ''
          )}
        </div>
        <h1>
          {this.state.playersSet && this.state.rollSum
            ? this.state.players[this.state.currentPlayer].name + "'s roll:"
            : ''}
        </h1>
        <h2>{this.state.promptTextSum}</h2>
        {givingSips ? (
          <h2>Who do you want to give {this.state.rolls[0] * 2} sips to?</h2>
        ) : (
          ''
        )}
        {givingSips
          ? players.map((player, index) => {
              if (player === players[currentPlayer]) return '';
              return (
                <button
                  key={index}
                  onClick={() => this.displayGivenSips(index)}
                  className="sipGiver"
                >
                  {players[index].name}
                </button>
              );
            })
          : ''}
        <h2>{givenSips}</h2>
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
    players: [{ name: '', sips: 0 }],
    currentPlayer: 0,
    threeMan: null,
    givingSips: false,
    givenSips: '',
    sipsCirculating: 0,
  };

  whoRolled() {
    if (this.state.currentPlayer - 1 === -1) {
      return this.state.players.filter((player) => player.name).length - 1;
    } else {
      return this.state.currentPlayer - 1;
    }
  }

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
    let givenSips = '';
    let givingSips = false;
    this.setState(
      {
        numberOfDice,
        rolls,
        rollSum,
        givenSips,
        givingSips,
      },
      () => {
        this.getResult();
        this.resolveRules();
      },
    );
  };
  // endTurn() {
  // }
  resolveRules() {
    return;
  }
  getResult() {
    var text;
    let { rollSum, rolls, currentPlayer, players } = this.state;
    switch (rollSum) {
      case 2:
        if (rolls[0] === 1) {
          text = 'You drink.\n';
        } else {
          text = '';
        }
        break;
      case 3:
        if (rolls[0] === 1 || rolls[0] === 2) {
          text = players[currentPlayer].name + ', you are Three Man.\n';
          this.setThreeMan(this.state.currentPlayer);
        } else {
          text = '';
        }
        break;
      case 7:
        text =
          'Person before you, ' +
          this.getPlayerBeforeName(players, currentPlayer) +
          ', drinks.\n\n';
        break;
      case 11:
        text =
          'Person after you, ' +
          this.getPlayerAfterName(players, currentPlayer) +
          ', drinks.\n\n';
        break;
      case 12:
        text = 'Make a new rule or';
        this.makeRule();
        break;
      default:
        text = '';
        break;
    }
    text = this.checkEachDice(text);
    if (text.length === 0) {
      text = 'Nothing happens.\n';
    } else if (text === '-1') {
      text = '';
    }
    return this.setState({
      promptTextSum: text,
    });
  }

  checkEachDice(text) {
    const { threeMan, players, rolls } = this.state;
    let addedText = text;
    addedText += rolls
      .map((roll, index) => {
        console.log(roll);
        switch (roll) {
          case 3:
            if (threeMan === null) return '';
            return (
              '\nThree man, ' + players[threeMan].name + ', you drink.\n\n'
            );
          default:
            return '';
        }
      })
      .join('');
    if (this.checkPair(rolls) && addedText === '') {
      addedText = '-1';
    }
    return addedText;
  }
  checkPair(rolls) {
    if (rolls.length > 1) {
      if (rolls[0] === rolls[1] && rolls[0] !== 1) {
        if (rolls[0] === 3) {
          const givenSips = 'Three man take 6 more sips\n';
          this.setState({
            givenSips,
          });
        } else {
          this.giveSomeoneSips(rolls[0] * 2);
          return true;
        }
      }
    }
  }
  setThreeMan(player) {
    this.setState({
      threeMan: player,
    });
  }
  getPlayerAfterName(players, currentPlayer) {
    let playerAfter = 0;
    if (currentPlayer !== players.filter((player) => player.name).length - 1) {
      playerAfter = currentPlayer + 1;
    }
    return players[playerAfter].name;
  }

  getPlayerBeforeName(players, currentPlayer) {
    let playerBefore = players.length - 1;
    if (currentPlayer !== 0) {
      playerBefore = currentPlayer - 1;
    }
    return players[playerBefore].name;
  }
  giveSelfSip(sips) {}

  giveSomeoneSips(sips) {
    const givingSips = true;
    const sipsCirculating = sips;
    this.setState({
      givingSips,
      sipsCirculating,
    });

    // const { players, currentPlayer } = this.state;
    // players.map((player, index) => {
    //   if (player === players[currentPlayer]) return '';
    //   return (
    //     <button
    //       key={index}
    //       onClick={() => this.displayGivenSips(index)}
    //     ></button>
    //   );
    // });
  } //in this one, let the player choose who

  displayGivenSips(playerNum) {
    let { players, currentPlayer, sipsCirculating } = this.state;
    const givenSips =
      players[currentPlayer].name +
      ' gave ' +
      sipsCirculating +
      ' sips to ' +
      players[playerNum].name +
      '.';
    const givingSips = false;
    this.setState({
      givenSips,
      givingSips,
    });
  }
  makeRule() {}

  setNextPlayer = () => {
    let currentPlayer = 0;
    let rolls = [];
    let rollSum = 0;
    let promptTextSum = '';
    if (
      this.state.currentPlayer !==
      this.state.players.filter((player) => player.name).length - 1
    ) {
      currentPlayer = this.state.currentPlayer + 1;
    }
    this.setState({
      currentPlayer,
      rolls,
      rollSum,
      promptTextSum,
    });
  };
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
