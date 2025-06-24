const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ashuvadde2@gmail.com',
    pass: 'xrjn xhrg mejn feqn'
  }
});

// ✅ Book Appointment
router.post('/book', (req, res) => {
  const { user_id, provider_id, date, time } = req.body;

  db.query(
    'SELECT COUNT(*) AS count FROM appointments WHERE provider_id = ? AND appointment_date = ? AND appointment_time = ?',
    [provider_id, date, time],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Booking failed at check stage' });

      if (result[0].count >= 4) {
        return res.status(400).json({ error: 'This slot is fully booked. Please select another time.' });
      }

      db.query(
        'INSERT INTO appointments (user_id, provider_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
        [user_id, provider_id, date, time, 'upcoming'],
        (err) => {
          if (err) return res.status(500).json({ error: 'Booking failed while inserting' });

          db.query(
            'SELECT u.email, p.name AS provider_name FROM users u, providers p WHERE u.id = ? AND p.id = ?',
            [user_id, provider_id],
            (err, result) => {
              if (err || result.length === 0) {
                return res.json({ message: 'Appointment booked but email not sent' });
              }

              const { email, provider_name } = result[0];

              const mailOptions = {
                from: 'ashuvadde2@gmail.com',
                to: email,
                subject: 'Appointment Confirmation',
                text: `Your appointment with ${provider_name} has been confirmed for ${date} at ${time}.`
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error('Email error:', error);
                  return res.json({ message: 'Appointment booked, but failed to send email.' });
                } else {
                  return res.json({ message: 'Appointment booked and email sent!' });
                }
              });
            }
          );
        }
      );
    }
  );
});

// ✅ Get user appointments
// ✅ Get user appointments with accurate local time comparison
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
      a.appointment_time,
      a.status,
      a.id,
      a.provider_id,
      a.user_id,
      p.name AS provider_name
    FROM appointments a
    JOIN providers p ON a.provider_id = p.id
    WHERE a.user_id = ?
    ORDER BY a.appointment_date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to get appointments' });

    const now = new Date();

    const updates = [];

    results.forEach(appt => {
      const [hour, minute] = appt.appointment_time.split(':');
      const localDateTime = new Date(appt.appointment_date);
      localDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

      if (appt.status === 'upcoming' && localDateTime <= now) {
        updates.push({
          id: appt.id,
          status: 'completed'
        });
        appt.status = 'completed';
      }

      if (appt.status === 'rescheduled' && localDateTime > now) {
        appt.status = 'upcoming'; // optionally auto-correct back to upcoming
      }
    });

    // Batch update statuses if needed
    updates.forEach(update => {
      db.query('UPDATE appointments SET status = ? WHERE id = ?', [update.status, update.id]);
    });

    res.json(results);
  });
});


// ✅ Booked slots
router.get('/booked-slots/:providerId/:date', (req, res) => {
  const { providerId, date } = req.params;

  db.query(
    `SELECT appointment_time as time, COUNT(*) as count 
     FROM appointments 
     WHERE provider_id = ? AND appointment_date = ?
     GROUP BY appointment_time`,
    [providerId, date],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch booked slots' });
      res.json(results);
    }
  );
});

// ✅ Available slots
router.get('/available-slots/:providerId/:date', (req, res) => {
  const { providerId, date } = req.params;

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30"
  ];

  db.query(
    `SELECT DATE_FORMAT(appointment_time, '%H:%i') AS time, COUNT(*) as count 
     FROM appointments 
     WHERE provider_id = ? AND appointment_date = ? 
     AND status IN ('upcoming', 'rescheduled')
     GROUP BY time`,
    [providerId, date],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch slots' });

      const bookedMap = {};
      results.forEach(slot => {
        bookedMap[slot.time] = slot.count;
      });

      const slotsWithRemaining = timeSlots.map(time => ({
        time,
        remaining: 4 - (bookedMap[time] || 0)
      }));

      res.json(slotsWithRemaining);
    }
  );
});


// ✅ Cancel Appointment + Send Email
router.put('/cancel/:id', (req, res) => {
  const appointmentId = req.params.id;

  const sqlFetch = `
    SELECT a.appointment_date, a.appointment_time, u.email, p.name AS provider_name
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN providers p ON a.provider_id = p.id
    WHERE a.id = ?
  `;

  db.query(sqlFetch, [appointmentId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ error: 'Failed to fetch appointment info' });
    }

    const { email, appointment_date, appointment_time, provider_name } = result[0];

    db.query(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`, [appointmentId], (err2) => {
      if (err2) {
        return res.status(500).json({ error: 'Failed to cancel appointment' });
      }

      const mailOptions = {
        from: 'ashuvadde2@gmail.com',
        to: email,
        subject: 'Appointment Cancelled',
        text: `Your appointment with ${provider_name} on ${appointment_date} at ${appointment_time} has been cancelled.`
      };

      transporter.sendMail(mailOptions, (err3, info) => {
        if (err3) {
          console.error('Email send error:', err3);
          return res.json({ message: 'Appointment cancelled but email failed to send.' });
        } else {
          console.log('Cancellation email sent:', info.response);
          return res.json({ message: 'Appointment cancelled and email sent!' });
        }
      });
    });
  });
});

// ✅ Reschedule Appointment + Send Email
router.put('/reschedule/:id', (req, res) => {
  const appointmentId = req.params.id;
  const { newDate, newTime } = req.body;

  db.query(
    `SELECT COUNT(*) AS count FROM appointments 
     WHERE appointment_date = ? AND appointment_time = ? AND status IN ('upcoming', 'rescheduled')`,
    [newDate, newTime],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Reschedule check failed' });

      if (result[0].count >= 4) {
        return res.status(400).json({ error: 'Selected slot is fully booked. Please choose another.' });
      }

      const sqlFetch = `
        SELECT u.email, p.name AS provider_name
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        JOIN providers p ON a.provider_id = p.id
        WHERE a.id = ?
      `;

      db.query(sqlFetch, [appointmentId], (err, result) => {
        if (err || result.length === 0) {
          return res.status(500).json({ error: 'Failed to fetch email' });
        }

        const { email, provider_name } = result[0];

        const sqlUpdate = `
          UPDATE appointments 
          SET appointment_date = ?, appointment_time = ?, status = 'rescheduled' 
          WHERE id = ?
        `;
        db.query(sqlUpdate, [newDate, newTime, appointmentId], (err2) => {
          if (err2) {
            return res.status(500).json({ error: 'Failed to reschedule appointment' });
          }

          const mailOptions = {
            from: 'ashuvadde2@gmail.com',
            to: email,
            subject: 'Appointment Rescheduled',
            text: `Your appointment with ${provider_name} has been rescheduled to ${newDate} at ${newTime}.`
          };

          transporter.sendMail(mailOptions, (err3, info) => {
            if (err3) {
              console.error('Email send error:', err3);
              return res.json({ message: 'Appointment rescheduled but email failed to send.' });
            } else {
              console.log('Reschedule email sent:', info.response);
              return res.json({ message: 'Appointment rescheduled and email sent!' });
            }
          });
        });
      });
    }
  );
});

module.exports = router;