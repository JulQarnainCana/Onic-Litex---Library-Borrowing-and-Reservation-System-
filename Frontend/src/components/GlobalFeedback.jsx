import { useFeedback } from "../context/FeedbackContext";
import "../styles/app.css";

export default function GlobalFeedback() {
  const { pendingRequests, toasts, dismissToast } = useFeedback();

  return (
    <>
      {pendingRequests > 0 ? <div className="global-loading-bar" /> : null}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-item--${toast.type}`}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismissToast(toast.id)}>
              x
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
