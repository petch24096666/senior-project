// 2. src/utils/api.js
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export const getMeetings = async (userId) => {
  const res = await axios.get(`${BASE_URL}/meetings?userId=${userId}`);
  return res.data;
};

export const deleteMeeting = async (id) => {
  return await axios.delete(`${BASE_URL}/meetings/${id}`);
};

export const updateMeeting = async (id, data) => {
  return await axios.patch(`${BASE_URL}/meetings/${id}`, data);
};