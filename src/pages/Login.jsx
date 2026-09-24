import { useState } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('Logging in...');

    try {
      const response = await fetch(
        'https://cloud-based-assignment-submission-portal.onrender.com/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || 'Login failed.');
        return;
      }

      const profileResponse = await fetch(
        `https://cloud-based-assignment-submission-portal.onrender.com/api/profile/${data.user_id}`
      );

      if (!profileResponse.ok) {
        setMessage(
          'Login successful, but user profile could not be loaded.'
        );
        return;
      }

      const profileData = await profileResponse.json();

      onLogin({
        user_id: data.user_id,
        name: profileData.name,
        role: profileData.role,
        access_token: data.access_token
      });

    } catch (error) {
      setMessage(
        'Could not connect to the backend server.'
      );
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Password:</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <br />

        <button type="submit">
          Login
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;