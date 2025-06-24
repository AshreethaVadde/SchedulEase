import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
  const user_id = localStorage.getItem('user_id');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', profile_pic: '' });
  const [newProfilePic, setNewProfilePic] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/users/profile/${user_id}`)
      .then(res => setProfile(res.data))
      .catch(err => alert('Failed to fetch profile'));
  }, [user_id]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('email', profile.email);
    formData.append('phone', profile.phone);
    if (newProfilePic) {
      formData.append('profile_pic', newProfilePic);
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/users/profile/${user_id}`, formData);
      alert(res.data.message);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form" encType="multipart/form-data">
        <label>Name:</label>
        <input type="text" name="name" value={profile.name} onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="email" value={profile.email} onChange={handleChange} required />

        <label>Phone Number:</label>
        <input type="text" name="phone" value={profile.phone} onChange={handleChange} pattern="[0-9]{10}" title="Enter 10-digit phone number" required />

        {profile.profile_pic && (
          <div className="profile-image-preview">
            <img src={`http://localhost:5000/uploads/${profile.profile_pic}`} alt="Profile" />
          </div>
        )}

        <label>Change Profile Picture:</label>
        <input type="file" onChange={handleFileChange} />

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default UserProfile;

