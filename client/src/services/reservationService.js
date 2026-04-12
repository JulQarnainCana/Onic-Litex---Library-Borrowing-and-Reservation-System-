import API from "./api";

export const reserveBook = async (reservationData) => {
  // reservationData = { userId, bookId }
  const res = await API.post("/reservations", reservationData);
  return res.data;
};

export const getMyReservations = async () => {
  const res = await API.get("/reservations/my-reservations");
  return res.data;
};