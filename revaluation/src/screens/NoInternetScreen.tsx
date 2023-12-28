import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { fetch } from '@react-native-community/netinfo';

export const NoInternetScreen = ({navigation}:any) => {

    const handleRetry = async () => {
        try {
            const isConnected = (await fetch()).isConnected;
            if (isConnected)navigation.replace('Home');
            else Alert.alert('No Internet','Please check your internet connection');
        } catch (error) {
            // Handle any errors during the retry process
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ backgroundColor: '#2d2d2d', padding: 20, gap: 20 }}>
                <View style={{ flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
                    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../../assets/info.png')} style={styles.image} alt='info' />
                        <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 20 }}>Connection Timeout!</Text>
                    </View>
                    <Text style={styles.text}>Oops, no internet. Please check you network connection.</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleRetry}>
                    <Image source={require('../../assets/refresh-arrow.png')} style={styles.image} alt='refresh' />
                    <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black'
    },
    text: {
        color: '#f1f0f0',
        fontSize: 16,
        marginBottom: 20
    },
    button: {
        position: 'relative',
        left: 190,
        width: 120,
        height: 50,
        flexDirection: 'row',
        backgroundColor: '#007BFF',
        borderRadius: 8,
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    image: {
        width: 26,
        height: 26
    },
});