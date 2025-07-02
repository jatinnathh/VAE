import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import ipConfig from '../ip.json';

const { width } = Dimensions.get('window');
const backendIp = ipConfig.ip;
const loginUrl = `http://${backendIp}:8000/login`;

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const resp = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        Alert.alert('Login Failed', 'Invalid email or password');
        return;
      }

      const data = await resp.json();
      console.log('[Login Success]', data);

      if (data.role === 'admin') {
        navigation.replace('AdminDashboard');
      } else {
        navigation.replace('MainTabs', { user_id: data.user_id });
      }

    } catch (e) {
      console.error('[Login Error]', e);
      Alert.alert('Network Error', 'Could not connect to server.');
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#1a1a1a']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.inner}>
        <Text style={styles.logo}>Text to Image</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Email or Username"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.85 },
          ]} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.signuplink}>
              Don't have an account?{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Signup')}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  inner: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'web' ? 'sans-serif' : 'monospace',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 24,
    borderColor: '#ffffff22',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: 'transparent', // or remove entirely for Web
      },
    }),
    gap: 16,
  },

  input: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  signuplink: {
    color: '#ccc',
    fontSize: 14,
  },
  link: {
    color: '#1e90ff',
    fontSize: 14,
  },
});
