function unUsedInBox(grid, rowStart, colStart, num) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[rowStart + i][colStart + j] === num) return false;
      }
    }
    return true;
  }
  
  function fillBox(grid, row, col) {
    let num;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!unUsedInBox(grid, row, col, num));
        grid[row + i][col + j] = num;
      }
    }
  }
  
  function unUsedInRow(grid, i, num) {
    return !grid[i].includes(num);
  }
  
  function unUsedInCol(grid, j, num) {
    for (let i = 0; i < 9; i++) {
      if (grid[i][j] === num) return false;
    }
    return true;
  }
  
  function checkIfSafe(grid, i, j, num) {
    return (
      unUsedInRow(grid, i, num) &&
      unUsedInCol(grid, j, num) &&
      unUsedInBox(grid, i - (i % 3), j - (j % 3), num)
    );
  }
  
  function fillDiagonal(grid) {
    for (let i = 0; i < 9; i += 3) {
      fillBox(grid, i, i);
    }
  }
  
  function fillRemaining(grid, i, j) {
    if (i === 9) return true;
    if (j === 9) return fillRemaining(grid, i + 1, 0);
    if (grid[i][j] !== 0) return fillRemaining(grid, i, j + 1);
  
    for (let num = 1; num <= 9; num++) {
      if (checkIfSafe(grid, i, j, num)) {
        grid[i][j] = num;
        if (fillRemaining(grid, i, j + 1)) return true;
        grid[i][j] = 0;
      }
    }
  
    return false;
  }
  
  function removeKDigits(grid, k) {
    let removed = 0;
    while (removed < k) {
      const cellId = Math.floor(Math.random() * 81);
      const i = Math.floor(cellId / 9);
      const j = cellId % 9;
      if (grid[i][j] !== 0) {
        grid[i][j] = 0;
        removed++;
      }
    }
  }
  
  function deepCopy(grid) {
    return grid.map(row => [...row]);
  }
  
  // Main function to export
  export function generateSudokuPuzzle(k = 20) {
    const fullGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillDiagonal(fullGrid);
    fillRemaining(fullGrid, 0, 0);
  
    const completedPuzzle = deepCopy(fullGrid);
    const puzzle = deepCopy(fullGrid);
    removeKDigits(puzzle, k);
  
    return { puzzle, completedPuzzle };
  }
  