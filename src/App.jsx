import { useState } from 'react';
import './App.css';

import Register from './pages/Register';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  const [page, setPage] = useState('login');
  const [userProfile, setUserProfile] = useState(null);

  const handleLogin = (profile) => {
    console.log('Login profile:', profile);
    setUserProfile(profile);
  };

  const handleLogout = () => {
    setUserProfile(null);
    setPage('login');
  };

  if (userProfile) {
    return (
      <div className="portal-dashboard">
        <div className="portal-dashboard-content">
          {userProfile.role === 'student' && (
            <StudentDashboard
              userName={userProfile.name}
              userId={userProfile.user_id}
            />
          )}

          {userProfile.role === 'teacher' && (
            <TeacherDashboard
              userName={userProfile.name}
              userId={userProfile.user_id}
            />
          )}

          <div className="portal-logout-area">
            <button
              className="portal-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-auth">
      <div className="portal-auth-card">
        <div className="portal-brand">
          <div className="portal-brand-icon">🎓</div>

          <div>
            <h1>Assignment Portal</h1>
            <p>Student Assignment Submission & Feedback</p>
          </div>
        </div>

        <div className="portal-auth-content">
          {page === 'login' && (
            <Login onLogin={handleLogin} />
          )}

          {page === 'register' && <Register />}
        </div>

        <div className="portal-auth-switch">
          {page === 'login' && (
            <>
              <span>Don't have an account?</span>

              <button
                onClick={() => setPage('register')}
              >
                Create New Account
              </button>
            </>
          )}

          {page === 'register' && (
            <>
              <span>Already have an account?</span>

              <button
                onClick={() => setPage('login')}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;