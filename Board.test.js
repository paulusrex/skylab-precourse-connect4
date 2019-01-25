import { Board } from "./Board";

const player = 2;

expect.extend({
  toSelectContainInArray(received, mustContainOne, mustNotContain) {
    let passContainOne = mustContainOne.some(exp =>
      received.some(rec => rec === exp)
    );
    let passNotContain = mustNotContain.every(exp =>
      received.every(rec => rec !== exp)
    );

    const pass = passContainOne && passNotContain;
    if (pass) {
      return {
        message: () =>
          `expected ${received} to have ${mustNotContain} and have ${mustContainOne}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} not to have ${mustNotContain} and have ${mustContainOne}`,
        pass: false,
      };
    }
  },
});

test("Empty board = Any movement is OK", () => {
  const board = new Board({});
  expect(board.checkSafeMoves(player)).toEqual([0, 1, 2, 3, 4, 5, 6]);
});

test("cover loss", () => {
  const board = new Board({});
  board.board[0] = [1, 1, 1, false, false, false];
  board.board[1] = [false, false, false, false, false, false];
  board.board[2] = [false, false, false, false, false, false];
  board.board[3] = [false, false, false, false, false, false];
  board.board[4] = [false, false, false, false, false, false];
  board.board[5] = [false, false, false, false, false, false];
  board.board[6] = [false, false, false, false, false, false];
  expect(board.checkSafeMoves(player)).toEqual([0]);
});

test("inminent loss", () => {
  const board = new Board({});
  board.board[0] = [false, false, false, false, false, false];
  board.board[1] = [1, false, false, false, false, false];
  board.board[2] = [1, false, false, false, false, false];
  board.board[3] = [1, false, false, false, false, false];
  board.board[4] = [false, false, false, false, false, false];
  board.board[5] = [false, false, false, false, false, false];
  board.board[6] = [false, false, false, false, false, false];
  expect(board.checkSafeMoves(player)).toEqual([]);
});

test("cuts sure win for opponent", () => {
  const board = new Board({});
  board.board[0] = [false, false, false, false, false, false];
  board.board[1] = [1, false, false, false, false, false];
  board.board[2] = [1, false, false, false, false, false];
  board.board[3] = [false, false, false, false, false, false];
  board.board[4] = [false, false, false, false, false, false];
  board.board[5] = [false, false, false, false, false, false];
  board.board[6] = [false, false, false, false, false, false];
  expect(board.checkSafeMoves(player)).toSelectContainInArray(
    [0, 3],
    [1, 2, 4, 5, 6]
  );
});

// Empty board
// test("inminent loss", () => {
//   const board = new Board({});
//   board.board[0] = [false, false, false, false, false, false];
//   board.board[1] = [false, false, false, false, false, false];
//   board.board[2] = [false, false, false, false, false, false];
//   board.board[3] = [false, false, false, false, false, false];
//   board.board[4] = [false, false, false, false, false, false];
//   board.board[5] = [false, false, false, false, false, false];
//   board.board[6] = [false, false, false, false, false, false];
//   expect(board.checkSafeMoves(player)).toEqual([0]);
// });
