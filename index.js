class Board {
  constructor({ cols = 7, rows = 6, baseBoard = null }) {
    this.rows = rows;
    this.cols = cols;
    if (baseBoard === null) {
      this.board = [];
      this.initBoard();
    } else {
      this.rows = baseBoard.rows;
      this.cols = baseBoard.cols;
      this.board = baseBoard.copy();
    }
    this.initBoard = this.initBoard.bind(this);
    this.isColumnFull = this.isColumnFull.bind(this);
    this.copy = this.copy.bind(this);
    this.forEach = this.forEach.bind(this);
    this.map = this.map.bind(this);
    this.dropChip = this.dropChip.bind(this);
    this.checkWinner = this.checkWinner.bind(this);
    this.checkSmartMoves = this.checkSafeMoves.bind(this);
    this.nextComputerMove = this.nextComputerMove.bind(this);
  }

  initBoard() {
    for (let c = 0; c < this.cols; c++) {
      this.board[c] = [];
      for (let r = 0; r < this.rows; r++) {
        this.board[c][r] = false;
      }
    }
  }

  isColumnFull(col) {
    return this.board[col][this.rows - 1] !== false;
  }

  copy() {
    return this.board.map(col => [...col]);
  }

  forEach(func) {
    return this.board.forEach(func);
  }

  map(func) {
    return this.board.map(func);
  }

  dropChip(col, player) {
    if (this.isColumnFull(col)) {
      // column full
      return false;
    }
    const firstEmpty = this.board[col].findIndex(chip => !chip);
    this.board[col][firstEmpty] = player;
    return firstEmpty;
  }

  checkWinner() {
    const b = this.board;
    const checkAux = [1, 2, 3];
    const checkX = (col, row) =>
      b[col][row] !== false &&
      checkAux.every(diff => b[col][row] === b[col + diff][row]);
    const checkY = (col, row) =>
      b[col][row] !== false &&
      checkAux.every(diff => b[col][row] === b[col][row + diff]);
    const checkForwardSlash = (col, row) =>
      b[col][row] !== false &&
      checkAux.every(diff => b[col][row] === b[col + diff][row + diff]);
    const checkBackSlash = (col, row) =>
      b[col][row] !== false &&
      checkAux.every(diff => b[col][row] === b[col + diff][row - diff]);

    // Check horizontally
    for (let c = 0; c <= this.cols - 4; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (checkX(c, r)) {
          return { player: b[c][r], init: { col: c, row: r }, type: "X" };
        }
      }
    }

    // check vertically
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r <= this.rows - 4; r++) {
        if (checkY(c, r)) {
          return { player: b[c][r], init: { col: c, row: r }, type: "Y" };
        }
      }
    }

    // check diagonal '/'
    for (let c = 0; c <= this.cols - 4; c++) {
      for (let r = 0; r <= this.rows - 4; r++) {
        if (checkForwardSlash(c, r)) {
          return {
            player: b[c][r],
            init: { col: c, row: r },
            type: "forwardslash",
          };
        }
      }
    }

    // check diagonal '\'
    for (let c = 0; c <= this.cols - 4; c++) {
      for (let r = this.rows - 4; r < this.rows; r++) {
        if (checkBackSlash(c, r)) {
          return {
            player: b[c][r],
            init: { col: c, row: r },
            type: "backslash",
          };
        }
      }
    }

    // check draw
    if (b.every(c => c.every(r => r !== false))) {
      return {
        player: 0,
        init: { col: 0, row: 0 },
        type: "draw",
      };
    }

    return false;
  }

  // Returns an array of the cols where you can drop and
  // in the next move after you the other player cannot win
  // Returns only 1 element if the player can win inmediately
  checkSafeMoves(player) {
    const otherPlayer = player === 1 ? 2 : 1;

    let safePlays = [];
    for (let col = 0; col < this.cols; col++) {
      safePlays.push(col);
    }
    for (let col = 0; col < this.cols; col++) {
      const boardNext = new Board({ baseBoard: this });
      if (!boardNext.isColumnFull(col)) {
        boardNext.dropChip(col, player);
        let winner = boardNext.checkWinner();
        if (winner && winner.player === player) {
          // dropping in this col this player wins
          return [col];
        }

        // check with this last dropping the next move is
        // a winner for the other player
        let safeColumn = true;
        for (let col2 = 0; col2 < this.cols; col2++) {
          const boardPlusTwo = new Board({ baseBoard: boardNext });
          boardPlusTwo.dropChip(col2, otherPlayer);
          safeColumn = safeColumn && !boardPlusTwo.checkWinner();
        }
        if (!safeColumn) {
          safePlays = safePlays.filter(item => item !== col);
        }
      }
    }
    return safePlays;
  }

  nextComputerMove(player) {
    const smartMoves = this.checkSafeMoves(player);
    return Math.floor(Math.random() * smartMoves.length);
  }
}

