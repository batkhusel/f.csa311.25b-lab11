import React from 'react';
import './App.css';
import { GameState, Cell } from './game';
import BoardCell from './Cell';

interface Props {}

class App extends React.Component<Props, GameState & { history: GameState[] }> {
  private initialized: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      cells: [],
      currentPlayer: '',
      winner: '',
      history: []
    };
  }

  newGame = async () => {
    const starter = window.prompt("Who plays first? X or O", "X")?.toUpperCase();
    if (!["X", "O"].includes(starter ?? "")) return alert("Invalid player. Choose X or O.");

    const response = await fetch(`/newgame?starter=${starter}`);
    const json = await response.json();

    this.setState({
      cells: json.cells,
      currentPlayer: json.currentPlayer,
      winner: json.winner,
      history: []
    });
  }

  undo = () => {
    const history = [...this.state.history];
    if (history.length === 0) return;
    const prevState = history.pop();
    this.setState({ ...prevState!, history });
  }

  play(x: number, y: number): React.MouseEventHandler {
    return async (e) => {
      e.preventDefault();
      if (this.state.winner) return;

      const response = await fetch(`/play?x=${x}&y=${y}`);
      const json = await response.json();

      const newHistory = [...this.state.history, {
        cells: this.state.cells,
        currentPlayer: this.state.currentPlayer,
        winner: this.state.winner
      }];

      this.setState({
        cells: json.cells,
        currentPlayer: json.currentPlayer,
        winner: json.winner,
        history: newHistory
      });
    };
  }

  createCell(cell: Cell, index: number): React.ReactNode {
    if (cell.playable)
      return (
        <div key={index}>
          <a href='/' onClick={this.play(cell.x, cell.y)}>
            <BoardCell cell={cell}></BoardCell>
          </a>
        </div>
      );
    else
      return <div key={index}><BoardCell cell={cell} /></div>;
  }

  componentDidMount(): void {
    if (!this.initialized) {
      this.newGame();
      this.initialized = true;
    }
  }

  render(): React.ReactNode {
    return (
      <div>
        <div id="instructions">
          {this.state.winner
            ? `Winner: ${this.state.winner}`
            : `Current Player: ${this.state.currentPlayer}`}
        </div>

        <div id="board">
          {this.state.cells.map((cell, i) => this.createCell(cell, i))}
        </div>

        <div id="bottombar">
          <button onClick={this.newGame}>New Game</button>
          <button onClick={this.undo}>Undo</button>
        </div>
      </div>
    );
  }
}

export default App;
