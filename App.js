// App.js
import React from 'react';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import MyQueue from './screens/MyQueue';

import Login from './screens/login';
import Generate from './screens/generate';
import Gallery from './screens/gallery';
import Account from './screens/account';
import Signup from './screens/signup';
import AdminDashboard from './screens/AdminDashboard'
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabsWrapper() {
  
  const route = useRoute();
  const userId = route.params?.userId || route.params?.user_id;
  console.log('MainTabsWrapper got userId:', route.params?.userId);


  if (!userId) {
    console.warn("No user ID found");
  }

  return <MainTabs userId={userId} />;
}

function MainTabs({ userId }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#333',
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 50,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Generate') {
            iconName = focused ? 'color-wand' : 'color-wand-outline';
          } else if (route.name === 'Gallery') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
      })}
    >
      <Tab.Screen
        name="Generate"
        component={Generate}
        initialParams={{ userId }}
      />
    


      <Tab.Screen
        name="Gallery"
        component={Gallery}
        initialParams={{ userId }}
      />
      <Tab.Screen
        name="Account"
        component={Account}
        initialParams={{ userId }}
      />
    </Tab.Navigator>
  );
}

// ✅ Main App
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MainTabs" component={MainTabsWrapper} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen
          name="MyQueue"
          component={MyQueue}
          options={{ title: 'My Queue' }}  // Make sure this is present
        />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
