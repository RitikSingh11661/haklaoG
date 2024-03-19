import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Button, Alert, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { request, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {updateUserDetailsAction} from '../redux/actions';
import axios from 'axios';
import { mapquestapiKey } from '@env';

const LocationSelectionScreen = () => {
  const user = useSelector((store: any) => store.user);
  const dispatch = useDispatch();
  const initialRegion: Region = { latitude: 20.5937, longitude: 78.9629, latitudeDelta: 12, longitudeDelta: 12 };
  const navigation = useNavigation();
  const [selectedLocation, setSelectedLocation] = React.useState<any>();

  // Memoize the selectedLocation
  // const memoizedSelectedLocation = React.useMemo(() => selectedLocation, [selectedLocation]);

  interface StateCode {name: string;code: string}
  
  const states: StateCode[] = [
    { name: "Andhra Pradesh", code: "AP" },
    { name: "Arunachal Pradesh", code: "AR" },
    { name: "Assam", code: "AS" },
    { name: "Bihar", code: "BR" },
    { name: "Chhattisgarh", code: "CT" },
    { name: "Goa", code: "GA" },
    { name: "Gujarat", code: "GJ" },
    { name: "Haryana", code: "HR" },
    { name: "Himachal Pradesh", code: "HP" },
    { name: "Jharkhand", code: "JH" },
    { name: "Karnataka", code: "KA" },
    { name: "Kerala", code: "KL" },
    { name: "Madhya Pradesh", code: "MP" },
    { name: "Maharashtra", code: "MH" },
    { name: "Manipur", code: "MN" },
    { name: "Meghalaya", code: "ML" },
    { name: "Mizoram", code: "MZ" },
    { name: "Nagaland", code: "NL" },
    { name: "Odisha", code: "OR" },
    { name: "Punjab", code: "PB" },
    { name: "Rajasthan", code: "RJ" },
    { name: "Sikkim", code: "SK" },
    { name: "Tamil Nadu", code: "TN" },
    { name: "Telangana", code: "TS" },
    { name: "Tripura", code: "TR" },
    { name: "Uttar Pradesh", code: "UP" },
    { name: "Uttarakhand", code: "UT" },
    { name: "West Bengal", code: "WB" },
    // Union Territories (optional)
    { name: "Andaman and Nicobar Islands", code: "AN" },
    { name: "Chandigarh", code: "CH" },
    { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DD" },
    { name: "Delhi", code: "DL" },
    { name: "Jammu and Kashmir", code: "JK" },
    { name: "Ladakh", code: "LA" },
    { name: "Lakshadweep", code: "LD" },
    { name: "Puducherry", code: "PY" },
  ];

  const getStateNameFromCode=(code: string):string|undefined=>{
    return states.find(state=>state.code===code)?.name;
  }

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const selectedRegion: Region = { latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
    setSelectedLocation(selectedRegion);
  };

  const handleSaveLocation = async () => {
    const { latitude: lat, longitude: long } = selectedLocation;
    axios.get(`https://www.mapquestapi.com/geocoding/v1/reverse?key=${mapquestapiKey}&location=${lat},${long}&includeRoadMetadata=true`).then((res) => {
      const { adminArea3: state, adminArea1: country } = res?.data?.results?.[0]?.locations[0];
      axios.get(`https://www.mapquestapi.com/geocoding/v1/address?key=${mapquestapiKey}&location=${state},${country}`).then(async (res2) => {
        const latLng = res2.data?.results?.[0]?.locations[0]?.latLng;
        const locObj = { latitude: latLng?.lat, longitude: latLng?.lng,state:getStateNameFromCode(state), country, timestamp: Date.now() };
        const { location } = user;
        location.push(locObj);
        const data = await updateUserDetailsAction(user._id, { location }, dispatch);
        Alert.alert('Location Updated', data.msg);
        navigation.goBack();
      })
    }).catch((err) => {
       Alert.alert('Location Updated failed','Sorry we are unable to update your location, please contact us regarding this failure');  
    });
  };

  const handleShowCurrentLocation = async () => {
    try {
      const result = await request(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );
      if (result === 'granted') {
        Geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          const currentLocation: Region = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
          setSelectedLocation(currentLocation);
        },
          (error) => { console.log('Error getting current location:', error.code, error.message) },
          { enableHighAccuracy: true }
        );
      } else {
        console.log('Permission denied')
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const isDefaultLocation = async () => {
    if (user?.location?.length > 0) {
      const { latitude, longitude }: any = user.location[user.location.length - 1];
      setSelectedLocation({ ...initialRegion, latitude, longitude });
    }
  }

  React.useEffect(() => {
    isDefaultLocation()
  }, [])

  return (
    <View style={styles.container}>
      <MapView style={styles.map} onPress={handleMapPress} initialRegion={initialRegion}>
        {selectedLocation && (<Marker coordinate={selectedLocation} />)}
      </MapView>
      {selectedLocation &&
        <TouchableOpacity style={styles.button} onPress={handleSaveLocation}>
          <Text style={styles.buttonText}>Save Location</Text>
        </TouchableOpacity>
      }
      <Button title="Show Current Location" onPress={handleShowCurrentLocation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LocationSelectionScreen;