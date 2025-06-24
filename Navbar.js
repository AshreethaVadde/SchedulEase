import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user_id = localStorage.getItem('user_id');

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src="\images\scheduleease.jpeg" alt="SchedulEase" height="50" width="120"></img>
      </Link>

      <div className="navbar-links">
        {user_id ? (
          <>
            <Link to="/myappointments" className="nav-link">My Appointments</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


