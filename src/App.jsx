import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { DemoAuthProvider } from './hooks/useDemoAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DemoLogin from './pages/DemoLogin';
import SimpleDemoLogin from './pages/SimpleDemoLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css'

function App() {
  return (
    <DemoAuthProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/demo" element={<SimpleDemoLogin />} />
              <Route path="/demo-old" element={<DemoLogin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/student"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/demo" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </DemoAuthProvider>
  );
}

export default App
