import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { signupAction } from '../redux/actions';
import { useDispatch } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { launchCamera } from 'react-native-image-picker';
import { accessKeyId, secretAccessKey, region, bucketName } from '@env';
import AWS from 'aws-sdk';
import { readFile } from 'react-native-fs';
import uuid from 'react-native-uuid';
import { toByteArray } from 'base64-js';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { webClientId } from '@env';

type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: RegisterProps) => {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const [videoLoading, setVideoLoading] = React.useState(false);
  const formRef = React.useRef({ name: '', email: '', phone: '', kycVideo: '' });
  const [isVerified, setIsVerified] = React.useState(false);

  const credential = { accessKeyId, secretAccessKey, region, signatureVersion: "v4" }
  const s3 = new AWS.S3(credential);

  const handleRegister = async () => {
    if (!formRef.current.name || !formRef.current.phone)return Alert.alert('Error', 'Please fill your Name & Phone No. filled');
    if (formRef.current.phone.length<10)return Alert.alert('Invalid Phone Number', 'Please enter a valid 10 digits phone no.');
    if (!formRef.current.kycVideo)return Alert.alert('Introduction Video', 'Please record your introduction video');
    if(!formRef.current.email)return Alert.alert('Verify Email', 'Please verify your email by Google');
    setLoading(true);
    try {
      const data = await signupAction(formRef.current, dispatch);
      await AsyncStorage.setItem('token', data?.token);
      setLoading(false);
      navigation.replace('VerificationPending');
    } catch (error: any) {
      setLoading(false);
      Alert.alert(error, error?.msg ? error.msg : error.message);
    }
  };

  const handleCaptureVideo = async () => {
    try {
      const video: any = await launchCamera({ mediaType: 'video', durationLimit: 120, cameraType: 'front', formatAsMp4: true });
      if (!video?.didCancel) {
        const filename = `${uuid.v4()}-kycVideo.mp4`;
        setVideoLoading(true);
        const arrayBuffer = toByteArray(await readFile(video?.assets[0]?.uri, 'base64'));
        const params = { Bucket: bucketName, Key: filename, Body: arrayBuffer, ContentType: 'video/mp4' };
        const { Location } = await s3.upload(params).promise();
        formRef.current.kycVideo = Location;
      }
      setVideoLoading(false);
    } catch (error: any) {
      Alert.alert('Error while capturing video', error.message)
      setVideoLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      formRef.current.email = userInfo?.user?.email;
      setIsVerified(true);
      await GoogleSignin.signOut();
    } catch (error: any) {
      console.log('error', error)
      Alert.alert('Error', error?.msg ? error.msg : error.message);
    }
  }

  React.useEffect(() => {
    GoogleSignin.configure({ webClientId, offlineAccess: true });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Name" onChangeText={e => formRef.current.name = e} />
      <TextInput keyboardType='number-pad' style={styles.input} placeholder="Phone No." onChangeText={e => formRef.current.phone = e} />
      <View style={styles.videoVerification}>
        <Text style={styles.verificationText}>Video Verification Required</Text>
        <TouchableOpacity style={styles.captureButton} onPress={handleCaptureVideo}>
          <Text style={styles.captureButtonText}>{formRef.current.kycVideo ? 'Video Uploaded' : 'Start Recording'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.googleAuthContainer}>
        <TouchableOpacity onPress={() => handleGoogleAuth()} style={styles.googleButtonContainer}>
          <GoogleSigninButton style={styles.googleButton} size={GoogleSigninButton.Size.Icon} />
          <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>Verify Email By Google</Text>
        </TouchableOpacity>
        {isVerified && <Image source={require('../../assets/verifiedIcon.png')} style={styles.verifiedIcon} />}
      </View>
      <TouchableOpacity style={styles.buttonContainer} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
      <Spinner visible={videoLoading} textContent={'Uploading verficiation video...'} textStyle={{ color: '#FFF' }} />
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
  loginText: {
    color: '#007bff',
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  captureButton: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    padding: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  videoVerification: {
    padding: 16,
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  verificationText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  googleAuthContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonContainer: {
    width: 170,
    backgroundColor: '#007bff',
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleButton: {
    width: 40,
    height: 40
  },
  verifiedIcon: {
    width: 27,
    height: 27,
  }
});

export default RegisterScreen;