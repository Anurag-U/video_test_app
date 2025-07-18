import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(serverUrl = 'http://localhost:3001') {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected');
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Register user with server
  registerUser(userData) {
    console.log('SocketService: Registering user:', userData);
    this.emit('register', userData);
  }

  // Send screen data (for students)
  sendScreenData(data) {
    console.log('SocketService: Sending screen data, size:', data?.length);
    this.emit('screen-data', data);
  }

  // WebRTC signaling methods
  sendOffer(targetSocketId, offer) {
    this.emit('offer', { targetSocketId, offer });
  }

  sendAnswer(targetSocketId, answer) {
    this.emit('answer', { targetSocketId, answer });
  }

  sendIceCandidate(targetSocketId, candidate) {
    this.emit('ice-candidate', { targetSocketId, candidate });
  }

  // Listen for admin events
  onStudentsList(callback) {
    this.on('students-list', callback);
  }

  onStudentJoined(callback) {
    this.on('student-joined', callback);
  }

  onStudentLeft(callback) {
    this.on('student-left', callback);
  }

  onStudentScreen(callback) {
    this.on('student-screen', callback);
  }

  // Listen for WebRTC signaling
  onOffer(callback) {
    this.on('offer', callback);
  }

  onAnswer(callback) {
    this.on('answer', callback);
  }

  onIceCandidate(callback) {
    this.on('ice-candidate', callback);
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
