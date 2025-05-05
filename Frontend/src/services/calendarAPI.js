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

export async function fetchCategories(userId) {
  const res = await fetch(`${BASE}/categories?user_id=${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Fetch categories failed: ${res.status}`);
  return res.json();  // ได้ array ของ { id, user_id, name, color, ... }
}

export async function createCategory(cat) {
  const res = await fetch(`${BASE}/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(cat)
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

export async function updateCategory(id, cat) {
  const res = await fetch(`${BASE}/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(cat)
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

export async function deleteCategory(id, userId) {
  // สร้าง URL แล้วแนบ query param ให้ถูกต้อง
  const url = new URL(`${BASE}/categories/${id}`);
  url.searchParams.append('user_id', userId);

  const res = await fetch(url.toString(), {
      method: 'DELETE',
      headers: authHeaders(),
    });
 
    if (!res.ok) {
      const text = await res.text();
      console.error('DeleteCategory failed:', res.status, text);
      throw new Error(`${res.status} ${text}`);
    }
    return res.json();
  }