import { io } from 'socket.io-client';
import config from '../config/config.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  
  connect(serverUrl = config.SOCKET_URL) {
    console.log('🚀 Attempting to connect to socket server:', serverUrl);

    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
      // Add CORS and additional options for better compatibility
      withCredentials: false,
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected to server:', serverUrl);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 Socket connection error:', error.message || error);
      console.error('Server URL:', serverUrl);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔥 Socket reconnection error:', error.message || error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('💀 Socket reconnection failed - giving up');
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Manually disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if socket is connected and attempt reconnection if needed
  ensureConnection() {
    if (!this.socket || !this.isConnected) {
      console.log('🔄 Socket not connected, attempting to reconnect...');
      this.connect();
    }
    return this.isConnected;
  }

  // Get current connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketExists: !!this.socket,
      socketConnected: this.socket?.connected || false
    };
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
