import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { borrowBook, getMyLoans } from '../services/loanService'; 
import { reserveBook } from '../services/reservationService';
import { getSavedBooks, saveBook } from '../services/bookService';
import '../styles/bookmodal.css'; 

function BookModal({ book, isOpen, onClose, onActionSuccess, onSaveSuccess, initiallySaved = false }) {
  const { user } = useAuth();
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [hasBorrowed, setHasBorrowed] = useState(false);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  
  const MAX_BORROW_LIMIT = 3;

 
  useEffect(() => {
    const checkUserLoan = async () => {
      if (isOpen && user && book) {
        try {
          const loans = await getMyLoans();
          
          const alreadyBorrowed = loans.some(
            (loan) => loan.book._id === book._id && loan.status === "borrowed"
          );
          setHasBorrowed(alreadyBorrowed);
          setActiveLoansCount(loans.length);
        } catch (err) {
          console.error("Error checking loans:", err);
        }
      }
    };
    checkUserLoan();
  }, [isOpen, user, book]);

  useEffect(() => {
    setIsSaved(initiallySaved);
  }, [book?._id, isOpen, initiallySaved]);

  useEffect(() => {
    const checkSavedState = async () => {
      if (!isOpen || !user || !book?._id) return;

      try {
        const savedBooks = await getSavedBooks();
        const alreadySaved = savedBooks.some((savedBook) => savedBook._id === book._id);
        setIsSaved(alreadySaved);
      } catch (err) {
        console.error("Error checking saved books:", err);
      }
    };

    checkSavedState();
  }, [isOpen, user, book?._id]);

  if (!isOpen || !book) return null;

  const handleBorrow = async () => {
    if (!user) return alert("Please login to borrow a book.");
    
    setBorrowLoading(true);
    try {
      const response = await borrowBook(book._id);
      alert(response.message || "Book borrowed successfully!");
      if (onActionSuccess) onActionSuccess(); 
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Borrowing failed.");
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!user) return alert("Please login to reserve.");
    
    setBorrowLoading(true);
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
      setBorrowLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return alert("Please login to save a book.");
    if (isSaved) return;

    setSaveLoading(true);
    try {
      const response = await saveBook(book._id);
      setIsSaved(true);
      if (onSaveSuccess) onSaveSuccess(book._id);
      alert(response.message || "Book saved successfully!");
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save book.";
      if (message === "Book already saved") {
        setIsSaved(true);
        if (onSaveSuccess) onSaveSuccess(book._id);
      }
      alert(message);
    } finally {
      setSaveLoading(false);
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
          <button
            className={`action-btn save-btn ${isSaved ? "save-btn--saved" : ""}`}
            onClick={handleSave}
            disabled={saveLoading || isSaved}
          >
            {isSaved ? "Saved" : saveLoading ? "Saving..." : "Save Book"}
          </button>
          {/* STEP 1: Check kung hiram na ng user ang libro */}
          {hasBorrowed ? (
            <button className="action-btn" disabled style={{ backgroundColor: '#bdc3c7', cursor: 'not-allowed' }}>
              You currently have this book
            </button>
          ) : activeLoansCount >= MAX_BORROW_LIMIT ? (
            <button className="action-btn" disabled style={{ backgroundColor: '#e74c3c', color: '#fff', cursor: 'not-allowed', opacity: 0.75 }}>
              Borrow Limit Reached ({activeLoansCount}/{MAX_BORROW_LIMIT})
            </button>
          ) : (
            /* STEP 2: Kung hindi pa hiram at hindi pa puno, ipakita ang normal na logic */
            <>
              {book.availableCopies > 0 ? (
                <button 
                  className="borrow-btn action-btn" 
                  onClick={handleBorrow}
                  disabled={borrowLoading}
                >
                  {borrowLoading ? "Processing..." : "Borrow Book"}
                </button>
              ) : (
                <button 
                  className="borrow-btn reserve-btn-style action-btn" 
                  onClick={handleReserve}
                  disabled={borrowLoading}
                  style={{ backgroundColor: '#f39c12' }} 
                >
                  {borrowLoading ? "Processing..." : "Reserve (Waitlist)"}
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
