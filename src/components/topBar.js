import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import AntDesign from '@expo/vector-icons/AntDesign';

export const TopBar = ({ resetGameHandler, finishedGameHandler }) => {
  return (
    <View style={styles.topBar}>
      <View style={styles.leftHeader}>
        <Text style={styles.title}>Sudoku App</Text>
        <Text style={styles.level}>Level 1</Text>
      </View>
      <View style={styles.rightButtons}>
        <Pressable onPress={resetGameHandler} style={styles.topButton}>
          <AntDesign name="reload1" size={24} color="white" />
        </Pressable>
        <Pressable onPress={finishedGameHandler} style={styles.topButton}>
          <AntDesign name="check" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

TopBar.propTypes = {
  resetGameHandler: PropTypes.elementType.isRequired,
  finishedGameHandler: PropTypes.elementType.isRequired,
};

const styles = StyleSheet.create({
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
});
