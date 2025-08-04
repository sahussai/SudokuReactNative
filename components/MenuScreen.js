import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ImageBackground } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AntDesign from '@expo/vector-icons/AntDesign';
import background from "../assets/background.jpg";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const MenuScreen = ({ navigation }) => {
  const onLayoutRootView = useCallback(async () => {
    // Wait until background image has loaded
    await SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ImageBackground
        source={background}
        style={styles.image}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Sudoku</Text>

          <Pressable style={styles.button} onPress={() => navigation.navigate('Sudoku')}>
            <Text style={styles.buttonText}>Play</Text>
          </Pressable>

          <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <AntDesign name="setting" size={25} color="black" />
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    //backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
  title: {
    fontSize: 70,
    fontWeight: 'italic',
    marginBottom: 30,
    fontFamily: 'BodoniModa',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 38,
    borderRadius: 100,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 25,
    textAlign: 'center',
    fontFamily: 'BodoniModa',
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
  
});

export default MenuScreen;
