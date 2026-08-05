import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    const prefix = "Bearer";
    const space = " ";
    config.headers.Authorization = prefix + space + token;
  }
  return config;
});

export default API;