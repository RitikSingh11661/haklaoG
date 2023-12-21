import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import axios from 'axios';
import { url } from '@env';
import { useDispatch, useSelector } from 'react-redux';
import {getUserDetailsAction, loadingRequestAction } from '../redux/actions';
import Spinner from 'react-native-loading-spinner-overlay';

const LocationPermissionScreen = () => {
  const token = useSelector((store: any) => store.token);
  const locationRequests = useSelector((store: any) => store.locationRequests);
  const locationApprovedRequests = useSelector((store: any) => store.locationApprovedRequests);
  const loading = useSelector((store: any) => store.loading);
  const dispatch = useDispatch();
  const [showConfirmationAccept, setShowConfirmationAccept] = useState(false);
  const [showConfirmationDecline, setShowConfirmationDecline] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showConfirmationStopAccess, setShowConfirmationStopAccess] = useState(false);

  const handleAcceptRequest = (request: Object) => {
    setSelectedRequest(request)
    setShowConfirmationAccept(true);
  };

  const handleStopAccessRequest = (request: Object) => {
    setSelectedRequest(request);
    setShowConfirmationStopAccess(true);
  };

  const handleConfirmAccept = async () => {
    try {
      loadingRequestAction(dispatch);
      const { data } = await axios.patch(`${url}/users/locationPermissionAcceptOrDeny/${selectedRequest._id}?status=${true}`, null, { headers: { token } });
      Alert.alert('Permission', data?.msg);
      getUserDetailsAction(dispatch);
      setShowConfirmationAccept(false);
    } catch (error: any) {
      console.log('error', error.msg)
      Alert.alert('Failed', error.msg)
    }
  };

  const handleConfirmStopAccess = async () => {
    try {
      const { data } = await axios.patch(`${url}/users/locationPermissionStopAccess/${selectedRequest._id}`, null, { headers: { token } });
      Alert.alert('Permission', data?.msg);
      getUserDetailsAction(dispatch);
      setShowConfirmationStopAccess(false);
    } catch (error: any) {
      console.log('error', error)
      Alert.alert('Failed', error.msg)
    }
  };

  const handleDeclineRequest = (request: Object) => {
    setSelectedRequest(request);
    setShowConfirmationDecline(true);
  };

  const handleConfirmDecline = async () => {
    try {
      const { data } = await axios.patch(`${url}/users/locationPermissionAcceptOrDeny/${selectedRequest._id}?status=${false}`, null, { headers: { token } });
      Alert.alert('Permission', data?.msg);
      getUserDetailsAction(dispatch);
      setShowConfirmationDecline(false);
    } catch (error: any) {
      console.log('error', error.msg)
      Alert.alert('Failed', error.msg)
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.itemContainer}>
      <Image source={item?.image ?{ uri: item.image} : require('../../assets/unknown-person-icon.png')} style={styles.userImage} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item?.name}</Text>
        <Text style={styles.bio}>{item?.bio}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={() => handleAcceptRequest(item)}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={() => handleDeclineRequest(item)}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderApprovedItem = ({ item }: any) => (
    <View style={styles.approvedItemContainer}>
      <Image source={{ uri: item?.image ? item.image : "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" }} style={styles.userImage} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item?.name}</Text>
        <Text style={styles.bio}>{item?.bio}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={() => handleStopAccessRequest(item)}>
          <Text style={styles.buttonText}>Stop Access</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {getUserDetailsAction(dispatch)}, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Permission Requests</Text>
      <FlatList data={locationRequests} renderItem={renderItem} keyExtractor={(item: any) => item._id} contentContainerStyle={styles.listContainer} />
      <FlatList data={locationApprovedRequests} renderItem={renderApprovedItem} keyExtractor={(item: any) => item._id} contentContainerStyle={styles.listContainer} />
      {/* Confirmation Accept Modal new request */}
      <Modal visible={showConfirmationAccept} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {`Do you want to accept ${selectedRequest?.name}'s location permission request?`}
            </Text>
            <Text style={styles.warningText}>
              This action will grant the user access to your detailed location.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.acceptModalButton]} onPress={handleConfirmAccept}>
                <Text style={styles.buttonText}>Accept</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.declineModalButton]} onPress={() => setShowConfirmationAccept(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Confirmation Decline Modal for new requests*/}
      <Modal visible={showConfirmationDecline} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {`Do you want to decline ${selectedRequest?.name}'s location permission request?`}
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.declineModalButton]} onPress={handleConfirmDecline}>
                <Text style={styles.buttonText}>Decline</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.CancelModalButton]} onPress={() => setShowConfirmationDecline(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Confirmation Stop Access Modal new request */}
      <Modal visible={showConfirmationStopAccess} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {`Do you want to cancel your location access from ${selectedRequest?.name}?`}
            </Text>
            <Text style={styles.warningText}>
              {`This action will not allow to see your detailed location to ${selectedRequest?.name}.`}
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.acceptModalButton]} onPress={handleConfirmStopAccess}>
                <Text style={styles.buttonText}>Yes</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.declineModalButton]} onPress={() => setShowConfirmationStopAccess(false)}>
                <Text style={styles.buttonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Spinner visible={loading} textContent={'Loading...'} textStyle={{ color: '#FFF' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    elevation: 3,
  },
  approvedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'orange',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    elevation: 3,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
  },
  declineButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptModalButton: {
    backgroundColor: '#2ecc71',
  },
  declineModalButton: {
    backgroundColor: '#e74c3c',
  },
  CancelModalButton: {
    backgroundColor: 'black',
  },
  warningText: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
  }
});

export default LocationPermissionScreen;