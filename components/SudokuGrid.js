import React, { useState} from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const initialPuzzle = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

const SudokuGrid = () => {
  const [grid, setGrid] = React.useState(initialPuzzle);

  const [focusedCell, setFocusedCell] = useState({ row: null, col: null });

  const handleChange = (text, row, col) => {
    const newGrid = [...grid];
    const value = parseInt(text);
    newGrid[row][col] = isNaN(value) ? null : value;
    setGrid(newGrid);
  };

  const applyStyles = (rowIndex, colIndex) => {
    return [
                styles.cell,
                (focusedCell.row === rowIndex || focusedCell.col === colIndex) &&
                focusedCell.row !== null && focusedCell.col !== null &&
                styles.relatedCell,
                focusedCell.row === rowIndex && focusedCell.col === colIndex && styles.focusedCell,
                (rowIndex % 3 === 2 && rowIndex !== 8) ? styles.bottomBorder : null,
                (colIndex % 3 === 2 && colIndex !== 8) ? styles.rightBorder : null,
              ]
  }

  return (
    <View style={styles.board}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <TextInput
              key={colIndex}
              style={applyStyles(rowIndex, colIndex)}
              value={cell ? cell.toString() : ''}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={text => handleChange(text, rowIndex, colIndex)}
              editable={initialPuzzle[rowIndex][colIndex] === null}
              onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
              onBlur={() => setFocusedCell({ row: null, col: null })}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    flex: 1,
    marginTop: 100,
    // marginLeft: 5,
    alignContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#999',
    width: 40,
    height: 40,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: "#ffffff"
  },

  focusedCell: {
    backgroundColor: "#de1"
  },
  relatedCell: {
    backgroundColor: "#def"
  },
  bottomBorder: {
    borderBottomWidth: 3,
    height: 43,
  },
  rightBorder: {
    borderRightWidth: 3,
  },
});

export default SudokuGrid;
