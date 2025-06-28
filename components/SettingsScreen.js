import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const SETTINGS_KEY = 'sudokuSettings';


const SettingsScreen = () => {
  const [difficulty, setDifficulty] = useState('Medium');
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const navigation = useNavigation();


  useEffect(() => {
    const loadSettings = async () => {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDifficulty(parsed.difficulty);
        setHighlightEnabled(parsed.highlightEnabled);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    const settings = { difficulty, highlightEnabled };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    navigation.navigate('Menu');
  };

  return (
    <View style={styles.container}>

      <Text style={styles.label}>Difficulty:</Text>
      {['Easy', 'Medium', 'Hard'].map(level => (
        <Pressable
          key={level}
          style={[
            styles.option,
            difficulty === level && styles.selectedOption
          ]}
          onPress={() => setDifficulty(level)}
        >
          <Text style={styles.optionText}>{level}</Text>
        </Pressable>
      ))}

      <View style={styles.toggleContainer}>
        <Text style={styles.label}>Enable Highlights:</Text>
        <Switch
          value={highlightEnabled}
          onValueChange={setHighlightEnabled}
        />
      </View>

      <Pressable onPress={saveSettings} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Confirm</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  label: { fontSize: 18, marginTop: 20 },
  option: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    marginTop: 10,
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
  },
  optionText: {
    color: '#000',
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  saveButton: {
    marginTop: 40,
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingsScreen;
