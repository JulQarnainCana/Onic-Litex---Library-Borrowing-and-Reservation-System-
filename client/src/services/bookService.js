import API from "./api";

export const getAllBooks = async () => {
  const res = await API.get("/books");
  return res.data;
};

export const addBook = async (bookData) => {
  const res = await API.post("/books", bookData);
  return res.data;
};

export const deleteBook = async (id) => {
  const res = await API.delete(`/books/${id}`);
  return res.data;
};