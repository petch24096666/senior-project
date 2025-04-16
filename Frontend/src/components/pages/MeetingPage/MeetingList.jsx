// 1. src/components/pages/MeetingPage/MeetingList.jsx
import React, { useEffect, useState, useContext } from 'react';
import { getMeetings, deleteMeeting } from '../../../utils/api';
import { UserContext } from '../../../context/Usercontext';
import { useNavigate } from 'react-router-dom';
import './MeetingPage.css';

const MeetingList = () => {
  const { customUser } = useContext(UserContext);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (customUser) {
      console.log("📡 Fetching meetings for user:", customUser.user_id);
      getMeetings(customUser.user_id).then(setMeetings);
    }
  }, [customUser]);

  const handleDelete = async (id) => {
    await deleteMeeting(id);
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="meeting-form-container">
      <div className="meeting-header">
        <h2 className="meeting-title">Your Meetings</h2>
        <p className="meeting-subtitle">Here are the meetings you’ve created</p>
        <div className="purple-underline" />
      </div>

      <button
        className="view-meeting-list-btn"
        onClick={() => navigate('/meeting')}
      >
        ← Back to Create Meeting
      </button>

      <div className="meeting-form-wrapper">
        {meetings.length === 0 ? (
          <p>No meetings scheduled yet.</p>
        ) : (
          meetings.map(m => (
            <div key={m.id} className="bg-white shadow rounded p-4 mb-4">
              <h3 className="text-lg font-semibold">{m.title}</h3>
              <p>{m.date} at {m.time} - {m.duration} mins</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => navigate(`/meeting/edit/${m.id}`)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(m.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MeetingList;