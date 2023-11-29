import React from 'react'
import { Text } from 'react-native';

const CallDuration = ({ isConnected }: any) => {
  const [callDuration, setCallDuration] = React.useState(0);

  const formatTime = (seconds: any) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes<10?'0':''}${minutes}:${remainingSeconds<10?'0':''}${remainingSeconds}`;
  };

  React.useEffect(() => {
    let interval: any;
    if (isConnected) interval = setInterval(() => { setCallDuration(prevDuration => prevDuration + 1) }, 1000)
    else {
      clearInterval(interval);
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  return <Text style={{ fontSize: 16, marginBottom: 10 }}>{`Call Duration: ${formatTime(callDuration)}`}</Text>;
}

export default CallDuration