import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
import { decode } from 'base64-arraybuffer';
import uuid from 'react-native-uuid';

type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: RegisterProps) => {
  // const loading = useSelector((store: any) => store.loading);
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const [videoLoading, setVideoLoading] = React.useState(false);
  const formRef = React.useRef({ name: '', email: '', password: '', phone: '', kycVideo: '' });
  const [showPassword, setShowPassword] = React.useState(false);

  const credential = { accessKeyId, secretAccessKey, region, signatureVersion: "v4" }
  const s3 = new AWS.S3(credential);

  const handleRegister = async () => {
    if (!formRef.current.name && !formRef.current.email && !formRef.current.password && !formRef.current.phone) {
      return Alert.alert('Error', 'Please fill every filled');
    }
    if (!formRef.current.kycVideo) return Alert.alert('Error', 'Please record your introduction video');
    setLoading(true);
    try {
      const data = await signupAction(formRef.current, dispatch);
      await AsyncStorage.setItem('token', data?.token);
      setLoading(false);
      navigation.replace('VerificationPending');
    } catch (error: any) {
      setLoading(false);
      Alert.alert(error?.message, 'Please enter valid email or password')
    }
  };

  const handleCaptureVideo = async () => {
    try {
      const video: any = await launchCamera({ mediaType: 'video', durationLimit: 5, cameraType: 'front' });
      if (!video?.didCancel) {
        const filename = `${uuid.v4()}-kycVideo.mp4`;
        setVideoLoading(true);
        await readFile(video?.assets[0]?.uri, 'base64').then(async (res) => {
          const arrayBuffer = decode(res);
          const params = { Bucket: bucketName, Key: filename, Body: arrayBuffer, ContentType: 'video/mp4' };
          const { Location } = await s3.upload(params).promise();
          formRef.current.kycVideo = Location;
        })
      }
      setVideoLoading(false);
    } catch (error) {
      // console.error('Error capturing video:', error);
      setVideoLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Name" onChangeText={e => formRef.current.name = e} />
      <TextInput style={styles.input} placeholder="Email" onChangeText={e => formRef.current.email = e} />
      <TextInput keyboardType='number-pad' style={styles.input} placeholder="Phone No." onChangeText={e => formRef.current.phone = e} />
      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="Password" secureTextEntry={!showPassword} onChangeText={e => formRef.current.password = e} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.videoVerification}>
        <Text style={styles.verificationText}>Video Verification Required</Text>
        <TouchableOpacity style={styles.captureButton} onPress={handleCaptureVideo}>
          <Text style={styles.captureButtonText}>{formRef.current.kycVideo ? 'Video Uploaded' : 'Start Recording'}</Text>
        </TouchableOpacity>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  passwordInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  toggleText: {
    fontSize: 14,
    color: '#007bff',
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
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
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
  }
});

export default RegisterScreen;