import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ResetPassword.css';

export default function ResetPassword() {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault();
    if (pass !== confirm) return alert('Passwords mismatch');
    try {
      await axios.post('http://localhost:5000/api/users/reset-password', {
        token,
        password: pass,
        confirmPassword: confirm,
      });
      alert('Password reset successful!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="reset-container">
      <form className="reset-form" onSubmit={handle}>
        <h2>Reset Password</h2>

        <div className="input-group">
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />
          <label>New Password</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <label>Confirm Password</label>
        </div>

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}

