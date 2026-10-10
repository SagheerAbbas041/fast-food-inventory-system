
import axios from "axios";

// =====================================================
// API BASE URL
// =====================================================

const getApiBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL?.trim();

  // Production: use deployed backend URL from Vercel settings.
  if (envURL) {
    const normalizedURL = envURL.replace(/\/+$/, "");

    return normalizedURL.endsWith("/api")
      ? normalizedURL
      : `${normalizedURL}/api`;
  }

  // Local development fallback.
  if (import.meta.env.DEV) {
    return "http://localhost:5000/api";
  }

  // Avoid accidentally sending production requests to localhost.
  throw new Error(
    "VITE_API_URL is missing. Configure your deployed backend URL."
  );
};

// =====================================================
// AXIOS INSTANCE
// =====================================================

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
  withCredentials: true,
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        message:
          error.response.data?.message ||
          error.response.statusText,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error(
        "API connection failed. Check your backend URL, deployment status, and CORS configuration.",
        error.message
      );
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
