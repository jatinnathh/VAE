// Gallery.jsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ipConfig from '../ip.json';

const { width } = Dimensions.get('window');
const ITEM_GAP = 16;
const NUM_COLUMNS = width > 700 ? 3 : 2;
const ITEM_SIZE = (width - (ITEM_GAP * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

export default function Gallery() {
  const route = useRoute();
  const userId = route.params?.userId;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const backendURL = `http://${ipConfig.ip}:8000`;

  const fetchUserImages = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${backendURL}/user-images/${userId}`);
      const data = await res.json();
      setImages(data || []);
    } catch (err) {
      console.error('[Fetch Error]', err);
      Alert.alert('Error', 'Failed to fetch user images.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserImages();
    }, [userId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserImages();
  };

  const handleDownloadToGallery = async (uri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Cannot save to gallery without permission.');
        return;
      }

      const filename = uri.split('/').pop();
      const downloadRes = await FileSystem.downloadAsync(
        uri,
        FileSystem.documentDirectory + filename
      );

      const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
      await MediaLibrary.createAlbumAsync('Generated Images', asset, false);
      Alert.alert('Saved', 'Image saved to your gallery.');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to save image to gallery.');

    }
  };

  const renderItem = ({ item }) => {
    let filename = item.image_url;

  // If a full URL was accidentally saved, extract just the filename
  if (filename.startsWith('http')) {
    const parts = filename.split('/');
    filename = parts[parts.length - 1];
  }

  const uri = `${backendURL}/saved_images/${filename}`;

    return (
      <View style={styles.itemWrapper}>
        <Image source={{ uri }} style={styles.image} />
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() => handleDownloadToGallery(uri)}
        >
          <Feather name="download" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#000']} style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Generated Images</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            numColumns={NUM_COLUMNS}
            columnWrapperStyle={{ gap: ITEM_GAP, marginBottom: ITEM_GAP }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.grid}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 8,
    ...(Platform.OS === 'web' && {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: '#1a1a1a',
    }),
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  grid: {
    paddingBottom: 60,
    gap: ITEM_GAP,
  },
  itemWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  downloadBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    }),
  },
});
