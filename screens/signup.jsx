import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import ipConfig from '../ip.json'; // make sure this exists and is generated before running

const { width } = Dimensions.get('window');
const backendIp = ipConfig.ip;
const registerUrl = `http://${backendIp}:8000/register`;

export default function Signup({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const text = await response.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON: ' + text);
      }

      if (data.message?.toLowerCase().includes('success')) {
        alert('Signup successful!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { userId: data.user_id } }],
        });


      } else {
        alert(data.detail || data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong during signup.');
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#0d0d0d', '#1a1a1a']}
      style={styles.container}
    >
      <StatusBar style="light" />

      <Text style={styles.logo}>Sign Up</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#888"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Pressable style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Create Account</Text>
        </Pressable>

        <View style={styles.card}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signuplink}>
              Already have an account? <Text style={styles.link}>Login</Text>
            </Text>
          </TouchableOpacity>
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
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 40,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 480, // limits width on web
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#ffffff11',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#121212',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#888',
    transitionDuration: '200ms', // web only
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  signuplink: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    color: '#1e90ff',
    fontSize: 14,
  },
  card: {
    paddingTop: 16,
    alignItems: 'center',
  },
});
