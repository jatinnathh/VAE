// MyQueue.jsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ipConfig from '../ip.json';

const { width } = Dimensions.get('window');

export default function MyQueue({ navigation, route }) {
  const userId = route?.params?.userId;
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressMap, setProgressMap] = useState({});

  const fetchQueue = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://${ipConfig.ip}:8000/user-queue/${userId}`);
      const data = await res.json();
      setQueueItems(data);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProgress = async () => {
    const newProgress = {};
    await Promise.all(
      queueItems.map(async (item) => {
        if (item.status === 'processing') {
          try {
            const res = await fetch(`http://${ipConfig.ip}:8000/progress/${item.id}`);
            const data = await res.json();
            newProgress[item.id] = data;
          } catch (err) {
            console.warn('Progress error for id', item.id);
          }
        }
      })
    );
    setProgressMap(newProgress);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (queueItems.length === 0) return;
    const interval = setInterval(fetchProgress, 1000);
    return () => clearInterval(interval);
  }, [queueItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQueue();
    fetchProgress();
  };

  const handleRemovePrompt = async (queueId) => {
    try {
      const res = await fetch(`http://${ipConfig.ip}:8000/queue-item/${queueId}`, { method: 'DELETE' });
      if (res.ok) {
        Alert.alert('Removed', 'Prompt removed from queue');
        fetchQueue();
      } else {
        const errData = await res.json();
        Alert.alert('Error', errData.detail || 'Failed to remove prompt');
      }
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', 'Failed to remove prompt');
    }
  };

  const handleCancelPrompt = async (queueId) => {
    try {
      const res = await fetch(`http://${ipConfig.ip}:8000/cancel/${queueId}`, { method: 'POST' });
      if (res.ok) {
        Alert.alert('Cancelled', 'Prompt cancelled during generation');
        fetchQueue();
      } else {
        const errData = await res.json();
        Alert.alert('Error', errData.detail || 'Failed to cancel');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      Alert.alert('Error', 'Failed to cancel prompt');
    }
  };

  const confirmClearQueue = () => {
    Alert.alert(
      'Clear Queue',
      'Are you sure you want to clear your entire queue?',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Yes', onPress: handleClearQueue }],
      { cancelable: true }
    );
  };

  const handleClearQueue = async () => {
    try {
      const res = await fetch(`http://${ipConfig.ip}:8000/clear-queue/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        Alert.alert('Cleared', 'Your queue has been cleared.');
        fetchQueue();
      } else {
        const errData = await res.json();
        Alert.alert('Error', errData.detail || 'Failed to clear queue');
      }
    } catch (err) {
      console.error('Clear queue error:', err);
      Alert.alert('Error', 'Could not clear the queue.');
    }
  };

  const formatSeconds = (totalSeconds) => {
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds)) return '...';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderQueueItem = (item) => {
    const progress = progressMap[item.id];
    const percent = progress?.percent || 0;
    const eta = formatSeconds(progress?.eta);
    const time = formatSeconds(progress?.time_taken);

    return (
      <View key={item.id} style={styles.card}>
        {item.status === 'processing' && (
          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
          </View>
        )}
        <View style={styles.promptSection}>
          <Text style={styles.prompt}>{item.prompt}</Text>
          {item.status === 'processing' && (
            <Text style={styles.progressText}>{percent}% | ETA: {eta} | Time: {time}s</Text>
          )}
        </View>

        <Text style={[styles.status,
        item.status === 'done' ? styles.green :
          item.status === 'cancelled' ? styles.red : styles.orange
        ]}>
          {item.status.toUpperCase()}
        </Text>

        {item.image_url && (
          <Image
            source={{
              uri: item.image_url.startsWith('http')
                ? item.image_url
                : `http://${ipConfig.ip}:8000/saved_images/${item.image_url}`
            }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {(item.status === 'queued' || item.status === 'cancelled') && (
          <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemovePrompt(item.id)}>
            <Text style={styles.removeText}>
              {item.status === 'queued' ? 'Remove' : 'Remove Cancelled'}
            </Text>
          </TouchableOpacity>
        )}

        {item.status === 'processing' && (
          <TouchableOpacity style={styles.removeBtn} onPress={() => handleCancelPrompt(item.id)}>
            <Text style={styles.removeText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#000']} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>My Queue & History</Text>

        <TouchableOpacity onPress={confirmClearQueue} style={styles.clearQueueBtn}>
          <Ionicons name="trash" size={22} color="#f55" />
          <Text style={styles.clearQueueText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        ) : queueItems.length > 0 ? (
          queueItems.map(renderQueueItem)
        ) : (
          <Text style={styles.empty}>Your queue is empty. Start generating something!</Text>
        )}

        <TouchableOpacity
          style={styles.navButtonWrapper}
          onPress={() => navigation.navigate('MainTabs', { userId })}
        >
          <Text style={styles.navButton}>Go to Generate</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 24,
    backgroundColor: '#111',
    ...(Platform.OS === 'web' && { position: 'sticky', top: 0, zIndex: 999 }),
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  clearQueueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  clearQueueText: {
    color: '#f55',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  promptSection: {
    marginBottom: 8,
  },
  prompt: {
    color: '#fff',
    fontSize: 17,
    marginBottom: 8,
  },
  progressText: {
    color: '#0af',
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  green: {
    color: '#4CAF50',
  },
  orange: {
    color: '#FFA500',
  },
  red: {
    color: '#ff4444',
  },
  image: {
    width: '100%',
    aspectRatio: 1, // or 4/3 if your images are wider
    borderRadius: 10,
    marginBottom: 6,
    resizeMode: 'contain', // or 'cover' if preferred
  },
  progressBarWrapper: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#0af',
  },
  removeBtn: {
    marginTop: 12,
    backgroundColor: '#aa3333',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  empty: {
    color: '#888',
    fontSize: 18,
    marginTop: 40,
    textAlign: 'center',
  },
  navButtonWrapper: {
    marginTop: 40,
    alignItems: 'center',
  },
  navButton: {
    color: '#0af',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
