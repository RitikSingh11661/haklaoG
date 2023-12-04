import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import CallDuration from '../components/CallDuration';
// import socket from '../socket/SocketConfig';
import SocketIOClient from 'socket.io-client';
import { mediaDevices, RTCPeerConnection, RTCView, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { url } from '@env';

// ........
// Will implement in later versions
// ........

const VoiceCallScreen = () => {
  const user = useSelector((store: any) => store.user);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [localStream, setlocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const otherUserId = useRef<any>(null);
  const [localMicOn, setlocalMicOn] = useState<Boolean>(true);
  const remoteRTCMessage = useRef<any>(null);
  const [type, setType] = useState<any>('JOIN');
  let isPeerConnectionReady = false;
  const initPeer = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun2.l.google.com:19302' }]
  })
  const peerConnection = useRef<RTCPeerConnection>(initPeer);

  const socket = SocketIOClient(url, { transports: ['websocket'], query: { callerId: user._id } });

  useEffect(() => {
    socket.on('newCall', data => {
      remoteRTCMessage.current = data.rtcMessage;
      otherUserId.current = data.callerId;
      setType('INCOMING_CALL');
    });

    socket.on('callAnswered', async data => {
      console.log('call answered')
      remoteRTCMessage.current = data.rtcMessage;
      if (!isPeerConnectionReady) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage.current));
          isPeerConnectionReady = true;
          setIsConnected(true);
          setIsCalling(false);
        } catch (error) {
          console.error('Error setting remote description:', error);
        }
      }
      setType('JOIN');
    });

    socket.on('ICEcandidate', data => {
      let message = data.rtcMessage;
      if (peerConnection.current) peerConnection?.current.addIceCandidate(new RTCIceCandidate({ candidate: message.candidate, sdpMid: message.id, sdpMLineIndex: message.label }))
    });

    socket.on("callDeclined", (data) => {
      setIsConnected(false);
      setIsCalling(false);
      console.log('call declined');
      setType('JOIN');
    });

    peerConnection.current.onicecandidate = (event: any) => {
      if (event.candidate && isPeerConnectionReady) {
        socket.emit('ICEcandidate', {
          calleeId: otherUserId.current,
          rtcMessage: { label: event.candidate.sdpMLineIndex, id: event.candidate.sdpMid, candidate: event.candidate.candidate }
        });
      } else console.log('End of candidates.');
    };

    mediaDevices.enumerateDevices().then(async (sourceInfos: any) => {
      try {
        const stream = await mediaDevices.getUserMedia({ audio: true })
        const audioTrack = stream.getAudioTracks()[0];
        // Add the tracks to the peerConnection
        if (audioTrack) peerConnection.current.addTrack(audioTrack, stream);
        setlocalStream(stream);
      } catch (error) {
        console.log('error in mediaDevices', error)
      }
    }).catch(error => console.log('error in maian mediaDevices', error));

    peerConnection.current.ontrack = (event: any) => {
      // Handle the remote track
      if (event.streams && event.streams[0]) setRemoteStream(event.streams[0]);
    };

    return () => {
      socket.off('newCall');
      socket.off('callAnswered');
      socket.off('callDeclined');
      socket.off('ICEcandidate');
    };
  }, []);

  useEffect(() => {
    InCallManager.start();
    InCallManager.setKeepScreenOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    return () => InCallManager.stop();
  }, []);

  const initiateRandomCall = () => {
    // Request a random online user from the server
    socket.emit("getRandomOnlineUser");
    socket.on("randomOnlineUser", (randomUser) => {
      if (randomUser) {
        otherUserId.current = randomUser;
        setIsCalling(true);
        setType('OUTGOING_CALL');
        processCall();
      } else Alert.alert("No user available for a call, Kindly wait sometime")
    });
  };

  const processCall = async () => {
    // const sessionDescription = await peerConnection.current.createOffer({ offerToReceiveAudio: true });
    // await peerConnection.current.setLocalDescription(sessionDescription);
    // socket.emit('call', { calleeId: otherUserId.current, rtcMessage: sessionDescription });
    console.log('peerConnection.current',peerConnection.current)
    if (peerConnection.current.signalingState === 'stable') {
      const sessionDescription = await peerConnection.current.createOffer({ offerToReceiveAudio: true });
      await peerConnection.current.setLocalDescription(sessionDescription);
      socket.emit('call', { calleeId: otherUserId.current, rtcMessage: sessionDescription });
    } else console.log('Peer connection not ready');
  }

  const processAccept = async () => {
    peerConnection.current.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage.current));
    const sessionDescription = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(sessionDescription);
    socket.emit('answerCall', { callerId: otherUserId.current, rtcMessage: sessionDescription });
    setIsConnected(true);
    setType('JOIN');
  }


  const declineCall = () => {
    socket.emit("declineCall", { callerId: otherUserId.current });
    setIsConnected(false);
    setIsCalling(false);
    setType('JOIN');
  };

  const hangupCall = () => {
    if (localStream) localStream.getAudioTracks()[0].stop();
    peerConnection.current.close();
    peerConnection.current = initPeer;
    declineCall();
  }

  const JoinScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.callText}>Voice Call</Text>
        {(!isCalling && !isConnected) && <Image source={require('../../assets/phone-call-icon.png')} style={styles.callIcon} />}
        {isCalling && <Text style={styles.callText}>Searching for a user</Text>}
        {(isCalling || isConnected) && <Image style={{ width: 170, height: 170, marginBottom: 10 }} source={require('../../assets/unknown-person-icon.png')} />}
        {(isCalling && !isConnected) && <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Image style={styles.endCallIcon} source={require('../../assets/phone-call-end.png')} />
        </TouchableOpacity>}
        <View style={styles.buttonsContainer}>
          {isConnected && <View>
            <CallDuration isConnected={isConnected} />
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.actionButton} onPress={toggleMute}>
                <Image style={styles.belowIcon} source={isMuted ? require('../../assets/volume-high.png') : require('../../assets/volume-mute.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={toggleSpeaker}>
                <Image style={styles.belowIcon} source={isSpeakerOn ? require('../../assets/mic.png') : require('../../assets/mic-off.png')} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.endCallButton} onPress={hangupCall}>
              <Image style={styles.endCallIcon} source={require('../../assets/phone-call-end.png')} />
            </TouchableOpacity>
          </View>
          }
          {(!isCalling && !isConnected) && <TouchableOpacity style={styles.callButton} onPress={initiateRandomCall}>
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>}
        </View>
      </View>
    );
  }

  const OutgoingCallScreen = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050A0E' }}>
        <Text style={{ fontSize: 24, color: '#ffff', marginBottom: 12 }}>Anonymous Call</Text>
        <Text style={{ fontSize: 16, color: '#D0D4DD', marginBottom: 24 }}>Calling...</Text>
        <ActivityIndicator size="large" color="#5568FE" />
        <TouchableOpacity onPress={declineCall}
          style={{ marginTop: 24, backgroundColor: '#FF5D5D', borderRadius: 30, height: 60, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../../assets/phone-call-end.png')} style={{ width: 50, height: 12 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const IncomingCallScreen = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050A0E' }}>
        <Image style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 100 }} source={require('../../assets/unknown-person-icon.png')} alt='unknown_person' />
        <Text style={{ fontSize: 17, color: '#fff', marginBottom: 40 }}>Connecting...</Text>
        <View style={{ flexDirection: 'row', gap: 100 }}>
          <TouchableOpacity onPress={processAccept}>
            <Image source={require('../../assets/call-answer.png')} style={{ width: 60, height: 60 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={declineCall}>
            <Image source={require('../../assets/phone-call-end.png')} style={{ width: 60, height: 60 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  function toggleMic() {
    localMicOn ? setlocalMicOn(false) : setlocalMicOn(true);
    // localStream.getAudioTracks().forEach((track: any) => localMicOn ? (track.enabled = false) : (track.enabled = true));
    localStream.getAudioTracks().forEach((track: any) => localMicOn ? (track.enabled = false) : (track.enabled = true));
  }

  function leave() {
    peerConnection.current.close();
    setlocalStream(null);
    declineCall();
  }

  const handleEndCall = () => {
    setIsMuted(false);
    setIsSpeakerOn(false);
    declineCall();
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(prev => !prev);
  };

  switch (type) {
    case 'JOIN': return JoinScreen();
    case 'INCOMING_CALL': return IncomingCallScreen();
    case 'OUTGOING_CALL': return OutgoingCallScreen();
    default: return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  callIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  callText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  callDuration: {
    fontSize: 16,
    marginBottom: 10,
  },
  callButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  callButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
  endCallButton: {
    borderRadius: 50,
    backgroundColor: '#e74c3c',
    marginTop: 15,
    paddingHorizontal: 45
  },
  endCallButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  endCallIcon: {
    width: 50,
    height: 50
  },
  belowIcon: {
    width: 30,
    height: 30
  },
  incomingCallContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingCallText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  answerButton: {
    backgroundColor: '#2ecc71',
  },
  declineButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default VoiceCallScreen;