import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DemoLogin = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    // Store demo user data in localStorage
    const demoUser = {
      id: Date.now().toString(),
      name: name.trim(),
      role: selectedRole,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@demo.com`
    };

    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    localStorage.setItem('demoMode', 'true');

    // Navigate to appropriate dashboard
    if (selectedRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Demo Mode - Video Monitor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Quick demo without database setup
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Demo Mode Instructions
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>No database required - works immediately</li>
                    <li>Choose "Student" to share your screen</li>
                    <li>Choose "Admin" to view student screens</li>
                    <li>Open multiple browser tabs to test both roles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Role
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={selectedRole === 'student'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Student (Share my screen)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={selectedRole === 'admin'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Admin (Monitor student screens)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleDemoLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Demo
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Want full features?{' '}
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Set up database and use full login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
