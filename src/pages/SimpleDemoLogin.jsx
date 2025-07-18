import { useState } from 'react';

const SimpleDemoLogin = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [name, setName] = useState('');

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
      window.location.href = '/admin';
    } else {
      window.location.href = '/student';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
            Demo Mode - Video Monitor
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Quick demo without database setup
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#dbeafe', 
          border: '1px solid #93c5fd',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#1e40af', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Demo Mode Instructions
          </h3>
          <ul style={{ color: '#1e40af', fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
            <li>No database required - works immediately</li>
            <li>Choose "Student" to share your screen</li>
            <li>Choose "Admin" to view student screens</li>
            <li>Open multiple browser tabs to test both roles</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
            Select Role
          </label>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="student"
                checked={selectedRole === 'student'}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                Student (Share my screen)
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={selectedRole === 'admin'}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                Admin (Monitor student screens)
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={handleDemoLogin}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
        >
          Start Demo
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>
            Want full features?{' '}
            <a href="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>
              Set up database and use full login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDemoLogin;
