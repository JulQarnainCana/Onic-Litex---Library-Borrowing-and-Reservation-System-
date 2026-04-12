import API from "./api";

// REGISTER
export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

// LOGIN
export const loginUser = async (data) => {
  const response = await API.post("/auth/login", data);
  
 
  if (response.data.token) {
    sessionStorage.setItem("user", JSON.stringify(response.data.user));
    sessionStorage.setItem("token", response.data.token);
  }
  
  return response.data;
};

// LOGOUT
export const logoutUser = () => {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
};

// HELPER: Kunin ang kasalukuyang user data
export const getCurrentUser = () => {
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};