import { useState, useEffect } from "react"; 
import axios from "axios"; 
import BookModal from "../components/BookModal";
import "../styles/Catalog.css";

function Catalog() {
  const [books, setBooks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 1. FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
       
        const response = await axios.get("http://localhost:5000/api/books", {
          params: {
            genre: selectedCategory,
            search: searchQuery
          }
        });
        setBooks(response.data);
        setLoading(false);
      } catch {
      setError("Failed to fetch books. Please try again later.");
      setLoading(false);
    }
    };

    
    fetchBooks();
  }, [selectedCategory, searchQuery]);

  
  const categories = ["All", "Classic", "Dystopian", "Romance", "Adventure"];

  const handleOpenModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleBorrow = (bookId) => {
    alert(`Successfully borrowed book ID: ${bookId}`);
    handleCloseModal();
  };

  return (
    <>
      <h1>Catalog</h1>
      <p>Browse our collection of books directly from the library.</p>

      <div className="catalog-controls">
        <input
          type="text"
          placeholder="Search by title or author..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="loading">Loading books...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="catalog-grid">
          {books.length > 0 ? (
            books.map((book) => (
              <div
                key={book._id} // _id ang gamit sa MongoDB, hindi id
                className="book-card"
                onClick={() => handleOpenModal(book)}
                onKeyDown={(e) => e.key === "Enter" && handleOpenModal(book)}
                role="button"
                tabIndex={0}
              >
                <img src={book.image} alt={book.title} className="book-cover" />
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <span className="book-genre-tag">{book.genre}</span>
              </div>
            ))
          ) : (
            <p className="no-results">No books found matching your criteria.</p>
          )}
        </div>
      )}

      <BookModal book={selectedBook} isOpen={isModalOpen} onClose={handleCloseModal} onBorrow={handleBorrow} />
    </>
  );
}

export default Catalog;