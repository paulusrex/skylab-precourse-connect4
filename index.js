class Connect4 {
  constructor({ cols, rows }) {
    this.cols = cols;
    this.rows = rows;
    this.nowPlaying = 1;
    this.playerColors = ["white", "red", "blue"];
    this.board = [];
    this.initBoard();
    this.drawInit();
  }

  initBoard() {
    for (let c = 0; c < this.cols; c++) {
      this.board[c] = [];
      for (let r = 0; r < this.rows; r++) {
        this.board[c][r] = false;
      }
    }
  }

  drawInit() {
    for (let c = 0; c < this.cols; c++) {
      $("#board").append(`<div class="col" id="col-${c}"></div>`);
      $(`#chip-selector`).append(
        `<div class="col-anim" id="col-anim-${c}" onclick="game.onClick(${c})"></div>`
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
          $(`#chip-${indexCol}${indexRow}`).css("background-color", "white");
        } else {
          $(`#chip-${indexCol}${indexRow}`).css(
            "background-color",
            this.playerColors[chip]
          );
        }
      });
    });
  }

  dropChip(col, player) {
    if (this.board[col][this.rows - 1]) {
      // column full
      return false;
    }
    const firstEmpty = this.board[col].findIndex(chip => !chip);
    this.board[col][firstEmpty] = player;
    return firstEmpty;
  }

  onClick(col) {
    this.dropChip(col, this.nowPlaying);
    this.drawBoard();
    console.log(this.checkWinner());
    this.nowPlaying = this.nowPlaying === 1 ? 2 : 1;
  }

  checkWinner() {
    const b = this.board;
    const checkX = (col, row) =>
      b[col][row] !== false &&
      b[col][row] === b[col + 1][row] &&
      b[col][row] === b[col + 2][row] &&
      b[col][row] === b[col + 3][row];
    const checkY = (col, row) =>
      b[col][row] !== false &&
      b[col][row] === b[col][row + 1] &&
      b[col][row] === b[col][row + 2] &&
      b[col][row] === b[col][row + 3];
    const checkForwardSlash = (col, row) =>
      b[col][row] !== false &&
      b[col][row] === b[col + 1][row + 1] &&
      b[col][row] === b[col + 2][row + 2] &&
      b[col][row] === b[col + 3][row + 3];
    const checkBackSlash = (col, row) =>
      b[col][row] !== false &&
      b[col][row] === b[col + 1][row - 1] &&
      b[col][row] === b[col + 2][row - 2] &&
      b[col][row] === b[col + 3][row - 3];

    // Check horizontally
    for (let c = 0; c < this.cols - 4; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (checkX(c, r)) {
          return { player: b[c][r], init: { col: c, row: r }, type: "X" };
        }
      }
    }

    // check vertically
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows - 4; r++) {
        if (checkY(c, r)) {
          return { player: b[c][r], init: { col: c, row: r }, type: "Y" };
        }
      }
    }

    // check diagonal '/'
    for (let c = 0; c < this.cols - 4; c++) {
      for (let r = 0; r < this.rows - 4; r++) {
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
    for (let c = 0; c < this.cols - 4; c++) {
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
    return false;
  }
}

let game = new Connect4({ cols: 7, rows: 6 });
