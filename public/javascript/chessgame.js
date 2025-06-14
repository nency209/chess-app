const socket = io();
const chess = new Chess();

const boardElement = document.querySelector('.chessboard');
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = '';

  board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      const squareElement = document.createElement('div');
      squareElement.classList.add('square', (rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark');
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.column = colIndex;

      if (square) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black');
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = (square.color === playerRole);

        pieceElement.addEventListener('dragstart', (e) => {
          draggedPiece = pieceElement;
          sourceSquare = { row: rowIndex, col: colIndex };
          e.dataTransfer.setData('text/plain', '');
        });

        pieceElement.addEventListener('dragend', () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener('dragover', (e) => e.preventDefault());

      squareElement.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const target = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.column)
          };
          handleMove(sourceSquare, target);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });
};

const getPieceUnicode = (piece) => {
  const map = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
    P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
  };
  return map[piece.type === piece.type.toUpperCase() ? piece.type : piece.type.toLowerCase()];
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: 'q'
  };
  socket.emit('move', move);
};

socket.on('playerRole', (role) => {
  playerRole = role;
  renderBoard();
});

socket.on('spectatorRole', () => {
  playerRole = null;
  renderBoard();
});

socket.on('boardState', (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on('move', (move) => {
  chess.move(move);
  renderBoard();
});

renderBoard();
