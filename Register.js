import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profile_pic: null,
  });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const onChange = e => {
    if (e.target.name === 'profile_pic') {
      const file = e.target.files[0];
      if (file && !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Only JPG, JPEG, or PNG files are allowed');
        return;
      }
      setForm({ ...form, profile_pic: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return alert('Passwords mismatch');
    }

    const data = new FormData();
    data.append('name', form.name);
    data.append('email', form.email);
    data.append('phone', form.phone);
    data.append('password', form.password);
    data.append('confirmPassword', form.confirmPassword);
    if (form.profile_pic) {
      data.append('profile_pic', form.profile_pic);
    }

    try {
      await axios.post('http://localhost:5000/api/users/register', data);
      alert('Registered! Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={onSubmit} encType="multipart/form-data">
        <h2>Register</h2>

        <div className="input-group">
          <input name="name" required onChange={onChange} placeholder=" " />
          <label>Name</label>
        </div>

        <div className="input-group">
          <input type="email" name="email" required onChange={onChange} placeholder=" " />
          <label>Email</label>
        </div>

        <div className="input-group">
          <input name="phone" required onChange={onChange} placeholder=" " />
          <label>Phone</label>
        </div>

        <div className="input-group">
          <input type="password" name="password" required onChange={onChange} placeholder=" " />
          <label>Password</label>
        </div>

        <div className="input-group">
          <input type="password" name="confirmPassword" required onChange={onChange} placeholder=" " />
          <label>Confirm Password</label>
        </div>

        <div className="file-input-group">
          <label>Profile Pic (optional):</label>
          <input name="profile_pic" type="file" accept="image/*" onChange={onChange} />
          {preview && <img src={preview} alt="Preview" className="preview-img" />}
        </div>

        <button type="submit">Register</button>

        <p className="switch-link">Already registered? <Link to="/login">Login here</Link></p>
      </form>
    </div>
  );
}


