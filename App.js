import { StyleSheet, Text, View, Button } from 'react-native';

import SudokuGrid from './components/SudokuGrid'

export default function App() {
  return <SudokuGrid/>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
