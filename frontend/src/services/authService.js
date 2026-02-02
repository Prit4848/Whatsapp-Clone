import axiosInstance from "./axiosInstance"

export const sendOtp = async (data) =>{
  try {
    const response = await axiosInstance.post("/auth/send-otp",data)
    return response.data
  } catch (error) {
    throw new Error(error.message)
  }
}

export const verifyOtp = async (data)=>{
    try {
        const response = await axiosInstance.post("/auth/verify-otp",data);
        return response.data;
    } catch (error) {
        throw new Error(error.message)
    }
}

export const getProfile = async ()=>{
    try {
        const response = await axiosInstance.post("/auth/verify-otp");
        return response.data;
    } catch (error) {
       throw new Error(error.message)
    }
}

export const logout = async ()=>{
    try {
         const response = await axiosInstance.get("/auth/logout");
        return response.data;
    } catch (error) {
         throw new Error(error.message)
    }
}