import {useAuthStore} from "../../store/useAuthStore";
import Login from "../user-login/Login";
import ProfileSetup from "../profile-setup/ProfileSetup";
import Chat from "../chat-section/Chat";

function Index() {
  const { isAuthenticated, isProfileComplete } = useAuthStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!isProfileComplete) {
    return <ProfileSetup />;
  }

  return <Chat />;
}

export default Index;