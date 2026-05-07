import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AccountScreen from "./AccountScreen";


export default function MyAccount() {
  const { isAdmin } = useAuth();
  if (isAdmin) {
    return <Navigate to="/admin/account" replace />;
  }
  return <AccountScreen variant="member" />;
}
