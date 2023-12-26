import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { loginAction } from '../redux/actions';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import {webClientId} from '@env';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
const LoginScreen = ({ navigation }: LoginProps) => {
  const loading = useSelector((store: any) => store.loading);
  const dispatch = useDispatch();

  const handleGoogleAuth = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      await GoogleSignin.signOut();
      const data = await loginAction({ email: userInfo?.user?.email }, dispatch);
      navigation.replace(data?.verified ? 'Home' : 'VerificationPending');
    } catch (error: any) {
      Alert.alert('Error', error?.msg ? error.msg : error.message);
    }
  }

  React.useEffect(() => {
    GoogleSignin.configure({ webClientId, offlineAccess: true });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Haklao G, its nice to see you</Text>
      <GoogleSigninButton style={styles.googleButton} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={() => handleGoogleAuth()} />
      <View>
        <Text style={styles.subTitle}>Don't worry, we will never user your data withiout your permission</Text>
        <Text style={styles.subTitle}>By continuing, you agree to Haklao G Terms of service & Pricacy Policy</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.replace('Register')}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
      <Spinner visible={loading} textContent={'Loading...'} textStyle={{ color: '#FFF' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    gap: 60
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  subTitle: {
    marginBottom: 16,
    textAlign: 'center'
  },
  googleButton: {
    marginTop: 50,
    width: 240,
    height: 55
  },
  registerText: {
    color: '#007bff',
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});


export default LoginScreen;