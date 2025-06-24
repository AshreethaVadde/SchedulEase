import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AppointmentForm.css";


function AppointmentForm({ providerId }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");

  const userId = localStorage.getItem("user_id");

  // ✅ Format date correctly without timezone issues
  const formatDateForMySQL = (dateObj) => {
    return dateObj.toLocaleDateString("en-CA"); // YYYY-MM-DD
  };

  const fetchAvailableSlots = async (dateObj) => {
    const formattedDate = formatDateForMySQL(dateObj);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/appointments/available-slots/${providerId}/${formattedDate}`
      );
      setSlots(response.data);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots([]);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    } else {
      setSlots([]);
    }
  }, [selectedDate, providerId]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const user_id = localStorage.getItem('user_id');
  if (!user_id) {
    alert("You must be logged in to book an appointment.");
    return;
  }

  if (!selectedDate || !selectedTime) {
    setMessage("Please select both date and time.");
    return;
  }

  const formattedDate = formatDateForMySQL(selectedDate);

  try {
    const response = await axios.post("http://localhost:5000/api/appointments/book", {
      user_id: user_id,  // use localStorage value here
      provider_id: providerId,
      date: formattedDate,
      time: selectedTime,
    });

    setMessage(response.data.message);
    setSelectedTime("");
    fetchAvailableSlots(selectedDate); // refresh remaining slots
  } catch (error) {
    console.error("Booking failed:", error);
    setMessage(error.response?.data?.error || "Booking failed");
  }
};

  return (
    <div style={{ padding: "2rem" }} className="appointment-container">
      <h2>Book an Appointment</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Date: </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setSelectedTime("");
              setMessage("");
            }}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            placeholderText="Click to select a date"
          />
        </div>

        {selectedDate && (
          <div style={{ marginTop: "1rem" }}>
            <label>Available Slots:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }} className="slot-grid">
              {slots.length > 0 ? (
                slots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={slot.remaining <= 0}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: selectedTime === slot.time ? "#4caf50" : "#f0f0f0",
                      border: "1px solid #ccc",
                      color: slot.remaining <= 0 ? "gray" : "black",
                      cursor: slot.remaining <= 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    {slot.time} ({slot.remaining} left)
                  </button>
                ))
              ) : (
                <p>No slots available.</p>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          <button type="submit" style={{ padding: "10px 20px" }} className="submit-btn">
            Book Now
          </button>
        </div>
      </form>

      {message && <p style={{ marginTop: "1rem", color: "blue" }} className="message">{message}</p>}
      <hr style={{ marginTop: "3rem", marginBottom: "1rem" }} className="divider" />
      <div className="review-section">
  
</div>

    </div>
  );
}

export default AppointmentForm;





