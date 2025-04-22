import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../../../context/Usercontext.jsx"; // ✅ ตรวจให้ตรงชื่อไฟล์จริง
import './MeetingList.css';

const MeetingList = () => {
  const { customUser } = useContext(UserContext);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!customUser) return;
    console.log("Current User:", customUser);
    const fetchMeetings = async () => {
      try {
        console.log(`Fetching meetings for user ID: ${customUser.user_id}`);
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/${customUser.user_id}`);
        console.log("Meetings fetched:", res.data);
        setMeetings(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch meetings:', err.response?.data || err.message);
      }
    };
    fetchMeetings();
  }, [customUser]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/${id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('❌ Failed to delete meeting:', err);
    }
  };

  const handleEdit = (meeting) => {
    navigate(`/meeting/edit/${meeting.id}`, { state: meeting });
  };

  return (
    <div className="meeting-list-container">
      <h1>My Meetings</h1>
        <button className="back-btn" onClick={() => navigate('/meeting')}>
            ⬅️ Back to Create Meeting
        </button>
      {meetings.length === 0 ? (
        <p>No meetings found.</p>
      ) : (
        meetings.map((meeting) => (
          <div key={meeting.id} className="meeting-card">
            <h3>{meeting.title}</h3>
            <p>📅 {meeting.date} at {meeting.time}</p>
            <p>⏱ {meeting.duration} minutes</p>
            <p>📡 Platform: {meeting.platform}</p>
            {meeting.join_url && (
              <a href={meeting.join_url} target="_blank" rel="noopener noreferrer">🔗 Join Meeting</a>
            )}
            <div className="button-group">
              <button className="edit-btn" onClick={() => handleEdit(meeting)}>✏️ Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(meeting.id)}>🗑 Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MeetingList;