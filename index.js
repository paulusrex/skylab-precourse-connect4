class Connect4 {
  constructor({ cols = 7, rows = 6, computerPlayer = 0, demo = false }) {
    this.cols = cols;
    this.rows = rows;
    this.nowPlaying = 1;
    this.computerPlayer = computerPlayer;
    this.demo = demo;
    this.playerColors = ["white", "red", "blue"];
    this.playerNames = ["", "rojas", "azules"];
    this.animationInProgress = false;
    this.board = new Board({ cols, rows });
    this.drawInit();
    this.machineTurn = this.machineTurn.bind(this);
    this.interval = setInterval(this.machineTurn, 1500);
    $("#turn-title").text(
      `Es el turno de las ${this.playerNames[this.nowPlaying]}`
    );
  }

  machineTurn() {
    const winner = this.board.checkWinner();
    if (winner) {
      this.nowPlaying = false;
      if (this.demo) {
        this.reset();
        return;
      }
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
        this.reset();
      }
    } else {
      if (
        !this.animationInProgress &&
        (this.computerPlayer === this.nowPlaying || this.demo)
      ) {
        const nextMove = this.board.nextComputerMove(this.nowPlaying);
        this.onClick(nextMove);
      }
    }
  }

  drawInit() {
    for (let c = 0; c < this.cols; c++) {
      $(`#chip-selector`).append(
        `<div 
            class="anim" 
            id="anim-${c}" 
            style="left: ${c * 105 + 90}px;"
            onclick="game.onClick(${c});" 
            onmouseover="game.onMouseOver(${c});"
            onmouseout="game.onMouseOut(${c});"
          >
         </div>`
      );
    }
  }

  onClick(col) {
    if (!this.nowPlaying || this.animationInProgress) {
      return;
    }
    const row = this.board.dropChip(col, this.nowPlaying);
    const { top, left } = $("#board-svg").position();
    this.animationInProgress = true;
    $(`#anim-${col}`)
      .css("background-color", "transparent")
      .clone()
      .appendTo("#board")
      .removeClass("anim")
      .addClass("chip")
      .prop("id", `#chip-${col}${row}`)
      .css("transition", "1s")
      .css("left", `${col * 105 + (left - 17)}px`)
      .css("background-color", this.playerColors[this.nowPlaying])
      .animate(
        { top: `${(6 - row) * 94 + (top - 150)}px` },
        {
          duration: 500,
          complete: () => {
            this.animationInProgress = false;
            this.nowPlaying = this.nowPlaying === 1 ? 2 : 1;
            $("h2").text(
              `Es el turno de las ${this.playerNames[this.nowPlaying]}`
            );
          },
        }
      );
    const winner = this.board.checkWinner();
    if (winner) {
      this.nowPlaying = false;
    }
  }

  reset() {
    this.nowPlaying = 1;
    this.animationInProgress = false;
    $(".chip")
      .fadeOut()
      .remove();
    this.board = new Board({ cols: this.cols, rows: this.rows });
    $("#turn-title").text(
      `Es el turno de las ${this.playerNames[this.nowPlaying]}`
    );
  }

  onMouseOver(col) {
    if (this.animationInProgress) {
      return;
    }
    if (!this.board.isColumnFull(col)) {
      $(`#anim-${col}`).css(
        "background-color",
        this.playerColors[this.nowPlaying]
      );
    }
  }

  onMouseOut(col) {
    if (this.animationInProgress) {
      return;
    }
    $(`#anim-${col}`).css("background-color", "transparent");
  }
}

let game;
function begin(numPlayers) {
  game = new Connect4({
    cols: 7,
    rows: 6,
    computerPlayer: numPlayers === 2 ? 0 : 2,
    demo: numPlayers === 0,
  });
  $("#welcome").slideUp();
  $("#root").fadeIn(1000);
}

$("#root").hide();
