const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const startButton = document.getElementById("startButton");

const blockSize = 30;
const columns = 10;
const rows = 20;

const colors = [
  null,
  "#38bdf8",
  "#facc15",
  "#a78bfa",
  "#22c55e",
  "#ef4444",
  "#fb923c",
  "#60a5fa"
];

const pieces = [
  [[1, 1, 1, 1]],
  [
    [2, 2],
    [2, 2]
  ],
  [
    [0, 3, 0],
    [3, 3, 3]
  ],
  [
    [0, 4, 4],
    [4, 4, 0]
  ],
  [
    [5, 5, 0],
    [0, 5, 5]
  ],
  [
    [6, 0, 0],
    [6, 6, 6]
  ],
  [
    [0, 0, 7],
    [7, 7, 7]
  ]
];

let board = createBoard();
let currentPiece = null;
let currentPosition = { x: 3, y: 0 };
let score = 0;
let isPlaying = false;
let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;

function createBoard() {
  return Array.from({ length: rows }, () => Array(columns).fill(0));
}

function createPiece() {
  const index = Math.floor(Math.random() * pieces.length);
  return pieces[index].map(row => [...row]);
}

function drawBlock(x, y, colorIndex) {
  context.fillStyle = colors[colorIndex];
  context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  context.strokeStyle = "#0f172a";
  context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawBlock(x, y, value);
      }
    });
  });

  if (currentPiece) {
    currentPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawBlock(currentPosition.x + x, currentPosition.y + y, value);
        }
      });
    });
  }
}

function isColliding(piece, position) {
  return piece.some((row, y) => {
    return row.some((value, x) => {
      if (!value) {
        return false;
      }

      const boardX = position.x + x;
      const boardY = position.y + y;

      return (
        boardX < 0 ||
        boardX >= columns ||
        boardY >= rows ||
        (boardY >= 0 && board[boardY][boardX])
      );
    });
  });
}

function mergePiece() {
  currentPiece.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[currentPosition.y + y][currentPosition.x + x] = value;
      }
    });
  });
}

function clearLines() {
  let linesCleared = 0;

  board = board.filter(row => {
    if (row.every(value => value !== 0)) {
      linesCleared += 1;
      return false;
    }
    return true;
  });

  while (board.length < rows) {
    board.unshift(Array(columns).fill(0));
  }

  if (linesCleared > 0) {
    score += linesCleared * 100;
    scoreElement.textContent = score;
  }
}

function rotatePiece(piece) {
  return piece[0].map((_, index) => piece.map(row => row[index]).reverse());
}

function resetPiece() {
  currentPiece = createPiece();
  currentPosition = { x: 3, y: 0 };

  if (isColliding(currentPiece, currentPosition)) {
    isPlaying = false;
    startButton.textContent = "Restart";
    alert(`Game Over! Score: ${score}`);
  }
}

function dropPiece() {
  currentPosition.y += 1;

  if (isColliding(currentPiece, currentPosition)) {
    currentPosition.y -= 1;
    mergePiece();
    clearLines();
    resetPiece();
  }

  dropCounter = 0;
}

function movePiece(direction) {
  currentPosition.x += direction;

  if (isColliding(currentPiece, currentPosition)) {
    currentPosition.x -= direction;
  }
}

function hardDrop() {
  while (!isColliding(currentPiece, { x: currentPosition.x, y: currentPosition.y + 1 })) {
    currentPosition.y += 1;
  }

  dropPiece();
}

function rotateCurrentPiece() {
  const rotated = rotatePiece(currentPiece);

  if (!isColliding(rotated, currentPosition)) {
    currentPiece = rotated;
  }
}

function startGame() {
  board = createBoard();
  score = 0;
  scoreElement.textContent = score;
  currentPiece = createPiece();
  currentPosition = { x: 3, y: 0 };
  isPlaying = true;
  startButton.textContent = "Restart";
  lastTime = 0;
  requestAnimationFrame(update);
}

function update(time = 0) {
  if (!isPlaying) {
    drawBoard();
    return;
  }

  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    dropPiece();
 