class Connect4 {
  constructor({ cols = 7, rows = 6, computerPlayer = 0 }) {
    this.cols = cols;
    this.rows = rows;
    this.nowPlaying = 1;
    this.computerPlayer = computerPlayer;
    this.playerColors = ["white", "red", "blue"];
    this.playerNames = ["", "rojas", "azules"];
    this.animationInProgress = false;
    this.board = new Board({ cols, rows });
    this.drawInit();
    $("h2").text(`Es el turno de las ${this.playerNames[this.nowPlaying]}`);
  }

  drawInit() {
    for (let c = 0; c < this.cols; c++) {
      $("#board").append(`<div class="col" id="col-${c}"></div>`);
      $(`#chip-selector`).append(
        `<div 
            class="col-anim" 
            id="col-anim-${c}" 
            onclick="game.onClick(${c});" 
            onmouseover="game.onMouseOver(${c});"
            onmouseout="game.onMouseOut(${c});"
          >
         </div>`
      );
      $(`#col-anim-${c}`).append(`<div class="anim" id="anim-${c}"></div>`);
      for (let r = this.rows - 1; r >= 0; r--) {
        $(`#col-${c}`).append(`<div class="chip" id="chip-${c}${r}"></div>`);
      }
    }
  }

  drawBoard() {
    this.board.forEach((statusCol, indexCol) => {
      statusCol.forEach((chip, indexRow) => {
        if (!chip) {
          $(`#chip-${indexCol}${indexRow}`).css(
            "background-color",
            "transparent"
          );
        } else {
          $(`#chip-${indexCol}${indexRow}`).css(
            "background-color",
            this.playerColors[chip]
          );
        }
      });
    });
  }

  async onClick(col) {
    if (!this.nowPlaying || this.animationInProgress) {
      return;
    }
    const row = this.board.dropChip(col, this.nowPlaying);
    const winner = this.board.checkWinner();
    this.animationInProgress = true;
    $(`#anim-${col}`)
      .css("transition", "transform .6s")
      .css("transform", `translate(0px,${(6 - row) * 110 - 5}px)`);
    await new Promise(resolve => setTimeout(resolve, 800));
    $(`#anim-${col}`)
      .css("transition", "")
      .css("transform", `translate(0px,0px)`);
    this.animationInProgress = false;
    this.drawBoard();
    if (winner) {
      this.nowPlaying = false;
      await new Promise(resolve => setTimeout(resolve, 400));
      if (winner.player === 0) {
        alert("Habeis empatado");
      } else {
        alert("Han ganado las " + this.playerNames[winner.player]);
      }
      let response = "";
      do {
        response = prompt("¿Quereis volver a jugar (s/n)?");
      } while (!/[s|n]/i.test(response));
      if (response.toLowerCase() === "s") {
        this.nowPlaying = 1;
        this.animationInProgress = false;
        this.board = new Board({ cols: this.cols, rows: this.rows });
        this.drawBoard();
        $("h2").text(`Es el turno de las ${this.playerNames[this.nowPlaying]}`);
      }
    } else {
      this.nowPlaying = this.nowPlaying === 1 ? 2 : 1;
      if (this.nowPlaying === this.computerPlayer) {
        console.log(this.board.checkSafeMoves(this.nowPlaying));
        console.log(this.board.nextComputerMove(this.nowPlaying));
      }
      $("h2").text(`Es el turno de las ${this.playerNames[this.nowPlaying]}`);
    }
  }

  onMouseOver(col) {
    if (this.animationInProgress) {
      return;
    }
    for (let c = 0; c < this.cols; c++) {
      if (c === col) {
        if (!this.board.isColumnFull(col)) {
          $(`#anim-${col}`).css(
            "background-color",
            this.playerColors[this.nowPlaying]
          );
        }
      } else {
        $(`#anim-${c}`).css("background-color", "transparent");
      }
    }
  }

  onMouseOut(col) {
    if (this.animationInProgress) {
      return;
    }
    $(`#anim-${col}`).css("background-color", "transparent");
  }
}

let game = new Connect4({ cols: 7, rows: 6, computerPlayer: 2 });

alert(
  `Puedes salir o reiniciar en cualquier momento con los iconos al lado del título`
);
