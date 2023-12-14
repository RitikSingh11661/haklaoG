import React, { useState } from 'react';
import { Image, Switch, Alert, Text, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import { useDispatch, useSelector } from 'react-redux';
import { getNetworkStatusAction, updateUserDetailsAction } from './src/redux/actions';
import { NavigationContainer } from '@react-navigation/native';
import NearByPeopleScreen from './src/screens/NearByPeopleScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LocationSelectionScreen from './src/screens/LocationSelectionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LocationPermissionScreen from './src/screens/LocationPermissionScreen';
import UserProfileScreen from './src/screens/UserProfileSceen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import { RootStackParamList } from './src/types';
import VideoCallScreen from './src/screens/VideoCallScreen';
import { PhoneCallScreen } from './src/screens/PhoneCallScreen';
import NetInfo from '@react-native-community/netinfo';
import { NoInternetScreen } from './src/screens/NoInternetScreen';
import VerificationPendingScreen from './src/screens/VerificationPendingScreen';

const App = () => {
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const user = useSelector((store: any) => store.user);
  const dispatch = useDispatch();
  const [isEnabledCall, setIsEnabledCall] = useState<boolean>(user?.availableForCall||false);
  const [isConnected, setIsConnected] = React.useState<any>(true);

  // console.log('user?.availableForCall',user?.availableForCall)

  const toggleSwitch = async() => {
    try {
      await updateUserDetailsAction(user?._id, { availableForCall: !isEnabledCall }, dispatch);
      Alert.alert('Status updated successfully',`Hi ${user.name} , you are now ${user?.availableForCall?'Online':'Offline'}!`)
      setIsEnabledCall(!isEnabledCall);
    } catch (err:any) {
      Alert.alert(err.message,'No internet connection, Check your internet')
    }
  }

  // Define custom icons for each tab
  const getTabBarIcon = (route: any, focused: any) => {
    let iconName = '';

    if (route.name === 'TabHome') {
      iconName = focused ? 'https://i.ibb.co/p4yQt4t/home.png' : 'https://i.ibb.co/bWzq4W9/home-1.png';
    } else if (route.name === 'NearByPeople') {
      iconName = focused ? 'https://i.ibb.co/zn93wPc/group-users-1.png' : 'https://i.ibb.co/y4Rvjgg/group-users.png';
    } else if (route.name === 'PhoneCall') {
      iconName = focused ? 'https://i.ibb.co/BcWhPVR/phone-call-1.png' : 'https://i.ibb.co/mTcZC3L/phone-call.png';
    } else if (route.name === 'Settings') {
      iconName = focused ? 'https://i.ibb.co/Rv54Zqb/settings2.png' : 'https://i.ibb.co/jRjJRBF/settings.png';
    }

    // You can return an Image component with the appropriate icon source
    return <Image source={{ uri: iconName }} alt='tab nav icons' style={{ width: 30, height: 30 }} />;
  };

  const HeaderRightSwitch = () => (
    <View>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor='#f4f3f4'
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabledCall}
        style={{ marginRight: 10, width: 45 }}
      />
      <Text>{isEnabledCall?'Online':'Offline'}</Text>
    </View>
  );

  const TabNavigator = () => (
    <Tab.Navigator screenOptions={({route})=>({tabBarIcon:({focused})=>getTabBarIcon(route, focused)})}>
      <Tab.Screen name="TabHome" options={{ headerTitle: 'Home', headerTitleStyle: { fontWeight: 'bold' }, headerRight: () => HeaderRightSwitch() }} component={HomeScreen} />
      <Tab.Screen name="PhoneCall" options={{ headerTitle: 'Phone Call', headerTitleStyle: { fontWeight: 'bold' }, headerRight: () => HeaderRightSwitch() }} component={PhoneCallScreen} />
      <Tab.Screen name="NearByPeople" options={{ headerTitle: 'Near By People', headerTitleStyle: { fontWeight: 'bold' }, headerRight: () => HeaderRightSwitch() }} component={NearByPeopleScreen} />
      <Tab.Screen name="Settings" options={{ headerTitle: 'Profile', headerTitleStyle: { fontWeight: 'bold' }, headerRight: () => HeaderRightSwitch() }} component={ProfileScreen} />
    </Tab.Navigator>
  );

  React.useEffect(() => {
    const subscribe = NetInfo.addEventListener((state) => {
      // {"details": {}, "isConnected": false, "isInternetReachable": false, "isWifiEnabled": false, "type": "none"}
      // {"details": {"bssid": "02:00:00:00:00:00", "frequency": 2462, "ipAddress": "192.168.0.102", "isConnectionExpensive": false, "linkSpeed": 135, "rxLinkSpeed": -1, "strength": 92, "subnet": "255.255.255.0", "txLinkSpeed": 135}, "isConnected": true, "isInternetReachable": true, "isWifiEnabled": true, "type": "wifi"}
      const status = state.isConnected;
      if (status) {
        getNetworkStatusAction(status, dispatch);
        setIsConnected(status);
      }
    });

    subscribe();
    // return () => { updateUserDetailsAction(user?._id, { availableForCall: false }, dispatch); }
  }, []);

  React.useEffect(()=>{
    setIsEnabledCall(user?.availableForCall);
  },[user?.availableForCall])

  if (!isConnected) return <NoInternetScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" options={{ headerShown: false }} component={TabNavigator} />
        <Stack.Screen name="Profile" options={{ headerShown: false }} component={ProfileScreen} />
        <Stack.Screen name="UserProfile" options={{ headerShown: false }} component={UserProfileScreen} />
        <Stack.Screen name="VideoCall" options={{ headerShown: false }} component={VideoCallScreen} />
        <Stack.Screen name="PhoneCall" options={{ headerShown: false }} component={PhoneCallScreen} />
        <Stack.Screen name="LocationSelection" options={{ headerTitle: 'Select Location' }} component={LocationSelectionScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="LocationPermission" options={{ headerShown: false }} component={LocationPermissionScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;