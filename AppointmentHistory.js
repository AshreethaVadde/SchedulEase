import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AppointmentHistory.css'; // Optional custom styles

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewProvider, setReviewProvider] = useState(null);
  const [reviewRating, setReviewRating] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewedProviders, setReviewedProviders] = useState([]);

  const user_id = localStorage.getItem('user_id');

  useEffect(() => {
    if (!user_id) return;
    axios.get(`http://localhost:5000/api/appointments/user/${user_id}`)
      .then(async res => {
        setAppointments(res.data);

        // Check which providers have already been reviewed
        const reviewed = [];
        for (const a of res.data) {
          if (new Date(`${a.appointment_date}T${a.appointment_time}`) < new Date()) {
            const resp = await axios.get(`http://localhost:5000/api/reviews/check/${user_id}/${a.provider_id}`);
            if (resp.data.reviewed) reviewed.push(a.provider_id);
          }
        }
        setReviewedProviders(reviewed);
      })
      .catch(err => console.error('Error fetching appointments:', err));
  }, [user_id]);

  const now = new Date();

  const upcoming = appointments.filter(a =>
    new Date(`${a.appointment_date}T${a.appointment_time}`) >= now &&
    a.status === 'upcoming'
  );

  const cancelled = appointments.filter(a => a.status === 'cancelled');

  const completed = appointments.filter(a =>
    new Date(`${a.appointment_date}T${a.appointment_time}`) < now &&
    a.status === 'completed'
  );

  const cancelAppointment = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/cancel/${id}`);
      alert("Appointment cancelled.");
      window.location.reload();
    } catch (err) {
      console.error("Cancellation error:", err);
      alert("Failed to cancel.");
    }
  };

  const openRescheduleModal = (id) => {
    setRescheduleId(id);
    setSelectedDate(null);
    setAvailableSlots([]);
    setSelectedTime('');
    setRescheduleModalOpen(true);
  };

  const fetchAvailableSlots = async (date) => {
    if (!date || !rescheduleId) return;
    const appt = appointments.find(a => a.id === rescheduleId);
    const formattedDate = new Date(date).toISOString().split('T')[0];

    try {
      const res = await axios.get(`http://localhost:5000/api/appointments/available-slots/${appt.provider_id}/${formattedDate}`);
      setAvailableSlots(res.data.filter(slot => slot.remaining > 0));
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
  };

  const handleRescheduleSubmit = async () => {
  if (!selectedDate || !selectedTime) return alert("Please select date and time");

  const newDate = selectedDate.toLocaleDateString("en-CA"); // ✅ Use local date, not UTC

  try {
    await axios.put(`http://localhost:5000/api/appointments/reschedule/${rescheduleId}`, {
      newDate,
      newTime: selectedTime
    });
    alert("Appointment rescheduled.");
    setRescheduleModalOpen(false);
    window.location.reload();
  } catch (err) {
    console.error("Reschedule error:", err);
    alert("Failed to reschedule.");
  }
};


  const openReviewModal = (provider_id) => {
    setReviewProvider(provider_id);
    setReviewRating('');
    setReviewComment('');
    setReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewRating || !reviewComment) {
      alert("Please enter rating and comment.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/reviews", {
        user_id,
        provider_id: reviewProvider,
        rating: reviewRating,
        comment: reviewComment
      });
      alert("Review submitted!");
      setReviewModal(false);
      setReviewedProviders([...reviewedProviders, reviewProvider]);
    } catch (err) {
      console.error("Review error:", err);
      alert("Failed to submit review.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Appointments</h2>

      <h3>Upcoming Appointments</h3>
      {upcoming.length === 0 ? (
        <p>No upcoming appointments</p>
      ) : (
        <ul>
          {upcoming.map(a => (
            <li key={a.id} style={{ backgroundColor: '#d0f0ff', marginBottom: '10px', padding: '10px', borderRadius: '6px' }}>
              {a.provider_name} - {formatDate(a.appointment_date)} at {a.appointment_time} [{a.status}]
              <button onClick={() => cancelAppointment(a.id)} style={{ marginLeft: '1rem' }}>Cancel</button>
              <button onClick={() => openRescheduleModal(a.id)} style={{ marginLeft: '0.5rem' }}>Reschedule</button>
            </li>
          ))}
        </ul>
      )}

      <h3>Cancelled Appointments</h3>
      {cancelled.length === 0 ? (
        <p>No cancelled appointments</p>
      ) : (
        <ul>
          {cancelled.map(a => (
            <li key={a.id} style={{ backgroundColor: '#ffdada', marginBottom: '10px', padding: '10px', borderRadius: '6px' }}>
              {a.provider_name} - {formatDate(a.appointment_date)} at {a.appointment_time} [cancelled]
            </li>
          ))}
        </ul>
      )}

      <h3>Completed Appointments</h3>
      {completed.length === 0 ? (
        <p>No completed appointments</p>
      ) : (
        <ul>
          {completed.map(a => (
            <li key={a.id} style={{ backgroundColor: '#d4ffda', marginBottom: '10px', padding: '10px', borderRadius: '6px' }}>
              {a.provider_name} - {formatDate(a.appointment_date)} at {a.appointment_time} [completed]
              {!reviewedProviders.includes(a.provider_id) && (
                <button onClick={() => openReviewModal(a.provider_id)} style={{ marginLeft: '1rem' }}>Leave a Review</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reschedule Appointment</h3>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                fetchAvailableSlots(date);
              }}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
            />
            {availableSlots.length > 0 && (
              <>
                <p>Select Time:</p>
                <select onChange={(e) => setSelectedTime(e.target.value)} value={selectedTime}>
                  <option value="">-- Select Time --</option>
                  {availableSlots.map((slot, i) => (
                    <option key={i} value={slot.time}>
                      {slot.time} ({slot.remaining} left)
                    </option>
                  ))}
                </select>
              </>
            )}
            <br />
            <button onClick={handleRescheduleSubmit}>Confirm</button>
            <button onClick={() => setRescheduleModalOpen(false)} style={{ marginLeft: '1rem' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Leave a Review</h3>

      <label>Rating:</label><br />
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setReviewRating(star)}
            style={{
              cursor: 'pointer',
              color: star <= reviewRating ? '#ffc107' : '#e4e5e9'
            }}
          >
            ★
          </span>
        ))}
      </div>

      <label>Comment:</label><br />
      <textarea
        rows="4"
        value={reviewComment}
        onChange={(e) => setReviewComment(e.target.value)}
        style={{ width: '100%' }}
      /><br /><br />

      <button onClick={submitReview}>Submit</button>
      <button onClick={() => setReviewModal(false)} style={{ marginLeft: '1rem' }}>Cancel</button>
    </div>
  </div>
)}

    </div>
  );
};

export default AppointmentHistory;
