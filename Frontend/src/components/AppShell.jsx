import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";
import { registerApiHooks } from "../services/api";
import GlobalFeedback from "./GlobalFeedback";

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { setPendingRequests, pushToast } = useFeedback();

  useEffect(() => {
    registerApiHooks({
      onRequestChange: setPendingRequests,
      onError: (message) => pushToast(message, "error"),
      onAuthError: (message) => {
        logout();
        pushToast(message || "Session expired. Please log in again.", "error");
        navigate("/login", { replace: true, state: { from: location.pathname } });
      }
    });
  }, [location.pathname, logout, navigate, pushToast, setPendingRequests]);

  return (
    <>
      <GlobalFeedback />
      {children}
    </>
  );
}
