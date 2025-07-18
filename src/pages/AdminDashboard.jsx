import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useDemoAuth } from '../hooks/useDemoAuth.jsx';
import socketService from '../services/socket';

const AdminDashboard = () => {
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
    user = { name: 'Demo Admin', role: 'admin' };
    logout = () => window.location.href = '/demo';
  }
  const [students, setStudents] = useState([]);
  const [studentScreens, setStudentScreens] = useState(new Map());
  const [studentAudio, setStudentAudio] = useState(new Map()); // Map of socketId -> audio element
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    console.log('AdminDashboard: Initializing with user:', user);

    // Connect to socket server
    socketService.connect();

    // Prepare user data
    const userData = {
      userId: user?.id || 'admin-' + Date.now(),
      role: user?.role || 'admin',
      name: user?.name || 'Demo Admin',
    };
    console.log('AdminDashboard: Prepared user data:', userData);
    console.log('AdminDashboard: Full user object:', user);

    // Listen for connection status and register after connection
    socketService.on('connect', () => {
      console.log('AdminDashboard: Socket connected, registering user');
      setConnectionStatus('connected');
      socketService.registerUser(userData);
    });

    socketService.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    // Listen for students list
    socketService.onStudentsList((studentsList) => {
      console.log('AdminDashboard: Received students list:', studentsList);
      setStudents(studentsList);
    });

    // Listen for new student joining
    socketService.onStudentJoined((student) => {
      console.log('AdminDashboard: Student joined:', student);
      setStudents(prev => [...prev, student]);
    });

    // Listen for student leaving
    socketService.onStudentLeft(({ socketId }) => {
      console.log('AdminDashboard: Student left:', socketId);
      setStudents(prev => prev.filter(student => student.socketId !== socketId));
      setStudentScreens(prev => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });
    });

    // Listen for student screen data
    socketService.onStudentScreen(({ studentId, studentName, socketId, screenData }) => {
      console.log('AdminDashboard: Received screen data from:', studentName, 'size:', screenData?.length);
      console.log('AdminDashboard: Screen data type:', typeof screenData);
      console.log('AdminDashboard: Screen data preview:', screenData?.substring(0, 50));

      setStudentScreens(prev => {
        const newMap = new Map(prev);
        newMap.set(socketId, {
          studentId,
          studentName,
          screenData,
          lastUpdate: Date.now()
        });
        return newMap;
      });
    });

    // Listen for student audio data
    socketService.onStudentAudio(({ studentId, studentName, socketId, audioData }) => {
      console.log('AdminDashboard: Received audio data from:', studentName, 'size:', audioData?.length);

      // Create or get audio element for this student
      setStudentAudio(prev => {
        const newMap = new Map(prev);
        let audioElement = newMap.get(socketId);

        if (!audioElement) {
          // Create new audio element for this student
          audioElement = document.createElement('audio');
          audioElement.autoplay = true;
          audioElement.volume = 0.8;
          audioElement.controls = false;

          // Add to DOM (hidden)
          audioElement.style.display = 'none';
          document.body.appendChild(audioElement);

          console.log('AdminDashboard: Created audio element for:', studentName);
        }

        // Convert base64 audio data to blob and play
        try {
          // Extract base64 data (remove data:audio/webm;base64, prefix)
          const base64Data = audioData.split(',')[1];
          const binaryData = atob(base64Data);
          const arrayBuffer = new ArrayBuffer(binaryData.length);
          const uint8Array = new Uint8Array(arrayBuffer);

          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
          }

          const blob = new Blob([arrayBuffer], { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(blob);

          // Play the audio
          audioElement.src = audioUrl;
          audioElement.play().catch(error => {
            console.warn('AdminDashboard: Audio play failed:', error);
          });

          // Clean up old URL after a delay
          setTimeout(() => {
            URL.revokeObjectURL(audioUrl);
          }, 5000);

        } catch (error) {
          console.error('AdminDashboard: Error processing audio data:', error);
        }

        newMap.set(socketId, audioElement);
        return newMap;
      });
    });

    return () => {
      // Clean up audio elements
      studentAudio.forEach((audioElement) => {
        if (audioElement && audioElement.parentNode) {
          audioElement.pause();
          audioElement.parentNode.removeChild(audioElement);
        }
      });

      socketService.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
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

  const StudentScreenCard = ({ student, screenData }) => {
    const hasAudio = studentAudio.has(student.socketId);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
            <div className="flex items-center space-x-3">
              {/* Screen Status */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  screenData ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {screenData ? 'Video' : 'No Video'}
                </span>
              </div>

              {/* Audio Status */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  hasAudio ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {hasAudio ? 'Audio' : 'No Audio'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
          {screenData && screenData.screenData ? (
            <img
              src={screenData.screenData}
              alt={`${student.name}'s screen`}
              className="w-full h-full object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              onError={(e) => {
                console.error('Image load error for', student.name);
                console.log('Trying direct screenData access...');
              }}
              onLoad={() => {
                console.log('Image loaded successfully for:', student.name);
              }}
            />
          ) : screenData ? (
            // Try direct access to screenData if it's a string
            <img
              src={screenData}
              alt={`${student.name}'s screen`}
              className="w-full h-full object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
              onError={(e) => {
                console.error('Direct image load error for', student.name);
              }}
              onLoad={(e) => {
                console.log('Direct image loaded successfully for:', student.name);
                console.log('Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                console.log('Image element:', e.target);
                // Force a red border to make sure the image is visible
                e.target.style.border = '2px solid red';
              }}
            />
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📺</div>
              <p className="text-sm">No screen data</p>
            </div>
          )}

          {/* Audio Controls Overlay */}
          {hasAudio && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse"></div>
              <span>🔊 Audio Active</span>
              <button
                onClick={() => {
                  const audioElement = studentAudio.get(student.socketId);
                  if (audioElement) {
                    audioElement.muted = !audioElement.muted;
                    // Force re-render by updating state
                    setStudentAudio(new Map(studentAudio));
                  }
                }}
                className="ml-2 text-xs hover:text-yellow-300"
                title="Toggle Mute"
              >
                {studentAudio.get(student.socketId)?.muted ? '🔇' : '🔊'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
              <div className="text-sm text-gray-600">
                {students.length} student{students.length !== 1 ? 's' : ''} connected
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
          {students.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students connected</h3>
              <p className="text-gray-600">Students will appear here when they connect and start sharing their screens.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {students.map((student) => (
                <StudentScreenCard
                  key={student.socketId}
                  student={student}
                  screenData={studentScreens.get(student.socketId)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
