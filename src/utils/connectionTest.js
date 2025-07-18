import config from '../config/config.js';

// Test if the backend server is reachable
export const testBackendConnection = async () => {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test API endpoint
    const apiResponse = await fetch(`${config.API_BASE_URL.replace('/api', '')}/health`);
    console.log('API Health Check Status:', apiResponse.status);
    
    if (apiResponse.ok) {
      const data = await apiResponse.text();
      console.log('✅ API server is reachable:', data);
    } else {
      console.log('⚠️ API server responded with status:', apiResponse.status);
    }
  } catch (error) {
    console.error('❌ API server is not reachable:', error.message);
  }

  try {
    // Test socket.io endpoint
    const socketResponse = await fetch(`${config.SOCKET_URL}/socket.io/`);
    console.log('Socket.IO Health Check Status:', socketResponse.status);
    
    if (socketResponse.ok) {
      console.log('✅ Socket.IO server is reachable');
    } else {
      console.log('⚠️ Socket.IO server responded with status:', socketResponse.status);
    }
  } catch (error) {
    console.error('❌ Socket.IO server is not reachable:', error.message);
  }
};

// Call this function to test connections
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.testBackendConnection = testBackendConnection;
}
