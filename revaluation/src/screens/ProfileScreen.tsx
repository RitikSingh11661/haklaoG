import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import { getUserDetailsAction, logoutAction, updateUserDetailsAction } from '../redux/actions';
import AWS from 'aws-sdk';
import RNFS from 'react-native-fs';
import { accessKeyId, secretAccessKey, region, bucketName } from '@env';
import { decode } from "base64-arraybuffer";
import uuid from 'react-native-uuid';

const ProfileScreen = ({ navigation }: any) => {
  const user = useSelector((store: any) => store.user);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false)
  const [bio, setBio] = useState(user?.bio);
  const [isEditBio, setIsEditBio] = useState(false);
  const [pImage, setPImage] = useState(user?.image);

  const credential = { accessKeyId, secretAccessKey, region, signatureVersion: "v4" }
  const s3 = new AWS.S3(credential);

  // Memoize the user data and profile image URL
  // const memoizedUser = useMemo(() => user, [user]);

  const handleSaveBio = async () => {
    try {
      const data = await updateUserDetailsAction(user?._id, { bio }, dispatch);
      setIsEditBio(prev => !prev)
      Alert.alert('Your Profile has been updated', data.msg);
    } catch (error: any) {
      console.log('error', error)
      Alert.alert('Error', error)
    }
  };

  const handleSelectImage = async () => {
    // const image:any = await ImagePicker.openPicker({
    //   cropping: true,
    // });
    // console.log('image',image)

    // ImagePicker.openPicker({
    //   width: 300,
    //   height: 400,
    //   cropping: true
    // }).then(image => {
    //   console.log(image);
    // });
    try {
      const image: any = await ImagePicker.openCamera({ cropping: true });
      // what image contain :{ "cropRect": { "height": 3262, "width": 2448, "x": 0, "y": 1 }, "height": 3264, "mime": "image/jpeg", "modificationDate": "1698174517000", "path": "file:///data/user/0/com.revaluation/cache/react-native-image-crop-picker/208220e6-e57e-4cd3-a2c5-585b0dd5e03f.jpg", "size": 2324982, "width": 2448 }
      setIsLoading(prev => !prev);

      // const fileExtension = image.path.split('.').pop();
      const filename = `${user?._id}_${uuid.v4()}-profileImage.jpeg`;

      // Read the image file and convert it to a base64 string
      const data = await RNFS.readFile(image.path, 'base64');
      const arrayBuffer = decode(data);
      const params = { Bucket: bucketName, Key: filename, Body: arrayBuffer, ContentType: `image/jpeg` };
      s3.upload(params, (s3Err: any, s3Data: any) => {
        if (s3Err) console.log('S3 error:', s3Err);
        else updateUserDetailsAction(user._id, { image: s3Data.Location}, dispatch).then(() => {
          setPImage(s3Data.Location);
          setIsLoading(prev => !prev)
        });
      });
    } catch (error) {
      console.log('error while uploading the profile image', error)
    }
  }

  const handleLogout = () => {
    logoutAction(dispatch).then(() => navigation.replace('Login'));
  }

  // React.useEffect(()=>{getUserDetailsAction(dispatch)},[])

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#f9f9f9' }}>
      <View style={styles.profileContainer}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ position: 'relative' }}>
            <Image source={pImage?{uri:pImage}:require('../../assets/user.png')} style={styles.image} />
            {isLoading && <ActivityIndicator style={styles.loadingIndicator} size="large" color="grey" />}
          </View>
          <TouchableOpacity onPress={handleSelectImage}>
            <Image source={require('../../assets/editImage.png')} style={{ width: 25, height: 25, marginTop: 60, marginLeft: -10 }} alt='edit-image icon' />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{user?.name}</Text>
        {user?.verified && (
          <View style={styles.verifiedContainer}>
            <Text style={styles.verifiedText}>Verified by {user?.verifiedBy}</Text>
            <Image source={require('../../assets/verifiedIcon.png')} style={styles.verifiedIcon} />
          </View>
        )}
        {isEditBio ?
          <View>
            <TextInput onChangeText={(str) => setBio(str)} style={styles.profileBio} value={bio} placeholder="Enter your bio" multiline numberOfLines={3} />
            <TouchableOpacity style={styles.editButton} onPress={handleSaveBio}>
              <Text style={styles.editButtonText}>Save Bio</Text>
            </TouchableOpacity>
          </View> :

          <View>
            <Text style={styles.profileBio}>{user?.bio}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditBio(prev => !prev)}>
              <Text style={styles.editButtonText}>Edit Bio</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
      <View>
        <Text style={styles.subHeading}>Features</Text>
        <Pressable onPress={() => navigation.navigate('LocationSelection')}>
          <View style={styles.featuresDiv}>
            <Image source={require('../../assets/map-markup.png')} style={{ width: 30, height: 30 }} alt='map markup' />
            <View style={{ gap: 5 }}>
              <Text style={{ fontWeight: 'bold', color: '#333030' }}>Location Selection</Text>
              <Text style={{ color: '#5b5b5b' }}>Choose your location where you live.</Text>
            </View>
            <Image source={require('../../assets/right-arrow.png')} style={{ marginLeft: 15, width: 10, height: 20 }} alt='map markup' />
          </View>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Map')}>
          <View style={styles.featuresDiv}>
            <Image source={require('../../assets/google-maps.png')} style={{ width: 30, height: 30 }} alt='map world' />
            <View style={{ gap: 5 }}>
              <Text style={{ fontWeight: 'bold', color: '#333030' }}>Achievement</Text>
              <Text style={{ color: '#5b5b5b' }}>Places of people who using this app.</Text>
            </View>
            <Image source={require('../../assets/right-arrow.png')} style={{ marginLeft: 12, width: 10, height: 20 }} alt='map markup' />
          </View>
        </Pressable>
        {/* <Pressable onPress={() => navigation.navigate('LocationSelection')}>
          <View style={styles.featuresDiv}>
            <Image source={require('../../assets/map-markup.png')} style={{ width: 30, height: 30 }} alt='map markup' />
            <View style={{ gap: 5 }}>
              <Text style={{ fontWeight: 'bold', color: '#333030' }}>Call History</Text>
              <Text style={{ color: '#5b5b5b' }}>Explore call history & give feedback.</Text>
            </View>
            <Image source={require('../../assets/right-arrow.png')} style={{ marginLeft: 15, width: 10, height: 20 }} alt='map markup' />
          </View>
        </Pressable> */}
      </View>
      <View>
        <Text style={styles.subHeading}>Support</Text>
        <View style={styles.supportDiv}>
          <Image source={require('../../assets/share.png')} style={{ width: 25, height: 25 }} alt='map markup' />
          <Text style={{ fontWeight: 'bold', color: '#333030' }}>Share App</Text>
        </View>
        <View style={styles.supportDiv}>
          <Image source={require('../../assets/contact-us.png')} style={{ width: 25, height: 25 }} alt='map markup' />
          <Text style={{ fontWeight: 'bold', color: '#333030' }}>Contact Us</Text>
        </View>
        <View style={styles.supportDiv}>
          <Image source={require('../../assets/about-us.png')} style={{ width: 25, height: 25 }} alt='map markup' />
          <Text style={{ fontWeight: 'bold', color: '#333030' }}>About Us</Text>
        </View>
      </View>
      <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text onPress={handleLogout} style={{ color: 'red', fontWeight: 'bold', marginVertical: 10 }}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 75,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 18,
    marginBottom: 8,
    color: '#6c6a6a',
    fontWeight: 'bold'
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 15,
    color: 'green',
    marginRight: 8,
  },
  verifiedIcon: {
    width: 20,
    height: 20,
  },
  profileBio: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subHeading: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 15,
    color: '#5a5656',
    backgroundColor: '#f2f1f1',
    fontWeight: 'bold'
  }
  , featuresDiv: {
    marginLeft: 30,
    marginBottom: 15,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center'
  }, supportDiv: {
    marginLeft: 30,
    marginBottom: 15,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center'
  }, loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -25 }], // Adjust these values to center the indicator appropriately
    zIndex: 1, // Ensure it's above the image
  },
});

export default ProfileScreen;