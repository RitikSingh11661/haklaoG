import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { getUsersDetailsAction } from '../redux/actions';

const MapScreen = () => {
  const user = useSelector((store: any) => store.user);
  const users = useSelector((store: any) => store.users);
  const loading = useSelector((store: any) => store.loading);
  const dispatch = useDispatch();
  const initialRegion: Region = { latitude: 20.5937, longitude: 78.9629, latitudeDelta: 12, longitudeDelta: 12 };
  const [markers, setMarkers] = useState<any>([]);

  const renderUserMarker = async (userObj: any) => {
    const location = userObj?.location;
    if (location?.length > 0) {
      const lastLocation = location[location?.length - 1];
      let latitude = lastLocation?.latitude, longitude = lastLocation?.longitude
      const ownMarker = userObj?._id === user._id;
      return <Marker key={userObj?._id} title={userObj.name} pinColor={ownMarker ? 'green' : 'red'} coordinate={{ latitude, longitude }} />;
    }
  }

  const getUpdatedUsers=async()=>{
    try {
      await getUsersDetailsAction(dispatch);
      const userMarkers = users.map((userObj: any) => renderUserMarker(userObj));
      Promise.all(userMarkers).then(markers => setMarkers(markers));
    } catch (error) {
      Alert.alert('Unable to get locations','There is an error, please try again later or contact us')
    }
  }

  useEffect(() => {
   getUpdatedUsers();
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {markers.map((marker: any) => marker)}
      </MapView>
      <Spinner visible={loading} textContent={'Loading...'} textStyle={{ color: '#FFF' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  locationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  popupContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  popupText: {
    fontSize: 16,
    marginBottom: 10,
  },
  popupButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    marginBottom: 5
  },
  popupButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
})

export default MapScreen;