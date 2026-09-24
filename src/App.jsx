import { useState } from 'react';
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
      <div>
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

        <br />

        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      {page === 'login' && <Login onLogin={handleLogin} />}

      {page === 'register' && <Register />}

      <hr />

      {page === 'login' && (
        <button onClick={() => setPage('register')}>
          Create New Account
        </button>
      )}

      {page === 'register' && (
        <button onClick={() => setPage('login')}>
          Already have an account? Login
        </button>
      )}
    </div>
  );
}

export default App;