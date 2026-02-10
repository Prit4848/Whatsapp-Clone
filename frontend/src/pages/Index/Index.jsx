import {useAuthStore} from "../../store/useAuthStore";
import Login from "../user-login/Login";
import ProfileSetup from "../profile-setup/ProfileSetup";
import Chat from "../chat-section/Chat";
import AppLoader from "../../components/Loader";

function Index() {
  const { isAuthenticated, isProfileComplete,isCheckingAuth } = useAuthStore();

   if (isCheckingAuth) {
    return <AppLoader/>;
  }
  if (!isAuthenticated) {
    return <Login />;
  }

  if (!isProfileComplete) {
    return <ProfileSetup />;
  }

  return <Chat />;
}

export default Index;