import React, { useState, useEffect, useRef } from 'react';
import { Alert, View, Text, TextInput, Pressable, StyleSheet, Keyboard, TouchableWithoutFeedback, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import background2 from "../assets/background2.jpg";
import { getSudoku } from 'sudoku-gen';
import { useFocusEffect } from '@react-navigation/native';

const SUDOKU_PUZZLE_KEY = 'sudoku_current';
const SUDOKU_INITIAL_KEY = 'sudoku_initial';
const SUDOKU_SOLUTION_KEY = 'sudoku_solution';
const SUDOKU_TIMER_KEY = 'sudokuTimer';
const SETTINGS_KEY = 'sudokuSettings';
const PREV_SETTINGS_Key = 'lastUsedDifficulty';
const SUDOKU_STOPPED_KEY = 'sudokuStopped';


const SudokuGrid = () => {
  const [grid, setGrid] = useState([]);
  const [initialPuzzle, setInitialPuzzle] = useState([]);
  const [completedPuzzle, setCompletedPuzzle] = useState([]);  
  const [correctnessGrid, setCorrectnessGrid] = useState(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );
  const [focusedCell, setFocusedCell] = useState({ row: null, col: null });
  const [selectedValue, setSelectedValue] = useState(null);
  const [notStopped, setNotStopped] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('medium');
  const [hasError, setHasError] = useState(false);
  const navigation = useNavigation();
  const [isLoaded, setIsLoaded] = useState(false);   // true after loadPuzzle finishes
  const secondsRef = useRef(0);                      // keeps the latest seconds without causing re-renders


useFocusEffect(
  React.useCallback(() => {
    // when screen gains focus: start timer only if load finished and game is active
    if (isLoaded && notStopped) {
      // ensure no duplicate
      stopTimer();
      startTimer();
    }

    // on blur/unmount of focus: stop timer and persist the latest time
    return () => {
      stopTimer();
      (async () => {
        try {
          await AsyncStorage.setItem(SUDOKU_TIMER_KEY, String(secondsRef.current));
        } catch (e) {
          console.error('Failed to save timer on blur', e);
        }
      })();
    };
  }, [isLoaded, notStopped])
);

useEffect(() => {
  const loadPuzzle = async () => {
    try {
      const [saved, init, solution, settings, lastUsedDifficulty, stopped] =
        await Promise.all([
          AsyncStorage.getItem(SUDOKU_PUZZLE_KEY),
          AsyncStorage.getItem(SUDOKU_INITIAL_KEY),
          AsyncStorage.getItem(SUDOKU_SOLUTION_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
          AsyncStorage.getItem(PREV_SETTINGS_Key),
          AsyncStorage.getItem(SUDOKU_STOPPED_KEY),
        ]);

      // apply settings (if any)
      if (settings) {
        const parsed = JSON.parse(settings);
        setDifficulty(parsed.difficulty);
        setHighlightEnabled(parsed.highlightEnabled);
        if (parsed.difficulty !== lastUsedDifficulty) {
          await generateNewPuzzle(parsed.difficulty);
          await AsyncStorage.setItem(PREV_SETTINGS_Key, parsed.difficulty);
          setIsLoaded(true);
          return;
        }
      }

      // If the game was stopped -> generate NEW puzzle (per your latest requirement)
      if (stopped === 'true') {
        await AsyncStorage.removeItem(SUDOKU_STOPPED_KEY);
        await generateNewPuzzle(difficulty);
        setIsLoaded(true);
        return;
      }

      // Normal resume: restore board + timer
      if (saved && init && solution) {
        const parsedGrid = JSON.parse(saved);
        const parsedInit = JSON.parse(init);
        const parsedSolution = JSON.parse(solution);

        setGrid(parsedGrid);
        setInitialPuzzle(parsedInit);
        setCompletedPuzzle(parsedSolution);

        const savedTime = await AsyncStorage.getItem(SUDOKU_TIMER_KEY);
        const startSeconds = savedTime ? parseInt(savedTime, 10) : 0;
        setSecondsElapsed(startSeconds);
        secondsRef.current = startSeconds;
      } else {
        await generateNewPuzzle(difficulty);
      }

      setIsLoaded(true);
    } catch (e) {
      console.error('Failed to load puzzle:', e);
      await generateNewPuzzle(difficulty);
      setIsLoaded(true);
    }
  };

  loadPuzzle();
  // ensure interval cleaned up on unmount
  return () => {
    stopTimer();
  };
}, []);


  
  const startTimer = () => {
    // ensure no duplicate interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setSecondsElapsed(prev => {
        const newTime = prev + 1;
        secondsRef.current = newTime;
        // persist every tick (string)
        AsyncStorage.setItem(SUDOKU_TIMER_KEY, String(newTime)).catch(e => {
          console.error('Failed to save timer tick', e);
        });
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
    secondsRef.current = 0;

    try {
      await AsyncStorage.setItem(SUDOKU_TIMER_KEY, '0');
    } catch (e) {
      console.error('Failed to write timer=0', e);
    }

    // 👇 Start ticking again
    startTimer();
  };


  
  
  // Function to convert Sudoku string into a 2D array
const convertTo2DArray = (sudokuString) => {
  let grid = [];
  for (let i = 0; i < 9; i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
      const cell = sudokuString[i * 9 + j]; // Get the character at position i * 9 + j
      row.push(cell === '-' ? null : parseInt(cell)); // Replace '-' with null, or parse the number
    }
    grid.push(row);
  }
  return grid;
};
  
const generateNewPuzzle = async (passedDifficulty) => {
  // stop any running timer while generating
  stopTimer();
  setSecondsElapsed(0);
  secondsRef.current = 0;
  try {
    await AsyncStorage.setItem(SUDOKU_TIMER_KEY, '0');
  } catch (e) {
    console.error('Failed to set timer to 0 when generating', e);
  }

  const { puzzle, solution } = getSudoku(passedDifficulty);
  await AsyncStorage.setItem('lastUsedDifficulty', passedDifficulty);

  const deepPuzzle = convertTo2DArray(puzzle);
  const completedPuzzle = convertTo2DArray(solution);

  setGrid(JSON.parse(JSON.stringify(deepPuzzle)));
  setInitialPuzzle(JSON.parse(JSON.stringify(deepPuzzle)));
  setCompletedPuzzle(completedPuzzle);
  setCorrectnessGrid(Array(9).fill(null).map(() => Array(9).fill(null)));
  setNotStopped(true);
  setFocusedCell({ row: null, col: null });
  setSelectedValue(null);
  setHasError(false);

  try {
    await AsyncStorage.setItem(SUDOKU_PUZZLE_KEY, JSON.stringify(deepPuzzle));
    await AsyncStorage.setItem(SUDOKU_INITIAL_KEY, JSON.stringify(deepPuzzle));
    await AsyncStorage.setItem(SUDOKU_SOLUTION_KEY, JSON.stringify(completedPuzzle));
  } catch (e) {
    console.error('Failed to save puzzle:', e);
  }

  // don't start timer here; focus effect will start it if screen is focused
};


  

const resetGame = async () => {
  try {
    stopTimer();
    setSecondsElapsed(0);
    secondsRef.current = 0;
    await AsyncStorage.setItem(SUDOKU_TIMER_KEY, '0');

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
      await generateNewPuzzle(difficulty);
    }
  } catch (e) {
    console.error('Failed to reset puzzle:', e);
  } finally {
    await AsyncStorage.setItem('lastUsedDifficulty', difficulty);
    setHasError(false);
    await AsyncStorage.removeItem(SUDOKU_STOPPED_KEY);
    
    // 👇 FIX: restart timer immediately
    setNotStopped(true);
    startTimer();
  }
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
  


  const checkPuzzle = async () => {
    const newCorrectnessGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    let hasAnyError = false;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === completedPuzzle[row][col]) {
          newCorrectnessGrid[row][col] = true;
        } else {
          newCorrectnessGrid[row][col] = false;
          hasAnyError = true;
        }
      }
    }

    setCorrectnessGrid(newCorrectnessGrid);
    setHasError(hasAnyError);
    setNotStopped(false);

    // snapshot final time
    setFinalTime(secondsRef.current);

    // stop and persist 0 for next load
    stopTimer();
    await resetTimer(); // this now writes '0' to storage
    await AsyncStorage.setItem(SUDOKU_STOPPED_KEY, 'true');

    Alert.alert(
      'Results:',
      hasAnyError ? 'Some answers are incorrect.' : 'All correct! Well done!',
      [{ text: "OK" }],
      { cancelable: false }
    );
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

  // Only render the map function when grid, initialPuzzle, and completedPuzzle are valid
  if (!grid || !initialPuzzle || !completedPuzzle || grid.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading puzzle...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // tweak this if needed
  >
  <ImageBackground
    source={background2}
    resizeMode="cover"
    style={{ flex: 1 }}
  >

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
      <View style={{ flex: 1 }}>
        <View style={styles.topBar}>
        <Pressable onPress={() => navigation.navigate('Menu')} style={styles.topButton}>
                  <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
        <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.title}>{difficulty}</Text>
          </Pressable>
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={{
              fontSize: fontSize*1.3,
              fontWeight: 'bold',
              color: notStopped ? '#333' : '#4CAF50',
            }}>
              {Math.floor((notStopped ? secondsElapsed : finalTime) / 60)
                .toString()
                .padStart(2, '0')}
              :
              {((notStopped ? secondsElapsed : finalTime) % 60)
                .toString()
                .padStart(2, '0')}
            </Text>
            </View>
          <View style={styles.rightButtons}>
            <Pressable onPress={resetGame} style={styles.topLeftButton}>
            <AntDesign name="reload" size={24} color="white" />
            </Pressable>
            <Pressable onPress={handleFinishedPress} style={styles.topLeftButton}>
              <AntDesign name="check" size={24} color="white" />
            </Pressable>
          </View>
        </View>
  
        <View style={styles.board}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => {
                const isEditable = initialPuzzle[rowIndex][colIndex] === null;

                if (isEditable) {
                  const value = cell !== null ? cell.toString() : '';
                  return (
                    <TextInput
                      key={colIndex}
                      style={applyStyles(rowIndex, colIndex)}
                      value={value}
                      keyboardType="number-pad"
                      maxLength={1}
                      editable={notStopped} // 👈 only controls typing, not rendering
                      selection={{
                        start: value.length,
                        end: value.length,
                      }} // 👈 cursor always at end
                      onChangeText={text => {
                        if (!notStopped) return;
                        handleChange(text, rowIndex, colIndex);
                        if (text.length === 1) {
                          Keyboard.dismiss();
                        }
                      }}
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
      </ScrollView>
    </TouchableWithoutFeedback>
    </ImageBackground>
    </KeyboardAvoidingView>
</SafeAreaView>

  );
  
};

const screenWidth = Dimensions.get('window').width;
const boardSize = screenWidth * 0.9;
const cellSize = boardSize / 9;
const fontSize = cellSize * 0.35;


const styles = StyleSheet.create({
  board: {
    width: boardSize,
    height: boardSize,
    alignSelf: 'center',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderWidth: 0.5,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: fontSize,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
  },
  fixedText: {
    fontSize: fontSize,
    textAlign: 'center',
    textAlignVertical: 'center',
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
    borderBottomWidth: 1,
  },
  rightBorder: {
    borderRightWidth: 1,
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
    //marginTop: Platform.OS === 'ios' ? 0 : 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: fontSize*1.3,
    fontWeight: 'bold',
    color: 'black',
    textTransform: 'capitalize',
  },
  rightButtons: {
    flexDirection: 'row',
  },
  topButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    margin:0,
  },
  topLeftButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 8,
  },
  bottomButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderWidth: 1,
    borderColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 10,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: fontSize*1.3,
  },
  
});

export default SudokuGrid;