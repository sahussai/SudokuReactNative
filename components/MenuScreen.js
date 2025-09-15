import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ImageBackground, Image, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Ionicons from '@expo/vector-icons/Ionicons';
import background from "../assets/background.jpg";
import titleImage from "../assets/title2.png";  // 👈 import your title image

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const { width } = Dimensions.get("window"); 
const TITLE_WIDTH = width * 0.8;   // 80% of screen width
const TITLE_HEIGHT = TITLE_WIDTH * 0.3; // adjust ratio based on your image

const MenuScreen = ({ navigation }) => {
  const onLayoutRootView = useCallback(async () => {
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

          {/* Replace Text with Scalable Image */}
          <Image
            source={titleImage}
            style={{ 
              width: TITLE_WIDTH, 
              height: TITLE_HEIGHT, 
              resizeMode: "contain", 
              marginBottom: 40 
            }}
          />

          <Pressable style={styles.button} onPress={() => navigation.navigate('Sudoku')}>
            <Text style={styles.buttonText}>Play</Text>
          </Pressable>

          <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="black" />
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
  },
  button: {
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
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});

export default MenuScreen;
