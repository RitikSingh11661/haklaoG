import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector } from 'react-redux';
// import { useNavigation } from '@react-navigation/native';

const NearByPeopleScreen = () => {
  const user = useSelector((store: any) => store.user);
  const users = useSelector((store: any) => store.users);
  const [isInState, setIsInState] = React.useState(true); // By default, show people in the state
  // const navigation = useNavigation();

  const filteredUsers = users?.filter((u: any) => {
    if (u?.location?.length > 0) {
      const uState = u?.location[u?.location?.length - 1]?.state;
      const userState = user?.location[user?.location?.length - 1]?.state;
      if (isInState && uState === userState) return u;
      else if (!isInState && uState !== userState) return u;
    }
  })?.filter((u: any) => u?._id !== user?._id && u?.verified);

  return (
    <View style={styles.container}>
      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[styles.filterButton, isInState ? styles.activeFilter : null]}
          onPress={() => setIsInState(true)}
        >
          <Text style={styles.filterButtonText}>People in Your State</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, !isInState ? styles.activeFilter : null]}
          onPress={() => setIsInState(false)}
        >
          <Text style={styles.filterButtonText}>People Outside Your State</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>
        {isInState ? 'People in Your State' : 'People Outside Your State'}
      </Text>
      {filteredUsers?.length < 1 && <Text>Currently in your state there are not people who are using this app, don't looe hope, soon they will be avaibable</Text>}
      <FlatList data={filteredUsers} keyExtractor={(user) => user._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <TouchableOpacity>
            <Image source={item?.profilePicture?{uri:item?.profilePicture}:require('../../assets/user.png')} style={styles.profileImage} />
              {/* <Image source={{ uri: item?.profilePicture }} style={styles.profileImage} /> */}
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item?.name}</Text>
              <Text style={styles.userState}>{item?.location[item?.location?.length - 1]?.state}</Text>
            </View>
            <TouchableOpacity style={styles.connectButton} onPress={() => Alert.alert('Comming soon')}>
              {/* <Text style={styles.connectButtonText}>Connect</Text> */}
              <Text style={styles.connectButtonText}>View full profile</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userState: {
    fontSize: 14,
  },
  connectButton: {
    padding: 8,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 5
  },
  filterButton: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#007BFF',
  },
  filterButtonText: {
    color: '#333',
    fontWeight: 'bold',
  }
});

export default NearByPeopleScreen;