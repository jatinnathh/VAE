import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ipConfig from '../ip.json';

const { width } = Dimensions.get('window');

export default function Generate({ navigation, route }) {
  const userId = route.params?.userId;
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputImage, setInputImage] = useState(null);

  const backendURL = `http://${ipConfig.ip}:8000`;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Avoids deprecated enum
      base64: true,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setInputImage(result.assets[0]);
    }
  };

  const queuePrompt = async () => {
    if (!prompt.trim()) {
      Alert.alert('Prompt required', 'Please enter a prompt.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        prompt,
        uncond_prompt: negativePrompt,
        input_image: inputImage?.base64
          ? `data:image/jpeg;base64,${inputImage.base64}`
          : null,
      };

      const res = await fetch(`${backendURL}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('[Queue API Response]', data);

      if (res.ok) {
        Alert.alert('Queued', 'Your prompt has been queued for processing.');
        setPrompt('');
        setNegativePrompt('');
        setInputImage(null);
      } else {
        Alert.alert('Error', data.detail || 'Failed to queue.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network or server issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#000']} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.headerWrapper}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Generate Image</Text>

              <View style={styles.galleryColumn}>
                <TouchableOpacity onPress={pickImage} style={styles.plusButton}>
                  <MaterialIcons name="image" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.galleryText}>
                  Pick an image to enhance or edit using AI!
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Describe your image..."
              placeholderTextColor="#666"
              value={prompt}
              onChangeText={setPrompt}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="What to avoid? (negative prompt)"
              placeholderTextColor="#666"
              value={negativePrompt}
              onChangeText={setNegativePrompt}
              multiline
            />

            {inputImage && (
              <Image
                source={{ uri: inputImage.uri }}
                style={styles.imagePreview}
              />
            )}

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={queuePrompt}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Queue Prompt</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.progressButton}
              onPress={() => navigation.navigate('MyQueue', { userId })}
            >
              <Text style={styles.progressText}>See Progress →</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: 16,
    paddingBottom: 100,
    alignItems: 'center',
  },
  headerWrapper: {
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginTop: 6,
  },
  plusButton: {
    padding: 6,
    backgroundColor: '#333',
    borderRadius: 8,
    alignSelf: 'center',
  },
  galleryColumn: {
    maxWidth: 160,
    alignItems: 'center',
  },
  galleryText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 600,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    minHeight: 60,
    color: '#fff',
    marginBottom: 16,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  button: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    maxWidth: 600,
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    resizeMode: 'contain',
  },
  progressButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  progressText: {
    color: '#0af',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
