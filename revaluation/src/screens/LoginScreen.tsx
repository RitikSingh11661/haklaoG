import React from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { loginAction } from '../redux/actions';
import {GoogleSignin,GoogleSigninButton} from '@react-native-google-signin/google-signin';
import { API_KEY } from '@env';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
const LoginScreen = ({ navigation }: LoginProps) => {
  const loading = useSelector((store: any) => store.loading);
  const dispatch = useDispatch();
  const formRef = React.useRef({ email: '', password: '' });

  GoogleSignin.configure({webClientId:API_KEY});

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(formRef.current.email);
    if(!isEmailValid)return Alert.alert('Invalid email','Please enter email in valid format');
    if(!formRef.current.password)return Alert.alert('Invalid Password','Please enter valid password');
    try {
      const data = await loginAction(formRef.current, dispatch);
      if (data?.verified) navigation.replace('Home');
      else navigation.replace('VerificationPending');
    } catch (error: any) {
      console.log('error while login', error);
      Alert.alert('Error', error.msg)
    }
  };

  const handleGoogleAuth=async()=>{
    try {
      await GoogleSignin.hasPlayServices();
      // const userInfo = await GoogleSignin.signIn();
      // console.log('userInfo',userInfo) Getting 'DEVELOPER_ERROR'
    } catch (error:any) {
      console.log('error',error)
  }
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput keyboardType='email-address' inputMode='email' autoCapitalize='none' style={styles.input} placeholder="Email" onChangeText={(e: any) => formRef.current.email = e} />
      <TextInput style={styles.input} placeholder="Password" autoCapitalize='none' secureTextEntry onChangeText={(e: any) => formRef.current.password = e} />
      {/* <GoogleSigninButton style={{ width: 192, height: 48 }} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={()=>handleGoogleAuth()}/> */}
      <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerText: {
    color: '#007bff',
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});

export default LoginScreen;