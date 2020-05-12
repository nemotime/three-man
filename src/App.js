import React, { Component } from 'react';
import './App.css';
import one from './assets/one.png';
import two from './assets/two.png';
import three from './assets/three.png';
import four from './assets/four.png';
import five from './assets/five.png';
import six from './assets/six.png';
import diceGif from './assets/dice.gif';
import can from './assets/L50.png';

/*
#######################
ORDER OF PRIORITY
#######################


2. Speeding

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
1. Program for giving sips to desired player, update player sips using prevState

2. Simulate dice rolling

*/

class App extends Component {
  render() {
    const playerCount = this.state.players.filter((player) => player.name)
      .length;
    const SIPSINACAN = 16;
    const {
      players,
      currentPlayer,
      givingSips,
      givenSips,
      ruleSips,
      rolling,
    } = this.state;
    return (
      <div className="App">
        <div className="sidebar">
          <h2>{ruleSips}</h2>
          {this.state.playersSet ? (
            <span className="ruleHolder">
              <h3>Give rule sips</h3>
              <input
                onChange={(value) => this.handleSipChange(value)}
                className="smallInput"
                type="text"
                placeholder="# sips"
              />
            </span>
          ) : (
            ''
          )}
          {this.state.playersSet
            ? players.map((player, index) => {
                return (
                  <div>
                    <button
                      key={index}
                      onClick={() => this.displayRuleSips(index)}
                      className="ruleSips"
                    >
                      {players[index].name}
                    </button>
                  </div>
                );
              })
            : ''}
          <h3>Cans earned</h3>
          {this.state.playersSet
            ? players.map((player, index) => {
                return (
                  <div>
                    <h4>
                      {player.name} Sips Taken:{player.sipsTaken}
                    </h4>
                    {this.showCans(
                      parseInt(
                        player.sipsTaken / SIPSINACAN - player.minesUsed,
                      ),
                      index,
                    )}
                  </div>
                );
              })
            : ''}
        </div>
        <div className="mainApp">
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
                <form className="playerForm" onSubmit={this.handleSubmit}>
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
                  <button className="big">Vamonos</button>
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
          {/* here */}
          {!rolling ? (
            <span>
              <h2>{this.state.promptTextSum}</h2>
              {givingSips ? (
                <h2>
                  Who do you want to give {this.state.rolls[0] * 2} sips to?
                </h2>
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
                        type="button"
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
            </span>
          ) : (
            <span>
              <img className="rollingDice" alt="rolling dice" src={diceGif} />
              <img className="rollingDice" alt="rolling dice" src={diceGif} />
            </span>
          )}
          {/* here */}
        </div>
      </div>
    );
  }
  state = {
    numberOfDice: null,
    rolls: [],
    rollSum: null,
    promptTextSum: '',
    playersSet: false,
    players: [{ name: '', sipsTaken: 0, minesUsed: 0, minesNearby: 0 }],
    currentPlayer: 0,
    threeMan: null,
    givingSips: false,
    givenSips: '',
    sipsCirculating: 0,
    ruleSips: '',
    sipsFromRule: null,
    rolling: false,
    cannable: false,
    mined: false,
  };

  mineSomeone(minerID, minedID) {
    let { cannable, players } = this.state;
    let cannableNew = false;
    if (!cannable) {
      return;
    } else {
      let newPlayers = players;
      newPlayers[minerID].minesUsed++;
      newPlayers[minedID].minesNearby++;
      this.setState({
        players: newPlayers,
        cannable: cannableNew,
      });
    }
  }

  addSips(fromID, toID, sips) {
    let playersCopy = this.state.players;
    playersCopy[toID].sipsTaken += sips;
    console.log(
      playersCopy[toID].name +
        'has taken total: ' +
        playersCopy[toID].sipsTaken +
        ' sips.',
    );
    this.setState({
      players: playersCopy,
    });
  }

  showCans(number, player) {
    return <div>{this.amountOfCans(number, player)}</div>;
  }

  amountOfCans(i, player) {
    let { currentPlayer } = this.state;
    let cans = [];
    console.log(i);
    if (i === 0) {
      return;
    }
    while (i > 0) {
      cans.push(
        <img
          onClick={() => this.mineSomeone(player, currentPlayer)}
          className="can"
          alt="can"
          src={can}
        />,
      );
      i--;
    }
    return cans;
  }
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
      players: this.state.players.concat([
        { name: '', sipsTaken: 0, minesUsed: 0, minesNearby: 0 },
      ]),
    });
  };

  handleRemovePlayer = (idx) => () => {
    this.setState({
      players: this.state.players.filter((s, sidx) => idx !== sidx),
    });
  };

  diceAnim(timeout) {
    this.setState({ rolling: true });
    setTimeout(() => {
      this.setState({ rolling: false });
    }, timeout);
  }
  diceRoll = (numberOfDice) => {
    this.diceAnim(1000);
    let rolls = [];
    let rollSum = 0;
    for (let i = 0; i < numberOfDice; i++) {
      rolls[i] = Math.floor(Math.random() * 6) + 1;
      rollSum += rolls[i];
    }
    let givenSips = '';
    let givingSips = false;
    let cannable = true;
    this.setState(
      {
        numberOfDice,
        rolls,
        rollSum,
        givenSips,
        givingSips,
        cannable,
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
          'Person before you, (' +
          this.getPlayerBeforeName(players, currentPlayer) +
          ') drinks.\n\n';
        this.addSips(
          currentPlayer,
          this.getPlayerBeforeID(players, currentPlayer),
          1,
        );
        break;
      case 11:
        text =
          'Person after you (' +
          this.getPlayerAfterName(players, currentPlayer) +
          ') drinks.\n\n';
        this.addSips(
          currentPlayer,
          this.getPlayerAfterID(players, currentPlayer),
          1,
        );
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
    const { threeMan, players, rolls, currentPlayer } = this.state;
    let addedText = text;
    addedText += rolls
      .map((roll, index) => {
        switch (roll) {
          case 3:
            if (threeMan === null) return '';
            this.addSips(currentPlayer, threeMan, 1);
            return (
              '\nThree man (' + players[threeMan].name + ') you drink.\n\n'
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
    const { threeMan, currentPlayer } = this.state;
    if (rolls.length > 1) {
      if (rolls[0] === rolls[1] && rolls[0] !== 1) {
        if (rolls[0] === 3 && threeMan !== null) {
          const givenSips = 'Three man take 6 more sips\n';
          this.addSips(currentPlayer, threeMan, 6);
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
  getPlayerAfterID(players, currentPlayer) {
    let playerAfter = 0;
    if (currentPlayer !== players.filter((player) => player.name).length - 1) {
      playerAfter = currentPlayer + 1;
    }
    return playerAfter;
  }

  getPlayerBeforeID(players, currentPlayer) {
    let playerBefore = players.length - 1;
    if (currentPlayer !== 0) {
      playerBefore = currentPlayer - 1;
    }
    return playerBefore;
  }
  giveSelfSip(sips) {}

  giveSomeoneSips(sips) {
    const givingSips = true;
    const sipsCirculating = sips;
    this.setState({
      givingSips,
      sipsCirculating,
    });
  }

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
    const promptTextSum = '';
    this.addSips(currentPlayer, playerNum, sipsCirculating);
    let cannable = false;
    this.setState({
      givenSips,
      givingSips,
      promptTextSum,
      cannable,
    });
  }

  displayRuleSips(playerNum) {
    let { players, sipsFromRule, currentPlayer } = this.state;
    console.log('sips from rule: ' + sipsFromRule);
    this.addSips(currentPlayer, playerNum, parseInt(sipsFromRule));
    const ruleSips =
      players[playerNum].name +
      ' took ' +
      sipsFromRule +
      (sipsFromRule === '1'
        ? " sip because they can't follow rules."
        : " sips because they can't follow rules.");
    this.setState({
      ruleSips,
    });
  }

  handleSipChange(evt) {
    this.setState({
      sipsFromRule: evt.target.value,
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
