import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Books.css";
function Books() {
 
  const [savedBooks, setSavedBooks] = useState([
    { id: 2, title: "1984", author: "George Orwell", dateSaved: "Oct 12, 2023", image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400&auto=format&fit=crop" },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", dateSaved: "Oct 15, 2023", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop" },
    { id: 6, title: "Brave New World", author: "Aldous Huxley", dateSaved: "Oct 18, 2023", image: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=400&auto=format&fit=crop" }
  ]);

 
  const handleRemove = (id) => {
    setSavedBooks(savedBooks.filter(book => book.id !== id));
  };

  return (
    <>
      <h1>Books</h1>
      <p>Your personal collection of saved and bookmarked books.</p>

      <div className="saved-books-list">
        {savedBooks.length > 0 ? (
          savedBooks.map((book, index) => (
            <div
              className="saved-book-card"
              key={book.id}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <img src={book.image} alt={book.title} className="saved-book-cover" />

              <div className="saved-book-details">
                <h3 className="saved-book-title">{book.title}</h3>
                <p className="saved-book-author">{book.author}</p>
                <span className="saved-book-date">Bookmarked on {book.dateSaved}</span>
              </div>

              <div className="saved-book-actions">
                <button type="button" className="btn-read">
                  Read Now
                </button>
                <button type="button" className="btn-remove" onClick={() => handleRemove(book.id)}>
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
        )}
      </div>
    </>
  );
}

export default Books;