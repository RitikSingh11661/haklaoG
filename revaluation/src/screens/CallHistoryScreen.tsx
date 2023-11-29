import React from 'react'
import { View, FlatList, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

// ........
// Will implement in later
// ........

const CallHistoryScreen = () => {
    const user = useSelector((store: any) => store.user);
    const users = useSelector((store: any) => store.users);
    const [filteredUsers, setfilteredUsers] = React.useState([]);

    React.useEffect(() => {
        // setfilteredUsers(users?.filter((el: any) => el?.availableForCall)?.filter((u: any) => u?._id !== user?._id));
    }, []);

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 20, marginBottom: 30 }}>Be respectful to each other and do not make unncessary calls.</Text>
            {filteredUsers?.length < 1 && <Text>Currently in your state there are not people who are using this app, don't looe hope, soon they will be avaibable</Text>}
            <FlatList data={filteredUsers} keyExtractor={(user: any) => user._id.toString()}
                renderItem={({ item }: any) => (
                    <View style={styles.userContainer}>
                        <Image source={{ uri: item?.profilePicture }} style={styles.profileImage} />
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{item?.name}</Text>
                            <Text style={styles.userState}>{item?.location[item?.location?.length - 1]?.state}</Text>
                        </View>
                        <TouchableOpacity style={styles.connectButton}>
                            <Text style={styles.connectButtonText}>Feedback</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    )
}

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
        width: 60,
        justifyContent: 'center',
        padding: 8,
        backgroundColor: '#007BFF',
        borderRadius: 8,
    },
    connectButtonText: {
        textAlign: 'center',
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

export default CallHistoryScreen