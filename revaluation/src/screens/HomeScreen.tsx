import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { getTokenAction, getUserDetailsAction, getUsersDetailsAction, updateUserDetailsAction } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }:HomeProps) => {
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
        });
        if (!users) getUsersDetailsAction(dispatch).then(data => AsyncStorage.setItem('users', JSON.stringify(data)));
        // console.log('user',user)
        if(user && !user?.verified) return navigation.replace('VerificationPending');
      }
    }
    need();
    // return () => {updateUserDetailsAction(user?._id,{ availableForCall: false},dispatch)}
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Stammer Community App</Text>
      <Text style={styles.subtitle}>Connect with other stammering users and explore various features</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PhoneCall')}>
        <Text style={styles.buttonText}>Initiate Phone Call</Text>
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
});

export default HomeScreen;