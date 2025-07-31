const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');

// Game state
let currentPlayer = 'O'; // Start with O (user's turn)
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (gameState[index] !== '' || !gameActive) return;

    // Update cell and game state
    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    // Add pop-in animation
    cell.style.transform = 'scale(0)';
    setTimeout(() => {
        cell.style.transform = 'scale(1)';
    }, 50);

    // Check for win or draw
    if (checkWin()) {
        gameActive = false;
        status.textContent = currentPlayer === 'O' ? 'Svalöv BK vinner!' : 'Datorn vinner!';
        highlightWinningCells();
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        status.textContent = "Oavgjort!";
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Din tur (${currentPlayer})`;

    // If it's X's turn, make computer move after a short delay
    if (currentPlayer === 'X') {
        status.textContent = "Datorn tänker...";
        setTimeout(makeComputerMove, 600);
    } else {
        status.textContent = "Din tur";
    }
}

function checkWin() {
    return winningConditions.some(condition => {
        return condition.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== '');
}

function highlightWinningCells() {
    winningConditions.forEach(condition => {
        if (condition.every(index => gameState[index] === currentPlayer)) {
            condition.forEach(index => {
                cells[index].classList.add('winning');
            });
            board.classList.add('winner');
        }
    });
}

function resetGame() {
    currentPlayer = 'O';  // Start with O (user's turn)
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    status.textContent = "Din tur";
    board.classList.remove('winner');
    // Player starts first, no need to make computer move
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
        cell.style.transform = 'scale(1)';
    });
}

function makeComputerMove() {
    if (!gameActive) return;

    // Find the best move using minimax algorithm
    const bestMove = findBestMove();
    if (bestMove !== -1) {
        handleCellClick({ target: cells[bestMove] });
    }
}

function findBestMove() {
    // First, check for immediate win
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'X';
            if (checkWinForPlayer('X')) {
                gameState[i] = '';
                return i;
            }
            gameState[i] = '';
        }
    }

    // Then, block opponent's winning move
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O';
            if (checkWinForPlayer('O')) {
                gameState[i] = '';
                return i;
            }
            gameState[i] = '';
        }
    }

    // Strategic moves for early game
  /*  const emptyCells = gameState.filter(cell => cell === '').length;
    if (emptyCells >= 7) 
    {
        // Take center if available
        if (gameState[4] === '') return 4;
        
        // If center is taken, take a corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => gameState[i] === '');
        if (availableCorners.length > 0) 
        {
            // If opponent took center, take any corner
            if (gameState[4] === 'O') 
            {
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
            // Otherwise, prefer corners that create two winning paths
            for (const corner of availableCorners) 
            {
                if (isStrategicCorner(corner)) 
                {
                    return corner;
                }
            }
            return availableCorners[0];
        }
    }*/

    // Use minimax for mid and end game
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'X';
            let score = minimax(gameState, 0, false);
            gameState[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

function isStrategicCorner(corner) {
    // Check if placing X in this corner creates multiple winning paths
    gameState[corner] = 'X';
    let winningPaths = 0;
    
    winningConditions.forEach(condition => {
        if (condition.includes(corner)) {
            const otherCells = condition.filter(i => i !== corner);
            if (gameState[otherCells[0]] !== 'O' && gameState[otherCells[1]] !== 'O') {
                winningPaths++;
            }
        }
    });
    
    gameState[corner] = '';
    return winningPaths > 1;
}

function checkWinForPlayer(player) {
    return winningConditions.some(condition => {
        return condition.every(index => gameState[index] === player);
    });
}

function minimax(board, depth, isMaximizing) {
    // Check terminal states
    if (checkWinForPlayer('X')) return 10 - depth;
    if (checkWinForPlayer('O')) return depth - 10;
    if (board.every(cell => cell !== '')) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Add event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', resetGame);

// Initialize the game
resetGame();
