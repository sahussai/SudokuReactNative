import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import background2 from "../assets/background2.jpg"


const SETTINGS_KEY = 'sudokuSettings';


const SettingsScreen = () => {
  const [difficulty, setDifficulty] = useState('medium');
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
    <ImageBackground
    source={background2}
    resizeMode="cover"
    style={styles.image}
  >
    <View style={styles.container}>

      <Text style={styles.label}>Difficulty:</Text>
      {['easy', 'medium', 'hard', 'expert'].map(level => (
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
          trackColor={{ false: "#767577", true: "black" }}
        />
      </View>

      <Pressable onPress={saveSettings} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Confirm</Text>
      </Pressable>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  label: { fontSize: 18, fontFamily:'MeriendaRegular', marginTop: 20 },
  option: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    marginTop: 10,
  },
  selectedOption: {
    //backgroundColor: '#4CAF50',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  optionText: {
    color: '#000',
    fontSize: 16,
    textTransform: 'capitalize',
    fontFamily:'MeriendaRegular'
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  saveButton: {
    marginTop: 40,
    //backgroundColor: '#4CAF50',
    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  }
});

export default SettingsScreen;
