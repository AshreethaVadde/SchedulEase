// src/pages/BookAppointment.js
import React from "react";
import { useParams } from "react-router-dom";
import AppointmentForm from "../components/AppointmentForm";
import "./BookAppointment.css"; // Import the new CSS

function BookAppointment() {
  const { providerId } = useParams();

  return (
    <div className="book-appointment-page">
      <div className="appointment-wrapper">
        <AppointmentForm providerId={providerId} />
      </div>
    </div>
  );
}

export default BookAppointment;
