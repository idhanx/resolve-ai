const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AUTH_TOKEN_KEY = 'resolve_auth_token';

export type UserRole = 'Employee' | 'Manager' | 'CTO' | 'COO' | 'CEO';

export interface ApiUser {
  id: string;
  employee_id: string;
  username: string | null;
  name: string;
  email: string | null;
  role: UserRole;
  department: string | null;
  reporting_manager_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
}

export interface ApiResponse<T> {
  [key: string]: T;
}

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail || data?.message || response.statusText;
    throw new Error(message);
  }

  return data as T;
}

export async function login(identifier: string, password: string) {
  const data = await request<{ access_token: string; user: ApiUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
  return data;
}

export async function getMe() {
  return request<ApiUser>('/api/auth/me');
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export async function fetchEmployeeComplaints() {
  return request<{ items: any[]; total: number }>('/api/complaints/my');
}

export async function fetchEmployeeComplaint(complaintId: string) {
  return request<any>(`/api/complaints/${complaintId}`);
}

export async function createComplaint(payload: any) {
  return request<any>('/api/complaints', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchNotifications() {
  return request<{ items: any[] }>('/api/notifications');
}

export async function markNotificationsRead() {
  return request<{ updated: number }>('/api/notifications/read', { method: 'POST' });
}

export async function fetchSurveys() {
  return request<{ items: any[] }>('/api/survey');
}

export async function submitSurvey(payload: any) {
  return request<any>('/api/survey', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyEmployeeComplaint(complaintId: string, payload: any) {
  return request<any>(`/api/employee/issues/${complaintId}/verify`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchManagerActions() {
  return request<{ items: any[] }>('/api/manager/actions');
}

export async function fetchManagerAction(complaintId: string) {
  return request<any>(`/api/manager/actions/${complaintId}`);
}

export async function updateManagerAction(complaintId: string, payload: any) {
  return request<any>(`/api/manager/actions/${complaintId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function completeManagerAction(complaintId: string) {
  return request<any>(`/api/manager/actions/${complaintId}/complete`, {
    method: 'POST',
  });
}

export async function fetchDeptSubmissions() {
  return request<{ items: any[] }>('/api/department-head/submissions');
}

export async function fetchDeptManagers() {
  return request<{ items: any[] }>('/api/department-head/managers');
}

export async function assignActionPlan(complaintId: string, payload: any) {
  return request<any>(`/api/department-head/submissions/${complaintId}/assign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCeoSubmissions() {
  return request<{ items: any[] }>('/api/ceo/submissions');
}
