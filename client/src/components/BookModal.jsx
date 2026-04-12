import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { borrowBook, getMyLoans } from '../services/loanService'; 
import { reserveBook } from '../services/reservationService';
import '../styles/bookmodal.css'; 

function BookModal({ book, isOpen, onClose, onActionSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasBorrowed, setHasBorrowed] = useState(false);

 
  useEffect(() => {
    const checkUserLoan = async () => {
      if (isOpen && user && book) {
        try {
          const loans = await getMyLoans();
          
          const alreadyBorrowed = loans.some(
            (loan) => loan.book._id === book._id && loan.status === "borrowed"
          );
          setHasBorrowed(alreadyBorrowed);
        } catch (err) {
          console.error("Error checking loans:", err);
        }
      }
    };
    checkUserLoan();
  }, [isOpen, user, book]);

  if (!isOpen || !book) return null;

  const handleBorrow = async () => {
    if (!user) return alert("Please login to borrow a book.");
    
    setLoading(true);
    try {
      const response = await borrowBook(book._id);
      alert(response.message || "Book borrowed successfully!");
      if (onActionSuccess) onActionSuccess(); 
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Borrowing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!user) return alert("Please login to reserve.");
    
    setLoading(true);
    try {
      const response = await reserveBook({ 
        userId: user.id || user._id, 
        bookId: book._id 
      });
      alert(response.message || "Added to waitlist!");
      if (onActionSuccess) onActionSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Reservation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{book.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-image-wrapper">
            <img src={book.image} alt={book.title} className="modal-book-cover" />
          </div>
          <div className="modal-text-details">
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Genre:</strong> {book.genre}</p> 
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Description:</strong> {book.description}</p>
            <p className="available-copies">
              <strong>Available Copies:</strong> 
              <span className={book.availableCopies > 0 ? "text-success" : "text-danger"}>
                {book.availableCopies}
              </span>
            </p>
          </div>
        </div>

        <div className="modal-footer-centered">
          {/* STEP 1: Check kung hiram na ng user ang libro */}
          {hasBorrowed ? (
            <button className="action-btn" disabled style={{ backgroundColor: '#bdc3c7', cursor: 'not-allowed' }}>
              You currently have this book
            </button>
          ) : (
            /* STEP 2: Kung hindi pa hiram, ipakita ang normal na logic */
            <>
              {book.availableCopies > 0 ? (
                <button 
                  className="borrow-btn action-btn" 
                  onClick={handleBorrow}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Borrow Book"}
                </button>
              ) : (
                <button 
                  className="borrow-btn reserve-btn-style action-btn" 
                  onClick={handleReserve}
                  disabled={loading}
                  style={{ backgroundColor: '#f39c12' }} 
                >
                  {loading ? "Processing..." : "Join Wait List (Reserve)"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookModal;