import axios from 'axios'

const apiUrl = `${import.meta.env.VITE_BASE_URI}/api/v1`

const axiosInstance = axios.create({baseURL:apiUrl,withCredentials:true})

// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default axiosInstance;
