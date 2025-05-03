// src/services/calendarAPI.js
// เรียกผ่าน Controller เดียวกันเสมอ
const BASE = import.meta.env.VITE_API_BASE_URL + '/api/calendar';

function authHeaders() {
  const provider = localStorage.getItem("authProvider");
  const token    = localStorage.getItem(
    provider === "google" ? "googleToken" : "microsoftToken"
  );
  console.log(">>> authHeaders:", { provider, token });
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "X-Auth-Provider": provider
  };
}

export async function fetchEvents() {
  const res = await fetch(`${BASE}/events`, { headers: authHeaders() });
  if (!res.ok) throw new Error(res.status);
  return (await res.json()).map(ev => ({
    ...ev,
    start: ev.start?new Date(ev.start):null,
    end:   ev.end?new Date(ev.end):null
  }));
}

export async function createEvent(e) {
  const res = await fetch(`${BASE}/events`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(e)
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

export async function updateEvent(id, e) {
  const res = await fetch(`${BASE}/events/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(e)
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${BASE}/events/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}
