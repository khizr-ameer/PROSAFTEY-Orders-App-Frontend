import axios from "axios";

// Create an axios instance
const instance = axios.create({
  baseURL: "http://localhost:5000/api", // Change this to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional: handle unauthorized globally)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      // Redirect to login page (your route is "/")
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default instance;
