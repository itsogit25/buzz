import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Loader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import FoodListScreen from '../screens/FoodListScreen';
import CalorieIntakeScreen from '../screens/CalorieIntakeScreen';
import ExerciseListScreen from '../screens/ExerciseListScreen';
import ExerciseDoneScreen from '../screens/ExerciseDoneScreen';
import DailyStatusScreen from '../screens/DailyStatusScreen';
import GraphsScreen from '../screens/GraphsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotesScreen from '../screens/NotesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true, tabBarActiveTintColor: '#f59e0b' }}>
      <Tab.Screen name="Food List" component={FoodListScreen} />
      <Tab.Screen name="Calorie Intake" component={CalorieIntakeScreen} />
      <Tab.Screen name="Exercises" component={ExerciseListScreen} />
      <Tab.Screen name="Exercise Done" component={ExerciseDoneScreen} />
      <Tab.Screen name="Daily Status" component={DailyStatusScreen} />
      <Tab.Screen name="Graphs" component={GraphsScreen} />
    </Tab.Navigator>
  );
}

function DrawerScreens() {
  return (
    <Drawer.Navigator screenOptions={{ headerTintColor: '#111827' }}>
      <Drawer.Screen name="Home" component={Tabs} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Personal Notes" component={NotesScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();
  if (loading) return <Loader />;
  return <NavigationContainer>{session ? <DrawerScreens /> : <AuthScreen />}</NavigationContainer>;
}
