import React, { useState, useEffect } from 'react';
import { Alert, View, Text, TextInput, Pressable, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSudokuPuzzle } from './sudokuGenerator';

const SUDOKU_PUZZLE_KEY = 'sudokuPuzzle';

const SudokuGrid = () => {
  const [grid, setGrid] = useState(null);
  const [initialPuzzle, setInitialPuzzle] = useState(null);
  const [completedPuzzle, setCompletedPuzzle] = useState(null);
  const [correctnessGrid, setCorrectnessGrid] = useState(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );
  const [focusedCell, setFocusedCell] = useState({ row: null, col: null });
  const [selectedValue, setSelectedValue] = useState(null);
  const [notStopped, setNotStopped] = useState(true);

  useEffect(() => {
    const loadOrGeneratePuzzle = async () => {
      try {
        const savedData = await AsyncStorage.getItem(SUDOKU_PUZZLE_KEY);
  
        if (savedData) {
          console.log("Loading Puzzle and Completed: ",puzzle, "\n\n", completedPuzzle);
          const { puzzle, completedPuzzle: solution, initialPuzzle: initialPuzzle } = JSON.parse(savedData);
          setGrid(puzzle);
          setInitialPuzzle(initialPuzzle);
          setCompletedPuzzle(solution);
        } else {
          generateNewPuzzle();
        }
      } catch (e) {
        console.error('Failed to load puzzle:', e);
        generateNewPuzzle();
      }
    };
  
    loadOrGeneratePuzzle();
  }, []);
  

  const generateNewPuzzle = () => {
    const { puzzle, completedPuzzle: solution } = generateSudokuPuzzle(35);
    setGrid(puzzle);
    setInitialPuzzle(JSON.parse(JSON.stringify(puzzle)));
    setCompletedPuzzle(solution);
    setCorrectnessGrid(Array(9).fill(null).map(() => Array(9).fill(null)));
    setNotStopped(true);
    setFocusedCell({ row: null, col: null });
    setSelectedValue(null);

    // Save both to AsyncStorage
    console.log("Saved Puzzle and Completed: ",puzzle, "\n\n",completedPuzzle);
    AsyncStorage.setItem(SUDOKU_PUZZLE_KEY, JSON.stringify({
      puzzle,
      completedPuzzle: solution,
      initialPuzzle: puzzle,
    })).catch(err =>
      console.error('Failed to save puzzle:', err)
    );
  };

  const resetGame = async () => {
    const reset = JSON.parse(JSON.stringify(initialPuzzle));
    setGrid(reset);
    setCorrectnessGrid(Array(9).fill(null).map(() => Array(9).fill(null)));
    setNotStopped(true);
    setFocusedCell({ row: null, col: null });
    setSelectedValue(null);

    try {
      await AsyncStorage.setItem(
        SUDOKU_PUZZLE_KEY,
        JSON.stringify({
          puzzle: reset,
          completedPuzzle: completedPuzzle,
          initialPuzzle: reset,
        })
      );
    } catch (e) {
      console.error('Failed to save puzzle:', e);
    }
  };

  const handleChange = async (text, row, col) => {
    const newGrid = [...grid];
    const value = parseInt(text);
    newGrid[row][col] = isNaN(value) ? null : value;
    setGrid(newGrid);

    try {
      await AsyncStorage.setItem(
        SUDOKU_PUZZLE_KEY,
        JSON.stringify({
          puzzle: newGrid,
          completedPuzzle: completedPuzzle, // make sure this is the current one!
          initialPuzzle: initialPuzzle,
        })
      );
    } catch (e) {
      console.error('Failed to save puzzle:', e);
    }
  };


  const checkPuzzle = () => {
    const newCorrectnessGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    let hasError = false;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === completedPuzzle[row][col]) {
          newCorrectnessGrid[row][col] = true;
        } else {
          newCorrectnessGrid[row][col] = false;
          hasError = true;
        }
      }
    }

    setCorrectnessGrid(newCorrectnessGrid);
    setNotStopped(false);

    //alert(hasError ? 'Some answers are incorrect.' : 'All correct! Well done!');
    Alert.alert(
      'Results:',
      hasError ? 'Some answers are incorrect.' : 'All correct! Well done!',
      { cancelable: false }
    )
  };

  const handleFinishedPress = () => {
    Alert.alert(
      'Confirm Completion',
      'Are you sure you want to finish and check your answers?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: checkPuzzle, style: 'destructive' },
      ]
    );
  };

  const handleCellPress = (row, col) => {
    setFocusedCell({ row, col });
    const value = grid[row][col];
    setSelectedValue(value !== null ? value : null);
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

  if (!grid || !initialPuzzle || !completedPuzzle) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading puzzle...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Sudoku App</Text>
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
                const isEditable = initialPuzzle[rowIndex][colIndex] === null;
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

        {!notStopped && (
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Pressable onPress={generateNewPuzzle} style={styles.topButton}>
              <Text style={styles.buttonText}>New Puzzle</Text>
            </Pressable>
          </View>
        )}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  rightButtons: {
    flexDirection: 'row',
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


// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';

// const CounterApp = () => {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     // Load counter on startup
//     const loadCount = async () => {
//       const saved = await AsyncStorage.getItem('counter');
//       if (saved !== null) {
//         setCount(Number(saved));
//       }
//     };
//     loadCount();
//   }, []);

//   const increment = async () => {
//     const newCount = count + 1;
//     setCount(newCount);
//     await AsyncStorage.setItem('counter', newCount.toString());
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Counter: {count}</Text>
//       <Button title="Increment" onPress={increment} />
//     </View>
//   );
// };

// export default CounterApp;

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   text: { fontSize: 24, marginBottom: 10 },
// });