import { url } from '@env';
import io from 'socket.io-client';

const socket = io(url);

export default socket;