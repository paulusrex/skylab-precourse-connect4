class Connect4 {
  constructor({ cols, rows }) {
    this.cols = cols;
    this.rows = rows;
    this.nowPlaying = 1;
    this.playerColors = ["white", "red", "blue"];
    this.playerNames = ["", "rojas", "azules"];
    this.animationInProgress = false;
    this.board = [];
    this.initBoard();
    this.drawInit();
    $("h2").text(`Es el turno de las ${this.playerNames[this.nowPlaying]}`);
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

  isColumnFull(col) {
    return this.board[col][this.rows - 1] !== false;
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

  async onClick(col) {
    if (!this.nowPlaying || this.animationInProgress) {
      return;
    }
    const row = this.dropChip(col, this.nowPlaying);
    const winner = this.checkWinner();
    if (winner) {
      this.nowPlaying = false;
      this.drawBoard();
      await new Promise(resolve => setTimeout(resolve, 800));
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
        this.board = [];
        this.initBoard();
        this.drawBoard();
        $("h2").text(`Es el turno de las ${this.playerNames[this.nowPlaying]}`);
      }
    } else {
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
      this.nowPlaying = this.nowPlaying === 1 ? 2 : 1;
      $("h2").text(`Es el turno de las ${this.playerNames[this.nowPlaying]}`);
    }
  }

  onMouseOver(col) {
    if (this.animationInProgress) {
      return;
    }
    for (let c = 0; c < this.cols; c++) {
      if (c === col) {
        if (!this.isColumnFull(col)) {
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
}

let game = new Connect4({ cols: 7, rows: 6 });

alert(
  `Puedes salir o reiniciar en cualquier momento con los iconos al lado del título`
);
