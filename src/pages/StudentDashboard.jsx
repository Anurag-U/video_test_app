import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useDemoAuth } from '../hooks/useDemoAuth.jsx';
import socketService from '../services/socket';
import ScreenCaptureService from '../utils/screenCapture';
import { testBackendConnection } from '../utils/connectionTest.js';

const StudentDashboard = () => {
  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  let user, logout;

  try {
    if (isDemoMode) {
      const demoAuth = useDemoAuth();
      user = demoAuth.user;
      logout = demoAuth.logout;
    } else {
      const auth = useAuth();
      user = auth.user;
      logout = auth.logout;
    }
  } catch (error) {
    console.error('Auth context error:', error);
    // Fallback values
    user = { name: 'Demo User', role: 'student' };
    logout = () => window.location.href = '/demo';
  }
  const [isSharing, setIsSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState('');
  const [screenCaptureService] = useState(() => new ScreenCaptureService());
  const captureIntervalRef = useRef(null);

  useEffect(() => {
    console.log('StudentDashboard: Initializing with user:', user);

    // Test backend connection first
    testBackendConnection();

    // Connect to socket server
    socketService.connect();

    // Prepare user data
    const userData = {
      userId: user?.id || 'student-' + Date.now(),
      role: user?.role || 'student',
      name: user?.name || 'Demo Student',
    };
    console.log('StudentDashboard: Prepared user data:', userData);
    console.log('StudentDashboard: Full user object:', user);

    // Listen for connection status and register after connection
    socketService.on('connect', () => {
      console.log('StudentDashboard: Socket connected, registering user');
      setConnectionStatus('connected');
      socketService.registerUser(userData);
    });

    socketService.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    return () => {
      stopScreenSharing();
      socketService.disconnect();
    };
  }, [user]);

  const startScreenSharing = async () => {
    try {
      setError('');
      
      if (!ScreenCaptureService.isSupported()) {
        throw new Error('Screen capture is not supported in this browser');
      }

      await screenCaptureService.startScreenCapture();
      setIsSharing(true);

      // Wait a moment for video to be fully ready, then start capturing
      setTimeout(() => {
        captureIntervalRef.current = screenCaptureService.startFrameCapture((frameData) => {
          if (frameData) {
            console.log('StudentDashboard: Sending screen data, size:', frameData.length);
            socketService.sendScreenData(frameData);
          }
        }, 1000); // Send frame every 1 second for better performance
      }, 1000);

    } catch (error) {
      console.error('Error starting screen sharing:', error);
      setError(error.message || 'Failed to start screen sharing');
    }
  };

  const stopScreenSharing = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    screenCaptureService.stopScreenCapture();
    setIsSharing(false);
  };

  const handleLogout = () => {
    stopScreenSharing();
    socketService.disconnect();
    logout();
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
                  {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Screen Sharing Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Screen Sharing
              </h3>
              
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {isSharing 
                      ? 'Your screen is being shared with administrators'
                      : 'Click the button to start sharing your screen'
                    }
                  </p>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isSharing ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {isSharing ? 'Sharing Active' : 'Not Sharing'}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  {!isSharing ? (
                    <button
                      onClick={startScreenSharing}
                      disabled={connectionStatus !== 'connected'}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                      Start Sharing
                    </button>
                  ) : (
                    <button
                      onClick={stopScreenSharing}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                      Stop Sharing
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Debug/Connection Test Card */}
          <div className="mt-6 bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Connection Debug
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    console.log('🔍 Manual connection test triggered');
                    testBackendConnection();
                    console.log('Socket status:', socketService.getConnectionStatus());
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Test Connection
                </button>
                <button
                  onClick={() => {
                    console.log('🔄 Manual socket reconnection triggered');
                    socketService.ensureConnection();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Reconnect Socket
                </button>
                <div className="text-sm text-gray-600">
                  Check browser console for detailed logs
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Instructions
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Make sure you're connected to the server (green indicator)</p>
                <p>• Click "Start Sharing" to begin screen sharing</p>
                <p>• Your screen will be visible to administrators in real-time</p>
                <p>• You can stop sharing at any time by clicking "Stop Sharing"</p>
                <p>• If you close the browser tab, screen sharing will automatically stop</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
