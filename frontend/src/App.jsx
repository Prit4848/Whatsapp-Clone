import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index/Index";
import NotFound from "./pages/notfound-page/NotFound";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import ProfilePage from "./pages/profile-setup/ProfilePage";

const App = () => {

  const {checkAuth,isCheckingAuth,authUser,connectSocket,disconnectSocket,socket} = useAuthStore()  
  const {setAllChats,activeChat,setMessage,initializeSocketListeners} = useChatStore()

  
  useEffect(() => {
    if (!isCheckingAuth) return;
    checkAuth();
  }, []);
  useEffect(() => {
    if (authUser) {
      setAllChats();
    }
  }, [authUser]);
  useEffect(() => {
    if (activeChat) {
      setMessage();
    }
  }, [activeChat]);
  useEffect(() => {
    if (authUser) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [authUser]);
  useEffect(() => {
    if(socket){
      initializeSocketListeners()
    }
  }, [socket])
  
  return (
    <>
    <Toaster position="top-center" />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Index/>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>

);
}

export default App;
