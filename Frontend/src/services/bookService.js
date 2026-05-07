import API from "./api";

export const getAllBooks = async (params = {}) => {
  const res = await API.get("/books", { params });
  return Array.isArray(res.data) ? res.data : [];
};

export const addBook = async (bookData) => {
  const res = await API.post("/books", bookData);
  return res.data;
};

export const updateBook = async (bookId, bookData) => {
  const res = await API.put(`/books/${bookId}`, bookData);
  return res.data;
};

export const deleteBook = async (bookId) => {
  const res = await API.delete(`/books/${bookId}`);
  return res.data;
};

export const getSavedBooks = async () => {
  const res = await API.get("/books/saved");
  return Array.isArray(res.data) ? res.data : [];
};

export const saveBook = async (bookId) => {
  const res = await API.post(`/books/${bookId}/save`);
  return res.data;
};

export const removeSavedBook = async (bookId) => {
  const res = await API.delete(`/books/${bookId}/save`);
  return res.data;
};
