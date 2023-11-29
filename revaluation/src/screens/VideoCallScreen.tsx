import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import SocketIOClient from 'socket.io-client';
import { mediaDevices, RTCPeerConnection, RTCView, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import CallEnd from '../asset/CallEnd';
import CallAnswer from '../asset/CallAnswer';
import MicOn from '../asset/MicOn';
import MicOff from '../asset/MicOff';
import VideoOn from '../asset/VideoOn';
import VideoOff from '../asset/VideoOff';
import CameraSwitch from '../asset/CameraSwitch';
import IconContainer from '../components/IconContainer';
import InCallManager from 'react-native-incall-manager';

// ........
// Will implement in later versions
// ........

export default function VideoCallScreen() {
  console.log('.....................................')
  const user = useSelector((store: any) => store.user);
  const [localStream, setlocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [type, setType] = useState<any>('JOIN');
  const otherUserId = useRef<any>(null);
  const [localMicOn, setlocalMicOn] = useState<Boolean>(true);
  const [localWebcamOn, setlocalWebcamOn] = useState<Boolean>(true);
  const remoteRTCMessage = useRef<any>(null);
  let isPeerConnectionReady = false
  const peerConnection = useRef<RTCPeerConnection>(
    new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun2.l.google.com:19302' }]
    }),
  );

  const socket = SocketIOClient('https://revaluation-backend.onrender.com', { transports: ['websocket'], query: { callerId: user._id } });

  useEffect(() => {
    socket.on('newCall', data => {
      remoteRTCMessage.current = data.rtcMessage;
      otherUserId.current = data.callerId;
      setType('INCOMING_CALL');
    });

    socket.on('callAnswered', async data => {
      remoteRTCMessage.current = data.rtcMessage;
      if (!isPeerConnectionReady) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage.current));
          isPeerConnectionReady = true;
          setType('WEBRTC_ROOM');
        } catch (error) {
          console.error('Error setting remote description:', error);
        }
      }
    });

    socket.on('ICEcandidate', data => {
      let message = data.rtcMessage;
      if (peerConnection.current) peerConnection?.current.addIceCandidate(new RTCIceCandidate({ candidate: message.candidate, sdpMid: message.id, sdpMLineIndex: message.label }))
    });

    socket.on("callDeclined", (data) => {
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

    let isFront = false;

    mediaDevices.enumerateDevices().then(async (sourceInfos: any) => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind == 'videoinput' && sourceInfo.facing == (isFront ? 'user' : 'environment')) videoSourceId = sourceInfo.deviceId;
      }

      try {
        // setup stream listening
        const stream = await mediaDevices.getUserMedia({
          audio: true, video: {
            width: { min: 500 },
            height: { min: 300 },
            frameRate: { min: 30 },
            facingMode: isFront ? 'user' : 'environment',
            deviceId: videoSourceId ? { exact: videoSourceId } : undefined
          }
        })
        const audioTrack = stream.getAudioTracks()[0], videoTrack = stream.getVideoTracks()[0];
        // Add the tracks to the peerConnection
        if (audioTrack) peerConnection.current.addTrack(audioTrack, stream);
        if (videoTrack) peerConnection.current.addTrack(videoTrack, stream);
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
        setType('OUTGOING_CALL');
        processCall();
      } else Alert.alert("No user available for a call, Kindly wait sometime")
    });
  };

  const processCall = async () => {
    const options = { offerToReceiveAudio: true, offerToReceiveVideo: true };
    const sessionDescription = await peerConnection.current.createOffer(options);
    await peerConnection.current.setLocalDescription(sessionDescription);
    socket.emit('call', { calleeId: otherUserId.current, rtcMessage: sessionDescription });
  }

  const processAccept = async () => {
    peerConnection.current.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage.current));
    const sessionDescription = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(sessionDescription);
    socket.emit('answerCall', { callerId: otherUserId.current, rtcMessage: sessionDescription });
    setType('WEBRTC_ROOM');
  }

  const declineCall = () => {
    socket.emit("declineCall", { callerId: otherUserId.current });
    setType('JOIN');
  };


  const JoinScreen = () => {
    return (
      <View style={{ flex: 1, backgroundColor: '#050A0E', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 42 }}>
        <Text style={{ fontSize: 24, color: '#ffff', marginBottom: 24 }}>Welcome to Anonymous Calls</Text>
        <Text style={{ fontSize: 16, color: '#D0D4DD', marginBottom: 24, textAlign: 'center' }}>
          Connect with random users anonymously and have private conversations.
        </Text>
        <TouchableOpacity
          onPress={initiateRandomCall}
          style={{ backgroundColor: '#5568FE', borderRadius: 12, height: 50, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#FFFFFF' }}>Call Random User</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const OutgoingCallScreen = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050A0E' }}>
        <Text style={{ fontSize: 24, color: '#ffff', marginBottom: 12 }}>Anonymous Call</Text>
        <Text style={{ fontSize: 16, color: '#D0D4DD', marginBottom: 24 }}>Calling...</Text>
        <ActivityIndicator size="large" color="#5568FE" />
        <TouchableOpacity onPress={declineCall}
          style={{ marginTop: 24, backgroundColor: '#FF5D5D', borderRadius: 30, height: 60, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
          <CallEnd width={50} height={12} />
        </TouchableOpacity>
      </View>
    );
  };

  const IncomingCallScreen = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050A0E' }}>
        <Image style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 100 }} source={{ uri: 'https://i.ibb.co/3yHwjXb/Unknown-person-icon.png' }} alt='unknown_person' />
        <Text style={{ fontSize: 17, color: '#fff', marginBottom: 40 }}>Connecting...</Text>
        <View style={{ flexDirection: 'row', gap: 100 }}>
          <TouchableOpacity onPress={processAccept} style={{ backgroundColor: 'green', borderRadius: 30, height: 60, width: 60, justifyContent: 'center', alignItems: 'center', marginRight: 24 }}>
            <CallAnswer height={28} fill="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={declineCall} style={{ backgroundColor: '#FF5D5D', borderRadius: 30, height: 60, width: 60, justifyContent: 'center', alignItems: 'center' }}>
            <CallEnd width={30} height={10} fill="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  function switchCamera() {
    localStream.getVideoTracks().forEach((track: any) => {
      track._switchCamera();
    });
  }

  function toggleCamera() {
    localWebcamOn ? setlocalWebcamOn(false) : setlocalWebcamOn(true);
    localStream.getVideoTracks().forEach((track: any) => {
      localWebcamOn ? (track.enabled = false) : (track.enabled = true);
    });
  }

  function toggleMic() {
    localMicOn ? setlocalMicOn(false) : setlocalMicOn(true);
    localStream.getAudioTracks().forEach((track: any) => localMicOn ? (track.enabled = false) : (track.enabled = true));
  }

  function leave() {
    peerConnection.current.close();
    setlocalStream(null);
    declineCall();
  }

  const WebrtcRoomScreen = () => {
    return (
      <View
        style={{ flex: 1, backgroundColor: '#050A0E', paddingHorizontal: 12, paddingVertical: 12 }}>
        {localStream ? <RTCView objectFit={'cover'} style={{ flex: 1, backgroundColor: '#050A0E' }} streamURL={localStream.toURL()} /> : null}
        {remoteStream ? <RTCView objectFit={'cover'} style={{ flex: 1, backgroundColor: '#050A0E', marginTop: 8 }} streamURL={remoteStream.toURL()} /> : null}
        <View style={{ marginVertical: 12, flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <IconContainer backgroundColor={'red'} onPress={() => leave()} Icon={() => <CallEnd height={26} width={26} fill="#FFF" />} />
          <IconContainer
            style={{ borderWidth: 1.5, borderColor: '#2B3034' }}
            backgroundColor={!localMicOn ? '#fff' : 'transparent'}
            onPress={() => toggleMic()}
            Icon={() => localMicOn ? <MicOn height={24} width={24} fill="#FFF" /> : <MicOff height={28} width={28} fill="#1D2939" />}
          />
          <IconContainer
            style={{ borderWidth: 1.5, borderColor: '#2B3034' }}
            backgroundColor={!localWebcamOn ? '#fff' : 'transparent'}
            onPress={() => toggleCamera()}
            Icon={() => localWebcamOn ? <VideoOn height={24} width={24} fill="#FFF" /> : <VideoOff height={36} width={36} fill="#1D2939" />}
          />
          <IconContainer style={{ borderWidth: 1.5, borderColor: '#2B3034' }} backgroundColor={'transparent'} onPress={() => switchCamera()}
            Icon={() => <CameraSwitch height={24} width={24} fill="#FFF" />}
          />
        </View>
      </View>
    );
  };

  switch (type) {
    case 'JOIN': return JoinScreen();
    case 'INCOMING_CALL': return IncomingCallScreen();
    case 'OUTGOING_CALL': return OutgoingCallScreen();
    case 'WEBRTC_ROOM': return WebrtcRoomScreen();
    default: return null;
  }
}