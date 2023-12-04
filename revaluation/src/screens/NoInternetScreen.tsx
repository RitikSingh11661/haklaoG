import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export const NoInternetScreen = () => {
    const [retrying, setRetrying] = React.useState(false)
    const handleRetry = async () => {
        // Prevent multiple retry attempts while the current retry is ongoing
        if (retrying) {
            return;
        }

        // Show a loading indicator during the retry attempt
        setRetrying(true);

        // try {
        //     // Attempt to re-establish the network connection, e.g., by checking the network status
        //     // If the network connection is restored, you can navigate the user to the main part of the app.
        //     const isConnected = await checkNetworkConnection(); // Implement this function

        //     if (isConnected) {
        //         // Successfully reconnected, navigate to your main app screen
        //         // Example: navigation.navigate('MainScreen');
        //     } else {
        //         // Network connection is still not available
        //         // You can show an error message or take other actions based on your app's requirements.
        //     }
        // } catch (error) {
        //     // Handle any errors that may occur during the retry attempt
        //     // You can show an error message or take other actions as needed.
        // } finally {
        //     // Reset the retrying state to allow future retry attempts
        //     setRetrying(false);
        // }
    };

    const checkNetworkConnection = () => {
        // Implement your network connectivity check here
        // You can use a library like NetInfo or make an API request to check the connection status.
        // Return true if the connection is available, otherwise, return false.
    }

    return (
        <View style={styles.container}>
            <View style={{backgroundColor:'#2d2d2d',padding:20,gap:20}}>
            <View style={{flexDirection:'column',justifyContent:'center',gap:20}}>
                <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../../assets/info.png')} style={styles.image} alt='info' />
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 20 }}>Connection Timeout!</Text>
                </View>
                <Text style={styles.text}>Oops, no internet. Please check you network connection.</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRetry} disabled={retrying}>
                <Image source={require('../../assets/refresh-arrow.png')} style={styles.image} alt='refresh' />
                <Text style={styles.buttonText}>{retrying ? 'Retrying...' : 'Retry'}</Text>
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
        position:'relative',
        left: 190,
        width:120,
        height:50,
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