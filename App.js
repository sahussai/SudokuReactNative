import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from './components/MenuScreen';
import SudokuGrid from './components/SudokuGrid';
import SettingsScreen from './components/SettingsScreen';


const Stack = createNativeStackNavigator();

import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export default function App() {


  const [fontsLoaded] = Font.useFonts({
    //'BodoniModa': require('./assets/fonts/Bodoni Moda 48pt Regular.ttf'),
    //'MeriendaRegular': require('./assets/fonts/Merienda Regular.ttf'),
    // add more fonts here
  });


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Sudoku" component={SudokuGrid} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    
  );
}


