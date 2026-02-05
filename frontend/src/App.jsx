import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index/Index";
import NotFound from "./pages/notfound-page/NotFound";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";

const App = () => {

  const {checkAuth,isCheckingAuth} = useAuthStore()  
  useEffect(() => {
    if (!isCheckingAuth) return;
    checkAuth()
  }, [])
  return (
    <>
    <Toaster position="top-center" />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>

);
}

export default App;
