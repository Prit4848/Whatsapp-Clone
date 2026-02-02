import axios from 'axios'

const apiUrl = `${import.meta.env.VITE_BASE_URI}/api/v1`

const axiosInstance = axios.create({baseURL:apiUrl,withCredentials:true})

export default axiosInstance;
