import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';

const BlockScreen = () => {

  const handleContact=async()=>{
    try {
      await Linking.canOpenURL('mailto:ritikofficial11661@gmail.com')
      await Linking.openURL('mailto:ritikofficial11661@gmail.com')
    } catch (error) {
      Alert.alert('Not able to contact',"Oops! It seems there's no email app set up on your device to handle this request. Please check your device settings and make sure you have an email app installed.")
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/blocked.png')} style={styles.icon} />
      <Text style={styles.title}>Account Blocked</Text>
      <Text style={styles.message}>
        Your account has been blocked due to a violation of our terms of service.
        Please review our policies for further information.
      </Text>
      <Text style={styles.message}>Contact us if you believe you didn't do anything wrong.</Text>
      <TouchableOpacity onPress={() => handleContact()}>
        <Text style={styles.contactButton}>Contact Support</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButton: {
    marginTop:10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    color:'#fff'
}
});

export default BlockScreen;