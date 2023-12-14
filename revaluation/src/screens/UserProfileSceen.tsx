import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ReportModel from '../components/ReportModel';

const UserProfileScreen = ({ route, navigation }: any) => {
  const { user } = route.params;
  const [isReporting, setIsReporting] = React.useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={user?.profilePicture ? { uri: user?.profilePicture } : require('../../assets/user.png')} style={styles.profileImage} />
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userBio}>{user?.bio}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detailText}>State: {user?.location[user?.location.length - 1].state}</Text>
      </View>
      <TouchableOpacity style={styles.connectButton} onPress={() => navigation.goBack()}>
        <Text style={styles.connectButtonText}>Go Back</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.reportButton} onPress={() => setIsReporting(true)}>
        <Text style={styles.reportButtonText}>Report</Text>
      </TouchableOpacity>
      <ReportModel isReporting={isReporting} againstUserId={user?._id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333', // Dark gray color for the username
  },
  userBio: {
    fontSize: 16,
    color: '#777', // Light gray color for the user bio
    marginTop: 8,
  },
  details: {
    marginTop: 16,
  },
  detailText: {
    fontSize: 18,
    marginBottom: 8,
  },
  connectButton: {
    padding: 12,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reportButton: {
    padding: 12,
    backgroundColor: 'red', // Customize the button's color
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  reportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default UserProfileScreen;