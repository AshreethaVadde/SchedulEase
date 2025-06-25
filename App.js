import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import AppointmentForm from './components/AppointmentForm';
import AppointmentHistory from './components/AppointmentHistory';
import ProviderList from './components/ProviderList';
import HomePage from './components/HomePage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import UserProfile from './components/UserProfile';
import BookAppointment from './components/BookAppointment';
import ProviderDetailPage from './components/ProviderDetailPage';





const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/book/:providerId" element={<BookAppointment />} />
        <Route path="/myappointments" element={<AppointmentHistory />} />
        <Route path="/book/:providerId" element={<AppointmentForm />} />
        <Route path="/providers/:category" element={<ProviderList />} />
        <Route path="/provider/:providerId" element={<ProviderDetailPage />} />


      </Routes>
    </Router>
  );
};

export default App;







