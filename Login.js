import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('name', res.data.name);
      alert('Login successful!');
      navigate('/');
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={onLogin} className="login-form">
        <div className="logo-box">
          <img src="/images/scheduleease.jpeg" alt="Logo" />
          <h2>Login to ScheduleEase</h2>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          required
        />
        <button type="submit">Login</button>

        <div className="login-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <span> | </span>
          <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}


