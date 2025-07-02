import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Platform,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ipConfig from '../ip.json';

const { width } = Dimensions.get('window');

export default function AdminDashboard({ navigation }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [userImages, setUserImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const backendUrl = `http://${ipConfig.ip}:8000`;

    const fetchUsers = () => {
        setLoading(true);
        fetch(`${backendUrl}/users`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUsers(data);
                else setUsers([]);
            })
            .catch(() => setUsers([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const loadUserDetails = async (userId) => {
        setLoading(true);
        try {
            const [infoRes, imagesRes] = await Promise.all([
                fetch(`${backendUrl}/user-info/${userId}`),
                fetch(`${backendUrl}/user-images/${userId}`),
            ]);
            if (!infoRes.ok || !imagesRes.ok) throw new Error();
            const info = await infoRes.json();
            const images = await imagesRes.json();
            setUserInfo(info);
            setUserImages(images);
            setSelectedUser(userId);
        } catch {
            Alert.alert('Error', 'Failed to load user details.');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = (userId) => {
        Alert.alert("Delete User", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const res = await fetch(`${backendUrl}/users/${userId}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error();
                        Alert.alert('Deleted', 'User removed.');
                        setSelectedUser(null);
                        setUserInfo(null);
                        setUserImages([]);
                        fetchUsers();
                    } catch {
                        Alert.alert('Error', 'Failed to delete user.');
                    }
                }
            }
        ]);
    };

    const deleteImage = (imageId) => {
        Alert.alert("Delete Image", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const res = await fetch(`${backendUrl}/images/${imageId}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error();
                        Alert.alert('Deleted', 'Image removed.');
                        if (selectedUser) loadUserDetails(selectedUser);
                    } catch {
                        Alert.alert('Error', 'Failed to delete image.');
                    }
                }
            }
        ]);
    };

    const renderUserList = () => (
        <>
            <Text style={styles.title}>All Users</Text>
            {users.length === 0 ? (
                <Text style={styles.subText}>No users found.</Text>
            ) : (
                users.map(user => (
                    <TouchableOpacity
                        key={user.id}
                        style={styles.userCard}
                        onPress={() => loadUserDetails(user.id)}
                    >
                        <Text style={styles.username}>{user.username}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                ))
            )}
        </>
    );

    const renderUserDetails = () => (
        <>
            <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.backIcon}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.userHeader}>
                <Text style={styles.title}>User: {userInfo?.username}</Text>
                <TouchableOpacity onPress={() => deleteUser(selectedUser)} style={styles.deleteUserButton}>
                    <Ionicons name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <Text style={styles.subText}>Email: {userInfo?.email}</Text>
            <Text style={styles.subText}>Joined: {new Date(userInfo?.created_at).toLocaleDateString()}</Text>
            <Text style={styles.subText}>Total Images: {userInfo?.total_images}</Text>

            <Text style={[styles.title, { marginTop: 24 }]}>Generated Images</Text>
            {userImages.length > 0 ? userImages.map(item => (
                <View key={item.id} style={styles.card}>
                    <Text style={styles.prompt}>{item.prompt}</Text>
                    <Image
                        source={{
                            uri: item.image_url.startsWith('http')
                                ? item.image_url
                                : `${backendUrl}/saved_images/${item.image_url}`
                        }}
                        style={styles.image}
                    />

                    <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => deleteImage(item.id)} style={styles.deleteImageButton}>
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                        <Text style={styles.deleteImageText}>Delete Image</Text>
                    </TouchableOpacity>
                </View>
            )) : (
                <Text style={styles.subText}>No images found.</Text>
            )}
        </>
    );

    return (
        <LinearGradient colors={['#111', '#000']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.wrapper}>
                    <TouchableOpacity
                        onPress={() => navigation.replace('Login')}
                        style={styles.backToLoginButton}
                    >
                        <Ionicons name="exit-outline" size={20} color="#fff" />
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </TouchableOpacity>

                    {loading ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : selectedUser ? renderUserDetails() : renderUserList()}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: {
        paddingVertical: 50,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        aspectRatio: 1, // or 4/3 if your images are wider
        borderRadius: 10,
        marginBottom: 6,
        resizeMode: 'contain', // or 'cover' if preferred
    },

    wrapper: {
        width: '100%',
        maxWidth: 800,
    },
    backToLoginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    backToLoginText: {
        color: '#fff',
        marginLeft: 6,
        fontWeight: '600',
        fontSize: 16,
    },
    backIcon: { marginBottom: 20 },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    subText: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 4,
    },
    userCard: {
        backgroundColor: '#1c1c1c',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#333',
    },
    username: {
        color: '#fff',
        fontSize: 16,
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    deleteUserButton: {
        backgroundColor: '#b22222',
        padding: 8,
        borderRadius: 8,
    },
    card: {
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    prompt: {
        color: '#fff',
        fontSize: 15,
        marginBottom: 8,
    },

    timestamp: {
        color: '#888',
        fontSize: 12,
        textAlign: 'right',
        marginBottom: 6,
    },
    deleteImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#b22222',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    deleteImageText: {
        color: '#fff',
        marginLeft: 4,
        fontWeight: '600',
    },
});
