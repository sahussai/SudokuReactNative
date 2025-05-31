import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';

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

const initialPuzzleCopy = JSON.parse(JSON.stringify(initialPuzzle));


const SudokuGrid = () => {
  const [grid, setGrid] = useState(initialPuzzle);
  const [focusedCell, setFocusedCell] = useState({ row: null, col: null });
  const [selectedValue, setSelectedValue] = useState(null);

  const handleChange = (text, row, col) => {
    const newGrid = [...grid];
    const value = parseInt(text);
    newGrid[row][col] = isNaN(value) ? null : value;
    setGrid(newGrid);
  };

  const handleCellPress = (row, col) => {
    setFocusedCell({ row, col });
    const value = grid[row][col];
    setSelectedValue(value !== null ? value : null);
    
  };

  const applyStyles = (rowIndex, colIndex) => {
    const cellValue = grid[rowIndex][colIndex];
    return [
      styles.cell,
      (focusedCell.row === rowIndex || focusedCell.col === colIndex) &&
        focusedCell.row !== null &&
        focusedCell.col !== null &&
        styles.relatedCell,
      focusedCell.row === rowIndex &&
        focusedCell.col === colIndex &&
        styles.focusedCell,
      selectedValue !== null &&
        cellValue === selectedValue &&
        styles.sameValueCell,
      rowIndex % 3 === 2 && rowIndex !== 8 ? styles.bottomBorder : null,
      colIndex % 3 === 2 && colIndex !== 8 ? styles.rightBorder : null,
    ];
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.board}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => {
            const isEditable = initialPuzzleCopy[rowIndex][colIndex] === null;

            if (isEditable) {
              return (
                <TextInput
                  key={colIndex}
                  style={applyStyles(rowIndex, colIndex)}
                  value={cell !== null ? cell.toString() : ''}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={text => handleChange(text, rowIndex, colIndex)}
                  onFocus={() => handleCellPress(rowIndex, colIndex)}
                  onBlur={() => setFocusedCell({ row: null, col: null })}
                />
              );
            } else {
              return (
                <Pressable
                  key={colIndex}
                  onPress={() => {
                    handleCellPress(rowIndex, colIndex);
                   Keyboard.dismiss();
                  }}
                  style={applyStyles(rowIndex, colIndex)}
                >
                  <Text style={styles.fixedText}>{cell}</Text>
                </Pressable>
              );
            }
          })}
        </View>
      ))}
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  board: {
    flex: 1,
    marginTop: 100,
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
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
  },
  fixedText: {
    fontSize: 18,
    textAlign: 'center',
  },
  focusedCell: {
    backgroundColor: '#ffeb3b',
  },
  relatedCell: {
    backgroundColor: '#cceeff',
  },
  sameValueCell: {
    backgroundColor: '#aaffaa',
  },
  bottomBorder: {
    borderBottomWidth: 3,
  },
  rightBorder: {
    borderRightWidth: 3,
  },
});

export default SudokuGrid;
