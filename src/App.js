import React, { Component } from 'react';
import UIfx from 'uifx';
import './App.css';
import one from './assets/one.png';
import two from './assets/two.png';
import three from './assets/three.png';
import four from './assets/four.png';
import five from './assets/five.png';
import six from './assets/six.png';
import diceGif from './assets/dice.gif';
import can from './assets/L50.png';

import onetwoSound from './assets/sfx/1-2.wav';
import threethreeSound from './assets/sfx/3-3.wav';
import dicerollSound from './assets/sfx/dice-roll.mp3';
import endturnSound from './assets/sfx/end-turn.mp3';
import hitmineSound from './assets/sfx/hit-mine.mp3';
import joinSound from './assets/sfx/join.mp3';
import leaveSound from './assets/sfx/leave.mp3';
import mineSound from './assets/sfx/mine.mp3';
import melSound from './assets/sfx/mel.mp3';
import spankSound from './assets/sfx/spank.mp3';
import hitmarkerSound from './assets/sfx/hitmarker.mp3';

const onetwoSFX = new UIfx(onetwoSound, {
  volume: 1, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const threethreeSFX = new UIfx(threethreeSound, {
  volume: 0.4, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const dicerollSFX = new UIfx(dicerollSound, {
  volume: 1, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const endturnSFX = new UIfx(endturnSound, {
  volume: 0.3, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const hitmineSFX = new UIfx(hitmineSound, {
  volume: 0.8, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const joinSFX = new UIfx(joinSound, {
  volume: 0.4, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const leaveSFX = new UIfx(leaveSound, {
  volume: 0.4, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const mineSFX = new UIfx(mineSound, {
  volume: 0.8, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const melSFX = new UIfx(melSound, {
  volume: 0.1, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const spankSFX = new UIfx(spankSound, {
  volume: 0.3, // number between 0.0 ~ 1.0
  throttleMs: 100,
});
const hitmarkerSFX = new UIfx(hitmarkerSound, {
  volume: 0.7, // number between 0.0 ~ 1.0
  throttleMs: 100,
});

/*
#######################
ORDER OF PRIORITY
#######################

4.9 sound effects  CUT EMPTY SOUND FROM DICE ROLL
YEP and MEL skin


5. Dice Stats
#3 man sips taken
Times rolled a # (per person, in the game)

??????????
MAYBE
???????????
1.69 If nothing happens only end turn
600. Warn about mines around you

FORMAT:
###########################################################################
o Dice Total
o Single Dice Value
Value: ______ Consequence:___________           //Amount of Sips: ______________

e.g. When 4 total is rolled, give sips (4 sips)
###########################################################################


###############################
              DONE
###############################
BUG: IF YOU ARE SPEEDING IT DOESN'T CANCEL THE ROLL (check speeding before giving sips)
BUG: MINES CANT BLOCK THE GAME FROM GIVING BASE RULE SIPS e.g. (1,1), 7's, 11's (3,3) @@@@@@@@FIXED@@@@@@@@@
AND DONT REVERSE THE SPEED GUN AND DOESN'T NEGATE BECOMING 3MAN //not fixed yet//
queueSpeedGun+1
queue3ManChanges
Steps: gamesSips are queued. Only given when the person takes their next roll or ends their turn.
Mining reverses the speed gun
Player order: Have player order for 7's 11's etc
State for players, state for 3-man
0.01 FLAG PLAYERS IF THEY LEAVE THE GAME, UNFLAG IF THEY COME BACK? DONT DISPLAY FLAGGED PLAYERS
0.1 Split dice on double
1. Program for giving sips to desired player, update player sips using prevState
1. Mid-game drop in drop out
1.69420 roll off table scales with sips
2. Simulate dice rolling
2. Speeding
2.5 fix one dice 1 aniamtion
3. Demineur for placing mines to cancel a roll, count how many sips people have drank and grant them a "CAN" to mine people's rolls
People who are mined have a % chance to hit the mine
4.5. Remove rule button
4. Allow input for rules, states for it
Parse for "next player" and "previous player" maybe RANDOM PLAYER? (format below)
4.75 if rule is on it, shouldnt say nothing happens
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
      mined,
      speeding,
      numberOfDice,
      makingRule,
      rollTotalsWithRules,
      dieWithRules,
      showingStats,
      splittingSips,
      removingRule,
      firstSipsGiven,
      glowEndTurn,
      someoneLeft,
    } = this.state;
    let mainAppClass = 'mainApp';
    let overlayClass = '';
    if (players[currentPlayer].name === 'Mel') {
      overlayClass += 'overlay';
      mainAppClass += ' mel';
    }
    let endClass = 'endButton';
    if (glowEndTurn) {
      endClass += ' glowingEnd';
    }
    return (
      <div className="App">
        <table className="sidebar">
          <tbody>
            <tr>
              <td className="tableRules">
                <div className="sidebar1">
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
                        //@@@@@@@@@@@@@@dont display flagged players@@@@@@@@@@@@@@
                        if (player.removedFromGame) {
                          return '';
                        }
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
                </div>
              </td>
              <td className="tableCans">
                <div className="sidebar2">
                  {this.state.playersSet ? (
                    <div className="addPlayer">
                      <input
                        onChange={(value) => this.handlePlayerName(value)}
                        className="smallInput"
                        type="text"
                        placeholder="Enter player name"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          this.handleAddNewPlayer(this.state.newPlayerName)
                        }
                        className="small"
                      >
                        Add Player
                      </button>
                    </div>
                  ) : (
                    ''
                  )}
                  {this.state.playersSet ? <h3>Cans earned</h3> : ''}
                  {this.state.playersSet
                    ? players.map((player, index) => {
                        //@@@@@@@@@@@@@don't display flagged players@@@@@@@@@@@@@@
                        if (player.removedFromGame) {
                          return '';
                        }
                        return (
                          <div>
                            <h4>
                              {player.name} took {player.sipsTaken} sips.&nbsp;
                              <button
                                type="button"
                                onClick={this.handleRemovePlayer(index)}
                                className="dropPlayer"
                              >
                                Leave
                              </button>
                              <button
                                type="button"
                                onClick={() => this.setThreeMan(index)}
                                className="dropPlayer setThreeManButton"
                              >
                                3MAN
                              </button>
                            </h4>
                            {this.showCans(
                              parseInt(
                                player.sipsTaken / SIPSINACAN -
                                  player.minesUsed,
                              ),
                              index,
                            )}
                          </div>
                        );
                      })
                    : ''}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className={mainAppClass}>
          <div className={overlayClass}>
            <div className="titleHolder">
              <h1 className="titleTop">
                {this.state.threeMan !== null
                  ? this.state.players[this.state.threeMan].name + ' is '
                  : ''}
                <span className="three">Three</span>
                <span className="man">man</span>
              </h1>
            </div>
            <h2>
              Player order:{' '}
              {this.state.players.map((
                player,
                index, //@@@@@@@@@@@don't display flagged players@@@@@@@@@@@@@@@@@
              ) =>
                player.removedFromGame ? (
                  ''
                ) : (
                  <span>
                    {player.name}
                    {index === playerCount - 1 || playerCount === 0 ? '' : ', '}
                  </span>
                ),
              )}
            </h2>
            {this.state.playersSet ? (
              <h1 className="turnPlaceholder">
                {this.state.players[this.state.currentPlayer].name}'s turn
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
                      disabled={rolling}
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
                    <button className="big">Léo</button>
                  </form>
                </div>
              )}
              {this.state.playersSet ? (
                <button
                  disabled={rolling}
                  className={endClass}
                  onClick={this.setNextPlayer}
                >
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
            {!mined ? (
              <span>
                {!rolling ? (
                  <span>
                    <h2>{!speeding ? this.state.promptTextSum : ''}</h2>
                    {givingSips ? (
                      <span>
                        {makingRule ? (
                          <div className="makeRule">
                            <button
                              type="button"
                              className="button"
                              onClick={() => this.cancelRule()}
                            >
                              or Cancel a Rule
                            </button>
                            <h3>Make a rule with number showing on a dice</h3>
                            {[1, 2, 3, 4, 5, 6].map((number) => {
                              let diceClassName = 'diceRule';
                              if (dieWithRules[number]) {
                                diceClassName += ' diceHasRule';
                              }
                              if (removingRule && !dieWithRules[number]) {
                                return '';
                              }
                              return (
                                <button
                                  key={number}
                                  onClick={() => this.setDieRule(number)}
                                  className={diceClassName} //was button
                                >
                                  {number}
                                </button>
                              );
                            })}
                            <br />
                            <h3>Make a rule with the total of the roll</h3>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                              (number) => {
                                let diceClassName = 'diceRule';
                                if (rollTotalsWithRules[number]) {
                                  diceClassName += ' diceHasRule';
                                }
                                if (
                                  removingRule &&
                                  !rollTotalsWithRules[number]
                                ) {
                                  return '';
                                }
                                return (
                                  <button
                                    key={number}
                                    onClick={() =>
                                      this.setDiceTotalRule(number)
                                    }
                                    className={diceClassName} //was button
                                  >
                                    {number}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        ) : (
                          ''
                        )}
                        <h2>
                          Who do you want to give {this.state.rolls[0] * 2} sips
                          to?
                        </h2>
                        {!splittingSips ? (
                          <button
                            type="button"
                            className="button"
                            onClick={() => this.splitSips()}
                          >
                            Split Sips
                          </button>
                        ) : (
                          ''
                        )}
                      </span>
                    ) : (
                      ''
                    )}
                    {givingSips
                      ? players.map((player, index) => {
                          //@@@@@@@skip players who are flagged@@@@@@@@@
                          if (player === players[currentPlayer]) return '';
                          if (player.removedFromGame) {
                            return '';
                          }
                          return (
                            <button
                              key={index}
                              onClick={() =>
                                this.displayGivenSips(index, false)
                              }
                              className="sipGiver"
                              type="button"
                            >
                              {players[index].name}
                            </button>
                          );
                        })
                      : ''}
                    {splittingSips
                      ? players.map((player, index) => {
                          //@@@@@@@skip players who are flagged@@@@@@@@@
                          if (player === players[currentPlayer]) return '';
                          if (player.removedFromGame) {
                            return '';
                          }

                          return (
                            <button
                              key={index}
                              onClick={() => this.displayGivenSips(index, true)}
                              className="sipGiver"
                              type="button"
                              disabled={!firstSipsGiven}
                            >
                              {players[index].name}
                            </button>
                          );
                        })
                      : ''}
                    <h2>{givenSips}</h2>
                    {speeding && givenSips === '' ? (
                      <h2>You got caught speeding, end your turn</h2>
                    ) : (
                      ''
                    )}
                    {this.state.rolls.map((roll, index) => (
                      <DiceImage roll={roll} key={index} />
                    ))}
                  </span>
                ) : (
                  <span>
                    <img
                      className="rollingDice"
                      alt="rolling dice"
                      src={diceGif}
                    />
                    {numberOfDice === 2 ? (
                      <img
                        className="rollingDice"
                        alt="rolling dice"
                        src={diceGif}
                      />
                    ) : (
                      ''
                    )}
                  </span>
                )}
              </span>
            ) : (
              <h2>You got mined, re-roll</h2>
            )}

            {/* here */}
          </div>
        </div>
        <div className="stats">
          <button type="button" onClick={() => this.toggleStats()}>
            {showingStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          {showingStats ? JSON.stringify(players) : ''}
        </div>
        {this.state.playersSet ? (
          <span className="leftSideHolder">
            <textarea className="ruleBox"></textarea>
            <br />
            <button
              type="button"
              className="button someonesRule"
              onClick={() => this.cancelSomeonesRule()}
            >
              {removingRule && someoneLeft
                ? 'Stop cancelling rules'
                : 'Cancel a rule'}
            </button>
            {removingRule && someoneLeft ? (
              <div className="makeRule">
                <h3>Cancel a rule on a die</h3>

                {[1, 2, 3, 4, 5, 6].map((number) => {
                  let diceClassName = 'diceRule';
                  if (dieWithRules[number]) {
                    diceClassName += ' diceHasRule';
                  }
                  if (!dieWithRules[number]) {
                    return '';
                  }
                  return (
                    <button
                      key={number}
                      onClick={() => this.setDieRule(number)}
                      className={diceClassName} //was button
                    >
                      {number}
                    </button>
                  );
                })}
                <br />
                <h3>Cancel a rule on the dice total</h3>

                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => {
                  let diceClassName = 'diceRule';
                  if (rollTotalsWithRules[number]) {
                    diceClassName += ' diceHasRule';
                  }
                  if (!rollTotalsWithRules[number]) {
                    return '';
                  }
                  return (
                    <button
                      key={number}
                      onClick={() => this.setDiceTotalRule(number)}
                      className={diceClassName} //was button
                    >
                      {number}
                    </button>
                  );
                })}
              </div>
            ) : (
              ''
            )}
          </span>
        ) : (
          ''
        )}
      </div>
    );
  }
  state = {
    numberOfDice: null,
    rolls: [],
    rollSum: null,
    promptTextSum: '',
    playersSet: false,
    playerSipQueue: [],
    players: [
      {
        name: '',
        sipsTaken: 0,
        minesUsed: 0,
        minesNearby: 0,
        timesBecame: 0,
        timesSip3: 0,
        removedFromGame: false,
      },
    ],
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
    speedGun: 0,
    speeding: false,
    newPlayerName: null,
    makingRule: false,
    customRules: [''],
    showingStats: false,
    splittingSips: false,
    rollTotalsWithRules: {
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
      10: false,
      11: false,
      12: false,
    },
    dieWithRules: {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
    },
    speedingChangedState: false,
    speedGunAdded: false,
    threeManChangedState: null,
    isThreeManChanged: false,
    removingRule: false,
    firstSipsGiven: false,
    glowEndTurn: false,
    someoneLeft: false,
  };

  cancelRule() {
    let removingRule = true;
    this.setState({
      removingRule,
    });
  }

  cancelSomeonesRule() {
    let removingRule = !this.state.removingRule;
    let someoneLeft = !this.state.someoneLeft;
    this.setState({
      removingRule,
      someoneLeft,
    });
  }

  queueSips(fromID, toID, sips) {
    const { playerSipQueue } = this.state;
    let newPlayerSipQueue = playerSipQueue;
    if (isNaN(newPlayerSipQueue[toID])) {
      newPlayerSipQueue[toID] = sips;
    } else {
      newPlayerSipQueue[toID] += sips;
    }
    //let playerSipQueue = JSON.parse(JSON.stringify(players));
    // playerSipQueue[toID].sipsTaken += sips;
    this.setState({
      playerSipQueue: newPlayerSipQueue,
    });
  }
  resolveSips() {
    let { playerSipQueue, players } = this.state;
    let newPlayers = JSON.parse(JSON.stringify(players));
    playerSipQueue.map((player, index) => {
      if (!isNaN(player)) newPlayers[index].sipsTaken += player;
      return '';
    });
    this.setState({
      players: newPlayers,
      playerSipQueue: [],
    });
  }

  revokeSips() {
    this.setState({
      playerSipQueue: [],
    });
  }
  addSips(fromID, toID, sips) {
    let playersCopy = this.state.players;
    playersCopy[toID].sipsTaken += sips;
    this.setState({
      players: playersCopy,
    });
  }
  splitSips() {
    const { sipsCirculating } = this.state;
    let newSips = Math.floor(sipsCirculating / 2);
    this.setState({
      splittingSips: true,
      sipsCirculating: newSips,
    });
  }

  toggleStats() {
    //buggy
    const { showingStats } = this.state;
    let opposite = !showingStats;
    this.setState({
      showingStats: opposite,
    });
  }

  validateIntegerInput(input, floor = 0, ceiling = 99999) {
    return !isNaN(input) || input >= floor || input <= ceiling;
  }

  checkHasRule(useTotalOfRoll, value) {
    //useTotalOfRule is a boolean, false indicates that the rule has to be checked for individual dice, true just checks the total
    const { dieWithRules, rollTotalsWithRules } = this.state;
    if (useTotalOfRoll) {
      return rollTotalsWithRules[value];
    } else {
      return dieWithRules[value];
    }
  }
  setDieRule(number) {
    const { dieWithRules, removingRule } = this.state;
    let newRules = dieWithRules;
    let promptTextSum;

    if (removingRule) {
      newRules[number] = false;
      promptTextSum = 'Rule on ' + number + ' removed!';
    } else {
      newRules[number] = true;
      promptTextSum = 'Rule on ' + number + ' made!';
    }
    let makingRule = false;
    let givingSips = false;
    this.setState({
      dieWithRules: newRules,
      makingRule,
      givingSips,
      promptTextSum,
    });
  }

  setDiceTotalRule(number) {
    const { rollTotalsWithRules, removingRule } = this.state;
    let newRules = rollTotalsWithRules;
    let promptTextSum;

    if (removingRule) {
      newRules[number] = false;
      promptTextSum = 'Rule on ' + number + ' removed!';
    } else {
      newRules[number] = true;
      promptTextSum = 'Rule on ' + number + ' made!';
    }

    let makingRule = false;
    let givingSips = false;
    this.setState({
      rollTotalsWithRules: newRules,
      makingRule,
      givingSips,
      promptTextSum,
    });
  }

  handleAddNewPlayer(newPlayerName) {
    this.setState({
      players: this.state.players.concat([
        {
          name: newPlayerName,
          sipsTaken: 0,
          minesUsed: 0,
          minesNearby: 0,
          removedFromGame: false,
        },
      ]),
    });
    joinSFX.play();
  }

  handlePlayerName(evt) {
    this.setState({
      newPlayerName: evt.target.value,
    });
  }
  mineSomeone(minerID, minedID) {
    let {
      cannable,
      players,
      threeManChangedState,
      isThreeManChanged,
      speedingChangedState,
      speedGunAdded,
    } = this.state;
    let newSpeedGun = this.state.speedGun - 1;
    let cannableNew = false;
    if (!cannable) {
      return;
    } else {
      mineSFX.play();

      if (isThreeManChanged) {
        this.setThreeMan(threeManChangedState);
      }
      if (speedingChangedState) {
        this.setState({
          speeding: false,
          speedGun: newSpeedGun,
        });
      }
      if (speedGunAdded) {
        this.setState({
          speedGun: newSpeedGun,
        });
      }
      //set speeding to false and decrement speed gun
      let newPlayers = players;
      newPlayers[minerID].minesUsed++;
      newPlayers[minedID].minesNearby++;
      let mined = true;
      this.setState({
        playerSipQueue: [],
        players: newPlayers,
        cannable: cannableNew,
        mined,
      });
    }
  }

  calculateHittingMineChance(playerID) {
    const { players } = this.state;
    const inverseSipFrequencyFactor = 2.5;
    let isff = (inverseSipFrequencyFactor * 10) / players.length;
    let playerBeforeID = this.getPlayerBeforeID(players, playerID);
    let playerAfterID = this.getPlayerAfterID(players, playerID);
    let playerBeforeMines = players[playerBeforeID].minesNearby;
    let playerAfterMines = players[playerAfterID].minesNearby;
    let myMines = players[playerID].minesNearby;
    let odds = 0;
    odds +=
      2 **
        ((myMines + 0.2 * playerBeforeMines + 0.2 * playerAfterMines) / isff) -
      1;
    if (odds > 15) {
      odds = 15;
    }
    console.log('the odds are ' + odds);
    return odds;
  }

  calculateOddsToRollOffTable(playerID) {
    const drunkScaler = 3.14159 * 0.1;
    const { players } = this.state;
    return (drunkScaler * players[playerID].sipsTaken) / 16;
  }

  showCans(number, player) {
    return <div>{this.amountOfCans(number, player)}</div>;
  }

  amountOfCans(i, player) {
    let { currentPlayer } = this.state;
    let cans = [];
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
  // whoRolled() {
  //   if (this.state.currentPlayer - 1 === -1) {
  //     return this.state.players.filter((player) => player.name).length - 1;
  //   } else {
  //     return this.state.currentPlayer - 1;
  //   }
  // }

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
        {
          name: '',
          sipsTaken: 0,
          minesUsed: 0,
          minesNearby: 0,
          timesBecame: 0,
          timesSip3: 0,
          removedFromGame: false,
        },
      ]),
    });
    joinSFX.play();
  };

  handleRemovePlayer = (idx) => () => {
    const { playersSet, players, threeMan } = this.state;

    if (playersSet && players.length === 1) {
      return;
    }

    leaveSFX.play();
    let flaggedPlayers = players;
    flaggedPlayers[idx].removedFromGame = true;

    if (idx === threeMan) {
      this.setState({
        threeMan: null,
      });
    }

    if (playersSet) {
      this.setState({ players: flaggedPlayers });
      return;
    }

    this.setState({
      players: this.state.players.filter((s, sidx) => idx !== sidx),
    });
    console.log(players);
  };

  diceAnim(timeout) {
    this.setState({ rolling: true });
    setTimeout(() => {
      this.setState({ rolling: false });
    }, timeout);
  }

  diceRoll = (numberOfDice) => {
    dicerollSFX.play();

    const { speeding, speedGunQueued, currentPlayer } = this.state;
    let { speedGun } = this.state;

    if (speedGunQueued) {
      this.resolveSpeedGun(currentPlayer);
    }
    if (!speeding) {
      this.resolveSips();
    } else {
      this.revokeSips();
    }

    let mined = false;

    this.diceAnim(1000);
    let rolls = [];
    let rollSum = 0;
    for (let i = 0; i < numberOfDice; i++) {
      rolls[i] = Math.floor(Math.random() * 6) + 1;
      rollSum += rolls[i];
    }
    rolls[0] = 6;
    rolls[1] = 6;
    rollSum = 12;
    let givenSips = '';
    let givingSips = false;
    let yesCannable = true;
    let splittingSips = false;
    let isThreeManChanged = false;
    let speedingChangedState = false;
    let speedGunAdded = false;
    let removingRule = false;
    let glowEndTurn = false;
    let makeRule = false;
    if (
      Math.random() * 100 <
      this.calculateHittingMineChance(this.state.currentPlayer)
    ) {
      hitmineSFX.play();
      console.log('YOU HIT A MINE');
      this.setThreeMan(this.state.currentPlayer);
      this.setState({
        promptTextSum: 'You hit a mine, you are now Three Man. Peace.',
        numberOfDice,
        rolls,
        rollSum,
        givenSips,
        givingSips,
        cannable: yesCannable,
        mined,
        speedGun,
        splittingSips,
        isThreeManChanged,
        speedingChangedState,
        speedGunAdded,
        removingRule,
        glowEndTurn,
        makeRule,
      });
      return;
    }
    if (
      Math.random() * 100 <
      this.calculateOddsToRollOffTable(this.state.currentPlayer)
    ) {
      hitmineSFX.play();
      console.log('YOU ROLLED OFF THE TABLE');
      this.setThreeMan(this.state.currentPlayer);
      this.setState({
        promptTextSum:
          'You rolled off the table, you are now Three Man. Sweet.',
        numberOfDice,
        rolls,
        rollSum,
        givenSips,
        givingSips,
        cannable: yesCannable,
        mined,
        speedGun,
        splittingSips,
        isThreeManChanged,
        speedingChangedState,
        speedGunAdded,
        removingRule,
        glowEndTurn,
        makeRule,
      });
      return;
    }
    this.setState(
      {
        numberOfDice,
        rolls,
        rollSum,
        givenSips,
        givingSips,
        cannable: yesCannable,
        mined,
        speedGun,
        splittingSips,
        isThreeManChanged,
        speedingChangedState,
        speedGunAdded,
        removingRule,
        glowEndTurn,
        makeRule,
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
    let { rollSum, rolls, currentPlayer, players, numberOfDice } = this.state;
    let useTotalOfRoll = true;
    switch (rollSum) {
      case 2:
        if (rolls[0] === 1) {
          text = 'You drink.\n';
          //change to queue
          this.queueSips(currentPlayer, currentPlayer, 1);
          setTimeout(() => {
            hitmarkerSFX.play();
          }, 1000);
        } else {
          text = '';
        }
        break;
      case 3:
        if (rolls[0] === 1 || rolls[0] === 2) {
          text = players[currentPlayer].name + ', you are Three Man.\n';
          this.incrementTimesBecame3(players, currentPlayer);
          this.setThreeMan(this.state.currentPlayer);
        } else {
          text = '';
        }
        break;
      case 11:
        text =
          'Person before you (' +
          this.getPlayerBeforeName(players, currentPlayer) +
          ') drinks 1.\n\n';
        this.queueSips(
          currentPlayer,
          this.getPlayerBeforeID(players, currentPlayer),
          1,
        ); //change to queue
        setTimeout(() => {
          hitmarkerSFX.play();
        }, 1000);
        break;
      case 7:
        text =
          'Person after you (' +
          this.getPlayerAfterName(players, currentPlayer) +
          ') drinks 1.\n\n';
        this.queueSips(
          currentPlayer,
          this.getPlayerAfterID(players, currentPlayer),
          1,
        ); //change to queue
        setTimeout(() => {
          hitmarkerSFX.play();
        }, 1000);
        break;
      case 12:
        text = 'Make a new rule.';
        this.makeRule();
        break;
      default:
        text = '';
        break;
    }
    if (this.checkHasRule(useTotalOfRoll, rollSum)) {
      text += '\nCustom rule in effect!\n';
      setTimeout(() => {
        hitmarkerSFX.play();
      }, 1000);
    }
    text = this.checkEachDice(text);
    if ((text.length === 0) & (numberOfDice > 1)) {
      text = 'Nothing happens.\n';
      this.setState({
        glowEndTurn: true,
      });
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
    let useTotalOfRoll = false;
    addedText += rolls
      .map((roll, index) => {
        let returnedText = '';
        if (this.checkHasRule(useTotalOfRoll, roll)) {
          returnedText += '\nCustom rule in effect!\n';
          setTimeout(() => {
            hitmarkerSFX.play();
          }, 1000);
        }
        switch (roll) {
          case 3:
            if (threeMan === null) return '';
            this.queueSips(currentPlayer, threeMan, 1); //change to queue
            returnedText +=
              '\nThree man (' + players[threeMan].name + ') you drink 1.\n\n';
            setTimeout(() => {
              hitmarkerSFX.play();
            }, 1000);
            break;
          default:
            returnedText += '';
            break;
        }
        return returnedText;
      })
      .join('');

    if (this.checkPair(rolls) && addedText === '') {
      addedText = '-1';
    }
    return addedText;
  }
  checkPair(rolls) {
    const { threeMan, currentPlayer, speedGun } = this.state;
    let { speeding } = this.state;
    let numDoubles = speedGun;
    if (rolls.length > 1) {
      if (rolls[0] === rolls[1]) {
        numDoubles = numDoubles + 1;
        let speedGunAdded = true;
        //change to queueSpeedGun
        // this.queueSpeedGun();
        this.setState({
          speedGun: numDoubles,
          speedGunAdded,
        });
        if (numDoubles === 3) {
          speeding = true;
          let speedingChangedState = true;
          let speedGunAdded = true;
          this.setThreeMan(currentPlayer);
          const givenSips = 'You became Three Man for speeding\n';
          this.setState({
            givenSips,
            speeding,
            speedingChangedState,
            speedGunAdded,
          });
          return;
        }
        if (rolls[0] !== 1) {
          if (rolls[0] === 3 && threeMan !== null) {
            setTimeout(() => {
              threethreeSFX.play();
              hitmarkerSFX.play();
            }, 1200);
            const givenSips = speeding ? '' : 'Three Man take 6 more sips\n';

            this.queueSips(currentPlayer, threeMan, 6); //change to queue
            this.setState({
              givenSips,
            });
          } else if (!speeding) {
            this.giveSomeoneSips(rolls[0] * 2);
            return true;
          }
        }
      }
    }
  }
  setThreeMan(player) {
    let threeManChangedState = this.state.threeMan;
    let isThreeManChanged = true;
    this.setState({
      threeMan: player,
      threeManChangedState,
      isThreeManChanged,
    });
    setTimeout(() => {
      onetwoSFX.play();
    }, 1000);
  }

  queueSpeedGun() {
    this.setState({
      speedGunQueued: true,
    });
  }

  resolveSpeedGun(currentPlayer) {
    const { speeding, speedGun } = this.state;
    let newSpeeding = speeding;
    let newSpeedGun = speedGun;
    newSpeedGun = newSpeedGun + 1;

    if (newSpeedGun === 3) {
      newSpeeding = true;
      this.setThreeMan(currentPlayer);
      const givenSips = 'You became Three Man for speeding\n';
      this.setState({
        givenSips,
        speeding: newSpeeding,
      });
    }
    this.setState({
      speedGun: newSpeedGun,
      speedGunQueued: false,
    });
  }

  getPlayerAfterName(players, currentPlayer) {
    //@@@@@@@remove flagged players@@@@@@@@@@@@
    let playerAfter = currentPlayer;
    do {
      playerAfter =
        (playerAfter + 1) % players.filter((player) => player.name).length;
    } while (players[playerAfter].removedFromGame);
    return players[playerAfter].name;
  }

  getPlayerBeforeName(players, currentPlayer) {
    //@@@@@@@@@@@@remove flagged players@@@@@@@@@@@@@@@@@
    let playerBefore = currentPlayer;
    do {
      playerBefore =
        (((playerBefore - 1) % players.filter((player) => player.name).length) +
          players.filter((player) => player.name).length) %
        players.filter((player) => player.name).length;
    } while (players[playerBefore].removedFromGame);

    return players[playerBefore].name;
  }
  getPlayerAfterID(players, currentPlayer) {
    //@@@@@@@@@@@@@remove flagged players@@@@@@@@@@@@@@@@@@
    let playerAfter = currentPlayer;
    do {
      playerAfter =
        (playerAfter + 1) % players.filter((player) => player.name).length;
    } while (players[playerAfter].removedFromGame);
    return playerAfter;
  }

  getPlayerBeforeID(players, currentPlayer) {
    //@@@@@@@@@@@@@@@remove flagged players@@@@@@@@@@@@@@@@@
    let playerBefore = currentPlayer;
    do {
      playerBefore =
        (((playerBefore - 1) % players.filter((player) => player.name).length) +
          players.filter((player) => player.name).length) %
        players.filter((player) => player.name).length;
    } while (players[playerBefore].removedFromGame);
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

  incrementTimesBecame3(players, currentPlayer) {
    let newPlayers = players;
    newPlayers[currentPlayer].timesBecame3 =
      newPlayers[currentPlayer].timesBecame3 + 1;
    this.setState({
      players: newPlayers,
    });
  }

  displayGivenSips(playerNum, isDoneSplitting) {
    let {
      players,
      currentPlayer,
      sipsCirculating,
      givenSips,
      splittingSips,
      speeding,
      firstSipsGiven,
    } = this.state;
    let newFirstSipsGiven = firstSipsGiven;
    if (splittingSips) {
      newFirstSipsGiven = !newFirstSipsGiven;
    }

    if (splittingSips && givenSips) {
      givenSips +=
        ' ' +
        players[currentPlayer].name +
        ' also gave ' +
        sipsCirculating +
        ' sips to ' +
        players[playerNum].name +
        '.';
    } else {
      givenSips =
        players[currentPlayer].name +
        ' gave ' +
        sipsCirculating +
        ' sips to ' +
        players[playerNum].name +
        '.';
    }
    spankSFX.play();
    const givingSips = false;
    const promptTextSum = '';
    this.addSips(currentPlayer, playerNum, sipsCirculating);
    let cannable = false;
    let makingRule = false;
    if (speeding) {
      givenSips = 'You became Three Man for speeding'; //probleM?
    }
    if (isDoneSplitting) {
      this.setState({
        splittingSips: false,
      });
    }
    this.setState({
      givenSips,
      givingSips,
      promptTextSum,
      cannable,
      makingRule,
      firstSipsGiven: newFirstSipsGiven,
    });
  }

  displayRuleSips(playerNum) {
    let { players, sipsFromRule, currentPlayer } = this.state;
    if (!this.validateIntegerInput(sipsFromRule)) {
      return;
    }

    this.addSips(currentPlayer, playerNum, parseInt(sipsFromRule));
    const ruleSips =
      players[playerNum].name +
      ' took ' +
      sipsFromRule +
      (sipsFromRule === '1'
        ? " sip because they can't follow rules."
        : sipsFromRule >= 0
        ? " sips because they can't follow rules."
        : " sips because Johnny can't code");
    this.setState({
      ruleSips,
    });
  }

  handleSipChange(evt) {
    this.setState({
      sipsFromRule: evt.target.value,
    });
  }

  makeRule() {
    this.setState({
      makingRule: true,
    });
  }

  setNextPlayer = () => {
    const { players, currentPlayer } = this.state;
    const { speeding } = this.state;
    endturnSFX.play();

    if (!speeding) {
      this.resolveSips();
    } else {
      this.revokeSips();
    }
    // const { playerSipQueue } = this.state;
    // if (playerSipQueue.length !== 0 && !cannable) {
    //   this.setState({
    //     players: playerSipQueue,
    //     playerSipQueue: [],
    //   });
    // }
    let rolls = [];
    let rollSum = 0;
    let promptTextSum = '';
    let nextPlayer = this.getPlayerAfterID(players, currentPlayer);
    if (players[nextPlayer].name === 'Mel') {
      melSFX.play();
    }
    this.setState({
      currentPlayer: nextPlayer,
      rolls,
      rollSum,
      promptTextSum,
      speedGun: 0,
      speeding: false,
      givingSips: false,
      givenSips: '',
      splittingSips: false,
      removingRule: false,
      glowEndTurn: false,
      makeRule: false,
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
