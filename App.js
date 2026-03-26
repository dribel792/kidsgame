import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen       from './screens/HomeScreen';
import DifficultyScreen from './screens/DifficultyScreen';
import LettersScreen    from './screens/LettersScreen';
import MemoryScreen     from './screens/MemoryScreen';
import CountingScreen   from './screens/CountingScreen';
import MathScreen       from './screens/MathScreen';
import PatternsScreen   from './screens/PatternsScreen';
import OddOneOutScreen  from './screens/OddOneOutScreen';
import SortingScreen    from './screens/SortingScreen';
import ColorsScreen     from './screens/ColorsScreen';
import ShapesScreen     from './screens/ShapesScreen';
import TriviaScreen     from './screens/TriviaScreen';
import AttentionScreen  from './screens/AttentionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
        <Stack.Screen name="Home"        component={HomeScreen}      />
        <Stack.Screen name="Difficulty"  component={DifficultyScreen}/>
        <Stack.Screen name="Letters"     component={LettersScreen}   />
        <Stack.Screen name="Memory"      component={MemoryScreen}    />
        <Stack.Screen name="Counting"    component={CountingScreen}  />
        <Stack.Screen name="Math"        component={MathScreen}      />
        <Stack.Screen name="Patterns"    component={PatternsScreen}  />
        <Stack.Screen name="OddOneOut"   component={OddOneOutScreen} />
        <Stack.Screen name="Sorting"     component={SortingScreen}   />
        <Stack.Screen name="Colors"      component={ColorsScreen}    />
        <Stack.Screen name="Shapes"      component={ShapesScreen}    />
        <Stack.Screen name="Trivia"      component={TriviaScreen}    />
        <Stack.Screen name="Attention"   component={AttentionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
