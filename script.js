<script
  src="https://js.sentry-cdn.com/fd3e8df59cc937d7d2a3dae5913776b5.min.js"
  crossorigin="anonymous"
></script>

myUndefinedFunction();

const GRID_SIZE = 8
const MINE_COUNT = 10

let grid = []
let mineLocations = []
let gameOver = false
let timer = 0
let timerInterval

const gridElement = document.getElementById("grid")
const newGameBtn = document.getElementById("new-game-btn")
const mineCountElement = document.getElementById("mine-count")
const timerElement = document.getElementById("timer")

function initializeGame() {
  grid = []
  mineLocations = []
  gameOver = false
  timer = 0
  clearInterval(timerInterval)
  timerElement.textContent = "Time: 0s"
  mineCountElement.textContent = `Mines: ${MINE_COUNT}`

  // Create grid
  for (let i = 0; i < GRID_SIZE; i++) {
    grid[i] = []
    for (let j = 0; j < GRID_SIZE; j++) {
      grid[i][j] = {
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }
    }
  }

  // Place mines
  let minesPlaced = 0
  while (minesPlaced < MINE_COUNT) {
    const row = Math.floor(Math.random() * GRID_SIZE)
    const col = Math.floor(Math.random() * GRID_SIZE)
    if (!grid[row][col].isMine) {
      grid[row][col].isMine = true
      mineLocations.push({ row, col })
      minesPlaced++
    }
  }

  // Calculate neighbor mines
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (!grid[i][j].isMine) {
        grid[i][j].neighborMines = countNeighborMines(i, j)
      }
    }
  }

  renderGrid()
  startTimer()
}

function countNeighborMines(row, col) {
  let count = 0
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i
      const newCol = col + j
      if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
        if (grid[newRow][newCol].isMine) {
          count++
        }
      }
    }
  }
  return count
}

function renderGrid() {
  gridElement.innerHTML = ""
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const cell = document.createElement("div")
      cell.classList.add("cell")
      cell.dataset.row = i
      cell.dataset.col = j
      cell.addEventListener("click", handleCellClick)
      cell.addEventListener("contextmenu", handleRightClick)
      gridElement.appendChild(cell)
      updateCellDisplay(cell, grid[i][j])
    }
  }
}

function updateCellDisplay(cellElement, cellData) {
  cellElement.textContent = ""
  cellElement.classList.remove("revealed", "mine")

  if (cellData.isRevealed) {
    cellElement.classList.add("revealed")
    if (cellData.isMine) {
      cellElement.classList.add("mine")
      cellElement.textContent = "💣"
    } else if (cellData.neighborMines > 0) {
      cellElement.textContent = cellData.neighborMines
    }
  } else if (cellData.isFlagged) {
    cellElement.textContent = "🚩"
  }
}

function handleCellClick(event) {
  if (gameOver) return
  const row = Number.parseInt(event.target.dataset.row)
  const col = Number.parseInt(event.target.dataset.col)
  revealCell(row, col)
}

function handleRightClick(event) {
  event.preventDefault()
  if (gameOver) return
  const row = Number.parseInt(event.target.dataset.row)
  const col = Number.parseInt(event.target.dataset.col)
  toggleFlag(row, col)
}

function revealCell(row, col) {
  if (grid[row][col].isRevealed || grid[row][col].isFlagged) return

  grid[row][col].isRevealed = true
  updateCellDisplay(document.querySelector(`[data-row="${row}"][data-col="${col}"]`), grid[row][col])

  if (grid[row][col].isMine) {
    gameOver = true
    revealAllMines()
    alert("Game Over! You hit a mine.")
    clearInterval(timerInterval)
  } else if (grid[row][col].neighborMines === 0) {
    // Reveal neighboring cells
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i
        const newCol = col + j
        if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
          revealCell(newRow, newCol)
        }
      }
    }
  }

  checkWinCondition()
}

function toggleFlag(row, col) {
  if (grid[row][col].isRevealed) return

  grid[row][col].isFlagged = !grid[row][col].isFlagged
  updateCellDisplay(document.querySelector(`[data-row="${row}"][data-col="${col}"]`), grid[row][col])

  const flaggedMines = grid.flat().filter((cell) => cell.isFlagged).length
  mineCountElement.textContent = `Mines: ${MINE_COUNT - flaggedMines}`
}

function revealAllMines() {
  mineLocations.forEach(({ row, col }) => {
    grid[row][col].isRevealed = true
    updateCellDisplay(document.querySelector(`[data-row="${row}"][data-col="${col}"]`), grid[row][col])
  })
}

function checkWinCondition() {
  const unrevealedCells = grid.flat().filter((cell) => !cell.isRevealed).length
  if (unrevealedCells === MINE_COUNT) {
    gameOver = true
    alert("Congratulations! You won!")
    clearInterval(timerInterval)
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++
    timerElement.textContent = `Time: ${timer}s`
  }, 1000)
}

newGameBtn.addEventListener("click", initializeGame)

initializeGame()

