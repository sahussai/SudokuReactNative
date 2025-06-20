import React, { useState } from 'react';
import { Alert, View, Text, TextInput, Pressable, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

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
const completedPuzzle = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];


const initialPuzzleCopy = JSON.parse(JSON.stringify(initialPuzzle));


const SudokuGrid = () => {
  const [grid, setGrid] = useState(JSON.parse(JSON.stringify(initialPuzzle)));
  const [focusedCell, setFocusedCell] = useState({ row: null, col: null });
  const [selectedValue, setSelectedValue] = useState(null);
  const [correctnessGrid, setCorrectnessGrid] = useState(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );
  const [notStopped, setNotStopped] = useState(true)


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

  const checkPuzzle = () => {
    const newCorrectnessGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    let numberOfCorrect = 0;
    setNotStopped(false);
    let hasError = false;
  
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === completedPuzzle[row][col]) {
          newCorrectnessGrid[row][col] = true;
          numberOfCorrect++;
        } else {
          newCorrectnessGrid[row][col] = false;
          hasError = true;
        }
      }
    }
    setCorrectnessGrid(newCorrectnessGrid);

    Alert.alert(
    'Results:',
      hasError ? 'Some answers are incorrect.' : 'All correct! Well done!',
      { cancelable: false }
    )
    
  };

  const resetGame = () => {
    setGrid(JSON.parse(JSON.stringify(initialPuzzle)));
    setFocusedCell({ row: null, col: null });
    setSelectedValue(null);
    setCorrectnessGrid(Array(9).fill(null).map(() => Array(9).fill(null)));
    setNotStopped(true);
  };  
  
  const handleFinishedPress = () => {
    Alert.alert(
      'Confirm Completion',
      'Are you sure you want to finish and check your answers?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: checkPuzzle,
          style: 'destructive',
        },
      ]
    );
  };
  
  
  

  const applyStyles = (rowIndex, colIndex) => {
    const cellValue = grid[rowIndex][colIndex];
    const inSameBox =
      focusedCell.row !== null &&
      focusedCell.col !== null &&
      Math.floor(rowIndex / 3) === Math.floor(focusedCell.row / 3) &&
      Math.floor(colIndex / 3) === Math.floor(focusedCell.col / 3);
  
    const isCorrect = correctnessGrid[rowIndex][colIndex];
  
    return [
      styles.cell,
      (focusedCell.row === rowIndex || focusedCell.col === colIndex || inSameBox) &&
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
      isCorrect === true && styles.correctCell,
      isCorrect === false && styles.incorrectCell,
    ];
  };
  
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <View style={styles.leftHeader}>
            <Text style={styles.title}>Sudoku App</Text>
            <Text style={styles.level}>Level 1</Text>
          </View>
          <View style={styles.rightButtons}>
            <Pressable onPress={resetGame} style={styles.topButton}>
            <AntDesign name="reload1" size={24} color="white" />
            </Pressable>
            <Pressable onPress={handleFinishedPress} style={styles.topButton}>
              <AntDesign name="check" size={24} color="white" />
            </Pressable>
          </View>
        </View>
  
        <View style={styles.board}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => {
                const isEditable = initialPuzzleCopy[rowIndex][colIndex] === null;
  
                if (isEditable && notStopped) {
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
      </View>
    </TouchableWithoutFeedback>
  );
  
};

const styles = StyleSheet.create({
  board: {
    flex: 1,
    marginTop: 20,
    padding: 13,
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
  boxHighlight: {
    backgroundColor: '#fceabb',
  },  
  correctCell: {
    backgroundColor: '#ccffcc',
  },
  incorrectCell: {
    backgroundColor: '#ffcccc',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginTop: 50,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  leftHeader: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  level: {
    fontSize: 14,
    color: '#666',
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 2,
  },
  topButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
});

export default SudokuGrid;
