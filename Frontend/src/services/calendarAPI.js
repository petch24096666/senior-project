// calendarAPI.js
const BASE = import.meta.env.VITE_API_BASE_URL + '/api/calendar';

function getAuthHeaders() {
  const provider = localStorage.getItem('authProvider'); // "google" หรือ "azure"
  const token =
    provider === 'google'
      ? localStorage.getItem('googleToken')
      : provider === 'azure'
      ? localStorage.getItem('microsoftToken')
      : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (provider) headers['X-Auth-Provider'] = provider;
  return headers;
}

  export async function fetchEvents(userId) {
    const url = new URL(`${BASE}/events`);
     url.searchParams.set('user_id', userId);
     const res = await fetch(url.toString(), {
       headers: getAuthHeaders()
     });
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

export async function createEvent(payload) {
  const res = await fetch(`${BASE}/events`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Create event failed');
  return res.json();
}

export async function updateEvent(id, payload) {
  const res = await fetch(`${BASE}/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Update event failed');
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${BASE}/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Delete event failed');
  return res.json();
}




export async function fetchCategories(userId) {
  const res = await fetch(`${BASE}/categories?user_id=${userId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Fetch categories failed: ${res.status}`);
  return res.json();  // ได้ array ของ { id, user_id, name, color, ... }
}

export async function createCategory(cat) {
  const res = await fetch(`${BASE}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cat)
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

export async function updateCategory(id, cat) {
  const res = await fetch(`${BASE}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
    });
 
    if (!res.ok) {
      const text = await res.text();
      console.error('DeleteCategory failed:', res.status, text);
      throw new Error(`${res.status} ${text}`);
    }
    return res.json();
  }
