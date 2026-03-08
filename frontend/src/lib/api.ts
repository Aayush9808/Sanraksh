// Frontend API Client
// Axios instance with auth interceptors

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // Auth
  register: (data: any) => apiClient.post('/auth/register', data),
  verifyOTP: (data: any) => apiClient.post('/auth/verify-otp', data),

  // Users
  getUser: (userId: string) => apiClient.get(`/users/${userId}`),
  updateUser: (userId: string, data: any) => apiClient.put(`/users/${userId}`, data),

  // Policies
  calculatePremium: (data: any) => apiClient.post('/policies/calculate-premium', data),
  createPolicy: (data: any) => apiClient.post('/policies/create', data),
  getActivePolicies: (userId: string) => apiClient.get(`/policies/active?user_id=${userId}`),

  // Claims
  createClaim: (data: any) => apiClient.post('/claims/create', data),
  getClaimStatus: (claimId: string) => apiClient.get(`/claims/${claimId}/status`),
  getUserClaims: (userId: string) => apiClient.get(`/claims/user/${userId}`),

  // Risk Zones
  getRiskHeatmap: (city: string) => apiClient.get(`/risk-zones/heatmap?city=${city}`),
  getCityZones: (city: string) => apiClient.get(`/risk-zones/city/${city}`),

  // Disruptions
  getActiveDisruptions: () => apiClient.get('/disruptions/active'),

  // Analytics
  getDashboardStats: () => apiClient.get('/analytics/dashboard'),
};

export default apiClient;
