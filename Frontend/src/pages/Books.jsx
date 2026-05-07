import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSavedBooks, removeSavedBook } from "../services/bookService";
import "../styles/Books.css";

function Books() {
  const navigate = useNavigate();
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSavedBooks = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getSavedBooks();
        setSavedBooks(data);
      } catch (err) {
        console.error("Error fetching saved books:", err);
        setError(err.response?.data?.message || "Failed to load saved books.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedBooks();
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeSavedBook(id);
      setSavedBooks((prev) => prev.filter((book) => book._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove saved book.");
    }
  };

  const formatSavedDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

  const handleReadNow = (book) => {
    navigate("/catalog", {
      state: {
        openBookId: book._id,
        openSavedBook: true
      }
    });
  };

  return (
    <>
      <h1>Books</h1>
      <p>Your personal collection of saved and bookmarked books.</p>

      <div className="saved-books-list">
        {loading ? (
          <div className="empty-state">
            <h3>Loading saved books...</h3>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load books</h3>
            <p>{error}</p>
          </div>
        ) : (
          savedBooks.length > 0 ? (
            savedBooks.map((book, index) => (
              <div
                className="saved-book-card"
                key={book._id}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <img src={book.image} alt={book.title} className="saved-book-cover" />

                <div className="saved-book-details">
                  <h3 className="saved-book-title">{book.title}</h3>
                  <p className="saved-book-author">{book.author}</p>
                  <span className="saved-book-date">Bookmarked on {formatSavedDate(book.savedAt)}</span>
                </div>

                <div className="saved-book-actions">
                  <button type="button" className="btn-read" onClick={() => handleReadNow(book)}>
                    Read Now
                  </button>
                  <button type="button" className="btn-remove" onClick={() => handleRemove(book._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No books saved yet</h3>
              <p>Explore our catalog and bookmark your favorite titles.</p>
              <Link to="/catalog">
                <button type="button" className="btn-read" style={{ marginTop: "1rem" }}>
                  Browse Catalog
                </button>
              </Link>
            </div>
          )
        )}
      </div>
    </>
  );
}

export default Books;
