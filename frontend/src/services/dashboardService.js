const API_BASE_URL = "http://127.0.0.1:8000";

async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("adminToken");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || "Unable to connect to the server.");
  }

  return data;
}

export const getDashboardStats = () =>
  apiRequest("/api/dashboard/stats");

export const getComplaints = () =>
  apiRequest("/api/complaints/");

export const getComplaintDetails = (id) =>
  apiRequest(`/api/complaints/${encodeURIComponent(id)}`);

export const getComplaintActions = (id) =>
  apiRequest(`/api/complaints/${encodeURIComponent(id)}/actions`);

export const getOverdueComplaints = () =>
  apiRequest("/api/reminders/overdue");

export const getEscalatedComplaints = () =>
  apiRequest("/api/escalations/");

export const updateComplaintStatus = (id, payload) =>
  apiRequest(`/api/complaints/${encodeURIComponent(id)}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });