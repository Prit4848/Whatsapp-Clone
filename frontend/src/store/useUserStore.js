import { create } from "zustand";
import  axiosInstance  from "../services/axiosInstance";
import toast from "react-hot-toast";

export const useUserStore = create((set)=>({
    allUsers:null,

    setAllUsers:async ()=>{
      try {
          const response = await axiosInstance.get('/user/users')
          set({allUsers:response.data.data})
      } catch (error) {
        const errorMessage = error.response.data.message || error.message
        toast.error(`${errorMessage}`)
      }
    }
}))