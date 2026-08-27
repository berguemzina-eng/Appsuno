/**
 * App.tsx - Componente raíz: splash screen + navegación por tabs
 * (Generador, Biblioteca, Ajustes).
 */

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen from './src/screens/SplashScreen';
import GeneratorScreen from './src/screens/GeneratorScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/theme/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return <SplashScreen onReady={() => setReady(true)} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
        }}
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: { backgroundColor: colors.surface },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarIcon: ({ color, size }) => {
              const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
                Generador: 'sparkles',
                Biblioteca: 'library',
                Ajustes: 'settings',
              };
              return (
                <Ionicons
                  name={icons[route.name] ?? 'musical-notes'}
                  size={size}
                  color={color}
                />
              );
            },
          })}
        >
          <Tab.Screen name="Generador" component={GeneratorScreen} />
          <Tab.Screen name="Biblioteca" component={LibraryScreen} />
          <Tab.Screen name="Ajustes" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
