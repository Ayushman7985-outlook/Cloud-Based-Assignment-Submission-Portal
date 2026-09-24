import { useState } from 'react';
import { supabase } from '../supabase';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [message, setMessage] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('Registering...');

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data.user) {
      setMessage('Registration failed.');
      return;
    }

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        user_id: data.user.id,
        name,
        email,
        role
      });

    if (profileError) {
      setMessage(
        'Authentication account created, but profile could not be created: ' +
        profileError.message
      );
      return;
    }

    setMessage(
      'Registration successful! Please check your email and verify your account.'
    );
  };

  return (
    <div>
      <h2>Student Assignment Portal Registration</h2>

      <form onSubmit={handleRegister}>
        <div>
          <label>Name</label>
          <br />
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Email</label>
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
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Role</label>
          <br />

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <br />

        <button type="submit">Register</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Register;