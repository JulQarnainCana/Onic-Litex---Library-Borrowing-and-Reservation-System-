import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api"; 
import "../styles/pages.css";

function EditProfileName({ name, onSave }) {
  const [fullName, setFullName] = useState(name);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    try {
      setIsUpdating(true);
      
      const res = await API.put("/users/profile", { name: fullName.trim() });
      
     
      onSave(res.data); 
      alert("Profile updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile.";
      alert("Error: " + msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form className="form-stack" onSubmit={handleSaveProfile}>
      <label>
        Full name
        <input 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          required 
          disabled={isUpdating}
        />
      </label>
      <button type="submit" className="btn-primary" disabled={isUpdating}>
        {isUpdating ? "Saving..." : "Save name"}
      </button>
    </form>
  );
}

export default function AccountScreen({ variant }) {
  const { user, updateProfile, logout, theme, setTheme, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  const initial = (user?.name || "?").trim().charAt(0).toUpperCase();
  
  
  const isAdminView = variant === "admin" || (variant !== "member" && isAdmin);

  const handlePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setIsChangingPass(true);
      
      await API.put("/users/change-password", { password });
      
      setPassword("");
      setConfirm("");
      alert("Password changed successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password.";
      alert("Error: " + msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`account-screen ${isAdminView ? "account-screen--admin" : "account-screen--member"}`}>
      <h1>{isAdminView ? "Administrator account" : "My Account"}</h1>
      <p>
        {isAdminView
          ? "Your Admin profile, edit Full name, edit password, Admin Settings, Sessions."
          : "Your profile, edit Full name, edit password, User Settings, Sessions."}
      </p>

      <div className="profile-layout">
        <aside className="profile-aside">
          <div className="avatar-lg" aria-hidden>
            {initial}
          </div>
          <strong>{user?.name}</strong>
          <span className="role-tag">{isAdmin ? "Administrator" : "Member"}</span>
          <span className="role-tag">{user?.email}</span>
        </aside>

        <div>
          <section className="profile-panel">
            <h3>Edit profile</h3>
            <EditProfileName
              key={String(user?.id ?? user?.email ?? "account")}
              name={user?.name ?? ""}
              onSave={updateProfile}
            />
          </section>

          <section className="profile-panel">
            <h3>Change password</h3>
            <form className="form-stack" onSubmit={handlePassword}>
              <label>
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isChangingPass}
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  disabled={isChangingPass}
                />
              </label>
              <button type="submit" className="btn-primary" disabled={isChangingPass}>
                {isChangingPass ? "Updating..." : "Update password"}
              </button>
            </form>
          </section>

          <section className="settings-card">
            <h3>Settings</h3>
            <div className="theme-toggle">
              <span>Dark mode</span>
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            </div>
          </section>

          <section className="settings-card">
            <h3>Session</h3>
            <button type="button" className="btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}