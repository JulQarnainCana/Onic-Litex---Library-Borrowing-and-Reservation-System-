import API from "./api";

// ==========================================
//               USER FUNCTIONS
// ==========================================

// Kunin ang active loans ng current user
export const getMyLoans = async () => {
  try {
    const res = await API.get("/loans/my-loans");
    // Mas safe na approach sa pag-handle ng data
    return Array.isArray(res.data) ? res.data : (res.data.loans || []);
  } catch (error) {
    console.error("Error fetching my loans:", error);
    throw error;
  }
};

// Kunin ang history ng mga naibalik na libro ng current user
export const getMyHistory = async () => {
  try {
    const res = await API.get("/loans/my-history");
    return Array.isArray(res.data) ? res.data : (res.data.history || []);
  } catch (error) {
    console.error("Error fetching my history:", error);
    throw error;
  }
};

// Mag-borrow ng libro (User)
export const borrowBook = async (bookId) => {
  try {
    const res = await API.post("/loans/borrow", { bookId });
    return res.data;
  } catch (error) {
    console.error("Error borrowing book:", error);
    throw error;
  }
};


// ==========================================
//               ADMIN FUNCTIONS
// ==========================================

// Kunin ang LAHAT ng loans sa system (Para sa Admin 'ManageLoans' page)
export const getAllLoans = async () => {
  try {
    const res = await API.get("/loans");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching all loans:", error);
    throw error;
  }
};

// I-return ang libro (Para sa Admin 'ManageLoans' page)
export const returnBookAdmin = async (loanId) => {
  try {
    // Tumutugma sa backend route na PUT /api/loans/return/:id
    const res = await API.put(`/loans/return/${loanId}`);
    return res.data;
  } catch (error) {
    console.error("Error returning book:", error);
    throw error;
  }
};