const BASE_URL = 'http://localhost:8000';

export async function fetchHealth() {
  try {
    const res = await fetch('http://localhost:8000/health');
    if (!res.ok) {
      return { status: 'offline', mode: 'demo', model_available: false };
    }
    return await res.json();
  } catch (err) {
    return { status: 'offline', mode: 'demo', model_available: false, error: 'Backend server is offline.' };
  }
}

export async function fetchStats() {
  try {
    const res = await fetch(`${BASE_URL}/api/analysis/stats`);
    if (!res.ok) {
      return { success: false, error: 'Failed to retrieve stats.' };
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to connect to backend.' };
  }
}

export async function fetchEvents() {
  try {
    const res = await fetch(`${BASE_URL}/api/analysis/events`);
    if (!res.ok) {
      return { success: false, events: [] };
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to fetch events from backend.', events: [] };
  }
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/detect/image`, {
      method: 'POST',
      body: formData
    });
  } catch (err) {
    throw new Error('Backend server is unreachable. Please ensure FastAPI is running at http://127.0.0.1:8000.');
  }

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.detail || 'CoastX image detection failed.');
  }

  return json;
}

export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('file', file);

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/detect/video`, {
      method: 'POST',
      body: formData
    });
  } catch (err) {
    throw new Error('Backend server is unreachable. Please ensure FastAPI is running at http://127.0.0.1:8000.');
  }

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.detail || 'CoastX video detection failed.');
  }

  return json;
}
