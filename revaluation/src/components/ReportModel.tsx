import React from 'react'
import { View, Text, TouchableOpacity, Button, Modal, Alert, TextInput, StyleSheet } from 'react-native'
import { userReportAction } from '../redux/actions';
import { useDispatch } from 'react-redux';

const ReportModel = ({ isReporting, againstUserId }: { isReporting: boolean, againstUserId: String }) => {
    const dispatch = useDispatch();
    const [isReport, setIsReport] = React.useState(isReporting||false);
    const [reportReason, setReportReason] = React.useState('');
    const [reportDescription, setReportDescription] = React.useState('');

    const handleReport = () => {
        const obj = { reason: reportReason, description: reportDescription, againstUserId };
        userReportAction(obj, dispatch)
            .then((res) => Alert.alert(res?.msg))
            .catch((err) => Alert.alert('Report is not registered', err))
        setIsReport(false);
    };

    return (
        <Modal visible={isReport} animationType="slide">
            <View style={styles.reportModal}>
                <Text style={styles.reportTitle}>Report User!</Text>
                <Text style={{ fontSize: 18, marginBottom: 80 }}>Do not hesitate to share your experience</Text>
                <Text style={{ fontSize: 18, marginBottom: 15 }}>Select the reason why you are reporting?</Text>
                <View style={styles.reaosonDiv}>
                    <TouchableOpacity onPress={() => setReportReason('Rude')}>
                        <Text style={reportReason === 'Rude' ? styles.reportReasonButtonText2 : styles.reportReasonButtonText}>Rude</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setReportReason('Misbehaved')}>
                        <Text style={reportReason === 'Misbehaved' ? styles.reportReasonButtonText2 : styles.reportReasonButtonText}>Misbehaved</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setReportReason('Spammer')}>
                        <Text style={reportReason === 'Spammer' ? styles.reportReasonButtonText2 : styles.reportReasonButtonText}>Spammer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setReportReason('Abused')}>
                        <Text style={reportReason === 'Abused' ? styles.reportReasonButtonText2 : styles.reportReasonButtonText}>Abused</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 18, marginBottom: 15 }}>Anything extra you want to share with us?</Text>
                <TextInput placeholder="Optional" value={reportDescription} onChangeText={(text) => setReportDescription(text)} style={styles.reportInput} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button disabled={reportReason.length < 1} title="Submit Report" onPress={handleReport} />
                    <Button title="Cancel" onPress={() => setIsReporting(false)} />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    reportModal: {
        marginTop: 70,
        alignItems: 'center'
    },
    reportTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    reportInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 100,
        width: '90%',
        borderRadius: 10
    },
    reaosonDiv: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 40,
    },
    reportReasonButtonText: {
        borderColor: '#bababa',
        padding: 8,
        borderRadius: 8,
        borderWidth: 2
    },
    reportReasonButtonText2: {
        borderColor: '#bababa',
        backgroundColor: '#f8f8f8',
        padding: 8,
        borderRadius: 8,
        borderWidth: 2,
        color: '#007BFF',
        fontWeight: '700',
    }
});

export default ReportModel