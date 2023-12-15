import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { getTokenAction, getUserDetailsAction, getUsersDetailsAction } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({navigation}:HomeProps) => {
  const user = useSelector((store: any) => store.user);
  const users = useSelector((store: any) => store.users);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const need = async () => {
      const t = await AsyncStorage.getItem('token');
      getTokenAction(t, dispatch);
      if (!t) return navigation.replace('Login');
      else {
        if (!user) getUserDetailsAction(dispatch).then((data) => {
          AsyncStorage.setItem('user', JSON.stringify(data))
          if(!data?.verified) return navigation.replace('VerificationPending');
        }).catch((err) =>Alert.alert(err.message,'No internet connection, Check your internet'));;
        if (!users) getUsersDetailsAction(dispatch).then(data => AsyncStorage.setItem('users', JSON.stringify(data)));
        if(user && !user?.verified) return navigation.replace('VerificationPending');
      }
    }
    need();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to "HaklaoG" the Stammer Community App</Text>
      <Text style={styles.subtitle}>Connect with other stammering users and do practice to manage your stammering.</Text>
      <Text style={styles.subtitle2}>Remeber its your way to speak not an issue.</Text>
      <Image style={styles.image} source={require('../../assets/logo.png')} alt='logo'/>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Practice')}>
        <Text style={styles.buttonText}>Start Practice</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  subtitle2: {
    fontSize:18,
    marginBottom: 32,
    color:'#d764e9'
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image:{
    height:180,
    marginBottom:20
  }
});

export default HomeScreen;