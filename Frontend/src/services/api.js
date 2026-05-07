// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

let onRequestStateChange = null;
let onApiError = null;
let onUnauthorized = null;
let activeRequests = 0;

const notifyRequestState = () => {
  if (onRequestStateChange) {
    onRequestStateChange(activeRequests);
  }
};

export const registerApiHooks = ({ onRequestChange, onError, onAuthError } = {}) => {
  onRequestStateChange = onRequestChange || null;
  onApiError = onError || null;
  onUnauthorized = onAuthError || null;
};

API.interceptors.request.use((req) => {
  activeRequests += 1;
  notifyRequestState();
  // Babasahin na sa sessionStorage
  const token = sessionStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyRequestState();
    return response;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyRequestState();

    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (error.code === "ERR_NETWORK" ? "Unable to connect to the server." : "Something went wrong.");

    if (status === 401) {
      if (onUnauthorized) {
        onUnauthorized(message);
      }
    } else if (onApiError) {
      onApiError(message);
    }

    return Promise.reject(error);
  }
);

export default API;
