import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handle = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      alert('Email sent! Check your inbox.');
    } catch {
      alert('Email sending failed.');
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-card">
        <h2>Forgot Password</h2>
        <form onSubmit={handle}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}
