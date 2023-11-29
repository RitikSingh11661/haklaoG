import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { getUserDetailsAction } from '../redux/actions';

const VerificationPendingScreen = ({navigation}:any) => {
    const dispatch = useDispatch();

    React.useEffect(()=>{
        getUserDetailsAction(dispatch).then(async(res)=>{
            if(res?.verfied)return navigation.replace('Home');
        })
    },[]);

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.heading}>Account Created Successfully!</Text>
            <Text style={styles.message}>Thank you for registering. Your introduction video is under verification.</Text>
            <Text style={styles.message}>Once verified, you will be able to access all features of the app.</Text>
            <Text style={styles.message}>We appreciate your patience.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff', // Adjust background color
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        color: '#555',
    },
});

export default VerificationPendingScreen;
