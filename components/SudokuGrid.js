import React, { useState, useEffect, useRef } from 'react';
import { Alert, View, Text, TextInput, Pressable, StyleSheet, Keyboard, TouchableWithoutFeedback, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSudokuPuzzle } from './sudokuGenerator';


const SUDOKU_PUZZLE_KEY = 'sudoku_current';
const SUDOKU_INITIAL_KEY = 'sudoku_initial';
const SUDOKU_SOLUTION_KEY = 'sudoku_solution';
const SUDOKU_TIMER_KEY = 'sudokuTimer';
const SETTINGS_KEY = 'sudokuSettings';
const PREV_SETTINGS_Key = 'lastUsedDifficulty';


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
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('Medium');
  const [hasError, setHasError] = useState(false);
  const DIFFICULTY_K_MAP = {
    Easy: 25,
    Medium: 40,
    Hard: 50,
  };


  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        const [saved, init, solution, settings, lastUsedDifficulty] = await Promise.all([
          AsyncStorage.getItem(SUDOKU_PUZZLE_KEY),
          AsyncStorage.getItem(SUDOKU_INITIAL_KEY),
          AsyncStorage.getItem(SUDOKU_SOLUTION_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
          AsyncStorage.getItem(PREV_SETTINGS_Key)
        ]);

        if (settings) {
          const parsed = JSON.parse(settings);
    
          if (parsed.difficulty !== lastUsedDifficulty) {
            await generateNewPuzzle(parsed.difficulty);
            await AsyncStorage.setItem('lastUsedDifficulty', parsed.difficulty);
            setDifficulty(parsed.difficulty);
            setHighlightEnabled(parsed.highlightEnabled);
            return;
          }
    
          setDifficulty(parsed.difficulty);
          setHighlightEnabled(parsed.highlightEnabled);
        }
        
  
        if (saved && init && solution) {
          setGrid(JSON.parse(saved));
          setInitialPuzzle(JSON.parse(init));
          setCompletedPuzzle(JSON.parse(solution));
        } else {
          await generateNewPuzzle(difficulty); // fallback if any are missing
        }
      } catch (e) {
        console.error('Failed to load puzzle:', e);
        await generateNewPuzzle(difficulty);
      }
    };

    

    const loadTimer = async () => {
      try {
        const savedTime = await AsyncStorage.getItem(SUDOKU_TIMER_KEY);
        if (savedTime) {
          setSecondsElapsed(parseInt(savedTime));
          startTimer();
        }
      } catch (e) {
        console.error('Failed to load timer:', e);
      }
    };
    loadPuzzle();

    loadTimer();

    return stopTimer;
  }, []);
  
  const startTimer = () => {
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setSecondsElapsed(prev => {
        const newTime = prev + 1;
        AsyncStorage.setItem(SUDOKU_TIMER_KEY, JSON.stringify(newTime));
        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = async () => {
    stopTimer();
    setSecondsElapsed(0);
    await AsyncStorage.removeItem(SUDOKU_TIMER_KEY);
  };
  
  
  
  

const generateNewPuzzle = async (passedDifficulty) => {
  const kValue = DIFFICULTY_K_MAP[passedDifficulty] || 45;
  const { puzzle, completedPuzzle: solution } = generateSudokuPuzzle(kValue);
  await AsyncStorage.setItem('lastUsedDifficulty', passedDifficulty);
  const deepPuzzle = JSON.parse(JSON.stringify(puzzle));

  setGrid(deepPuzzle);
  setInitialPuzzle(deepPuzzle);
  setCompletedPuzzle(solution);
  setCorrectnessGrid(Array(9).fill(null).map(() => Array(9).fill(null)));
  setNotStopped(true);
  setFocusedCell({ row: null, col: null });
  setSelectedValue(null);
  setHasError(false);

  try {
    await AsyncStorage.setItem(SUDOKU_PUZZLE_KEY, JSON.stringify(deepPuzzle));
    await AsyncStorage.setItem(SUDOKU_INITIAL_KEY, JSON.stringify(deepPuzzle));
    await AsyncStorage.setItem(SUDOKU_SOLUTION_KEY, JSON.stringify(solution));
  } catch (e) {
    console.error('Failed to save puzzle:', e);
  }

  await resetTimer();
  startTimer();
};

const resetGame = async () => {
  try {
    const init = await AsyncStorage.getItem(SUDOKU_INITIAL_KEY);

    if (init) {
      const resetPuzzle = JSON.parse(init);
      setGrid(resetPuzzle);
      setFocusedCell({ row: null, col: null });
      setSelectedValue(null);
      setCorrectnessGrid(Array(9).fill(null).map(() => Array(9).fill(null)));
      setNotStopped(true);
      await AsyncStorage.setItem(SUDOKU_PUZZLE_KEY, JSON.stringify(resetPuzzle));
    } else {
      generateNewPuzzle(difficulty);
    }
  } catch (e) {
    console.error('Failed to reset puzzle:', e);
  }
  await AsyncStorage.setItem('lastUsedDifficulty', difficulty);
  await resetTimer();
  setHasError(false);
  startTimer();  
};


  const handleChange = async (text, row, col) => {
    const newGrid = [...grid];
    const value = parseInt(text);
    newGrid[row][col] = isNaN(value) ? null : value;
    setGrid(newGrid);
  
    try {
      await AsyncStorage.setItem(SUDOKU_PUZZLE_KEY, JSON.stringify(newGrid));
    } catch (e) {
      console.error('Failed to save puzzle:', e);
    }
  };
  


  const checkPuzzle = () => {
    const newCorrectnessGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    let numberOfCorrect = 0;
    setNotStopped(false);
    let hasAnyError = false;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === completedPuzzle[row][col]) {
          newCorrectnessGrid[row][col] = true;
          numberOfCorrect++;
        } else {
          newCorrectnessGrid[row][col] = false;
          hasAnyError = true;
        }
      }
    }
    
    setCorrectnessGrid(newCorrectnessGrid);
    setHasError(hasAnyError);
    setNotStopped(false);
    stopTimer();
    

    Alert.alert(
      'Results:',
      hasAnyError ? 'Some answers are incorrect.' : 'All correct! Well done!',
      [
        { text: "OK"}
      ],
      { cancelable: false }
    )
  };

  const handleCellPress = (row, col) => {
    setFocusedCell({ row, col });
    const value = grid[row][col];
    setSelectedValue(value !== null ? value : null);
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
      highlightEnabled && (focusedCell.row === rowIndex || focusedCell.col === colIndex || inSameBox) &&
        focusedCell.row !== null &&
        focusedCell.col !== null &&
        styles.relatedCell,
      focusedCell.row === rowIndex &&
        focusedCell.col === colIndex &&
        styles.focusedCell,
      highlightEnabled && selectedValue !== null &&
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, justifyContent: 'space-around' }}>
        <View style={styles.topBar}>
          <Text style={styles.title}>{difficulty}</Text>
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: notStopped ? '#333' : '#4CAF50', }}>
                {Math.floor(secondsElapsed / 60)
                  .toString()
                  .padStart(2, '0')}
                :
                {(secondsElapsed % 60).toString().padStart(2, '0')}
              </Text>
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
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 200 }}>
            {hasError && (
              <Pressable onPress={resetGame} style={styles.bottomButton}>
                <Text style={styles.buttonText}>Retry</Text>
              </Pressable>
            )}
            <Pressable onPress={() => generateNewPuzzle(difficulty)} style={styles.bottomButton}>
              <Text style={styles.buttonText}>New Puzzle</Text>
            </Pressable>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
    </SafeAreaView>
  );
  
};

const styles = StyleSheet.create({
  board: {
    flex: 1,
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
  bottomButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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