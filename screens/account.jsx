import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ipConfig from '../ip.json';

export default function Account({ route }) {
  const userId = route?.params?.userId;
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();
  const backendURL = `http://${ipConfig.ip}:8000`;

  useEffect(() => {
    if (!userId) return;

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`${backendURL}/user-info/${userId}`);
        const data = await res.json();
        setUserInfo(data);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };

    fetchUserInfo();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await fetch(`${backendURL}/clear-queue/${userId}`, {
        method: 'POST',
      });

      Alert.alert('Logged Out', 'Your session has been cleared.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]);
    } catch (err) {
      console.error("Failed to clear queue", err);
      Alert.alert('Error', 'Failed to logout properly.');
    }
  };

  if (!userInfo) {
    return (
      <LinearGradient colors={['#1a1a1a', '#000']} style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading account info...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a1a1a', '#000']} style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <Text style={styles.title}>Welcome, {userInfo.username}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userInfo.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Joined</Text>
          <Text style={styles.value}>{userInfo.created_at?.split('T')[0]}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Total Generations</Text>
          <Text style={styles.value}>{userInfo.total_images}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#111',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#222',
  },
  label: {
    color: '#888',
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: '#ff4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    }),
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
