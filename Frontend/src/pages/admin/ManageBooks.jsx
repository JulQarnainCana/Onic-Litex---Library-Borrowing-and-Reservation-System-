import { useState, useEffect, useCallback } from "react";
import { getAllBooks, addBook, updateBook, deleteBook } from "../../services/bookService";
import "../../styles/pages.css";
import "../../styles/bookmodal.css";
import { LoadingState } from "../../components/AsyncState";

function isAllowedImageFile(file) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  const typeOk = file.type === "image/jpeg" || file.type === "image/png";
  const extOk = /\.(jpe?g|png)$/i.test(name);
  return typeOk || extOk;
}

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");

  // Form States
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("Classic"); // Default sa enum mo
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [copiesCount, setCopiesCount] = useState("1");
  const [imageUrl, setImageUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllBooks();
      setBooks(data);
    } catch {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const resetForm = useCallback(() => {
    setTitle(""); setAuthor(""); setGenre("Classic");
    setIsbn(""); setDescription(""); setCopiesCount("1");
    setImageUrl(""); setImageDataUrl("");
    setIsEditing(false);
    setEditingId(null);
  }, []);

  const closeAddModal = () => {
    setAddModalOpen(false);
    setConfirmOpen(false);
    resetForm();
  };

  const handleEdit = (book) => {
    setIsEditing(true);
    setEditingId(book._id);
    setTitle(book.title || "");
    setAuthor(book.author || "");
    setGenre(book.genre || "Classic");
    setIsbn(book.isbn || "");
    setDescription(book.description || "");
    setCopiesCount(String(book.copies || 1));
    setImageUrl(book.image || "");
    setImageDataUrl("");
    setAddModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !isAllowedImageFile(file)) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(typeof reader.result === "string" ? reader.result : "");
      setImageUrl("");
    };
    reader.readAsDataURL(file);
  };

  const resolvedImage = imageDataUrl || imageUrl.trim();
  const genres = ["All", "Classic", "Dystopian", "Romance", "Adventure", "Other"];

  const filteredBooks = books.filter((book) => {
    const matchesGenre = genreFilter === "All" || book.genre === genreFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.isbn.toLowerCase().includes(query);

    return matchesGenre && matchesSearch;
  });

  const totalCopies = books.reduce((sum, book) => sum + (book.copies || 0), 0);
  const borrowedCopies = books.reduce(
    (sum, book) => sum + Math.max((book.copies || 0) - (book.availableCopies || 0), 0),
    0
  );
  const lowStockCount = books.filter((book) => (book.availableCopies || 0) <= 1).length;

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !isbn.trim() || !description.trim() || !resolvedImage) {
      alert("Please fill in all required fields including the cover image.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmAdd = async () => {
    // SINYNC SA BACKEND (Book.js): title, author, isbn, description, image, genre, copies, availableCopies
    const numCopies = parseInt(copiesCount, 10) || 1;

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      description: description.trim(),
      image: resolvedImage,
      genre: genre, // Classic, Dystopian, etc.
      copies: numCopies,
      availableCopies: numCopies 
    };

    try {
      if (isEditing && editingId) {
        await updateBook(editingId, bookData);
        alert("Success! Book updated.");
      } else {
        await addBook(bookData);
        alert("Success! Book saved to catalog.");
      }
      fetchBooks();
      closeAddModal();
    } catch (err) {
      const msg = err.response?.data?.message || "Check your input or admin permissions.";
      alert("SAVE FAILED: " + msg);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this book?")) return;
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch {
      alert("Delete failed.");
    }
  };

  if (loading) return <LoadingState message="Loading catalog records..." />;

  return (
    <>
      <h1>Admin Catalog Management</h1>
      <p>Track your collection, spot low-stock titles, and add new books from one workspace.</p>

      <div className="stats-grid manage-books-stats">
        <div className="stat-card">
          <div className="value">{books.length}</div>
          <div className="label">Catalog titles</div>
        </div>
        <div className="stat-card">
          <div className="value">{totalCopies}</div>
          <div className="label">Total copies in system</div>
        </div>
        <div className="stat-card">
          <div className="value">{borrowedCopies}</div>
          <div className="label">Copies currently borrowed</div>
        </div>
        <div className="stat-card">
          <div className="value">{lowStockCount}</div>
          <div className="label">Titles needing restock attention</div>
        </div>
      </div>

      <div className="page-card manage-books-hero">
        <div>
          <h2>Catalog Controls</h2>
          <p className="desc">Search by title, author, or ISBN, then narrow by genre before you add or remove books.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setAddModalOpen(true)}>
          Add New Book
        </button>
      </div>

      <div className="page-card manage-books-filters">
        <div className="manage-books-search-row">
          <input
            type="text"
            className="manage-books-search"
            placeholder="Search title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search ? (
            <button type="button" className="btn-modal-secondary manage-books-clear" onClick={() => setSearch("")}>
              Clear
            </button>
          ) : null}
        </div>
        <div className="manage-books-chip-row">
          {genres.map((genreOption) => (
            <button
              key={genreOption}
              type="button"
              className={`manage-books-chip ${genreFilter === genreOption ? "active" : ""}`}
              onClick={() => setGenreFilter(genreOption)}
            >
              {genreOption}
            </button>
          ))}
        </div>
      </div>

      {addModalOpen && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content modal-content--form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? "Update Book" : "Add New Book"}</h2>
              <button type="button" className="close-btn" onClick={closeAddModal}>&times;</button>
            </div>
            <form className="modal-form-stack" onSubmit={handleOpenConfirm}>
              <label>Image URL
                <input
                  type="url"
                  placeholder="https://example.com/book-cover.jpg"
                  value={imageUrl}
                  onChange={(e) => { setImageUrl(e.target.value); setImageDataUrl(""); }}
                  disabled={Boolean(imageDataUrl)}
                />
              </label>

              <label>Or upload cover image
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <label>Title * <input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
                <label>Author * <input value={author} onChange={(e) => setAuthor(e.target.value)} required /></label>
                
                <label>Genre *
                  <select value={genre} onChange={(e) => setGenre(e.target.value)} required>
                    <option value="Classic">Classic</option>
                    <option value="Dystopian">Dystopian</option>
                    <option value="Romance">Romance</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>ISBN * <input value={isbn} onChange={(e) => setIsbn(e.target.value)} required /></label>
              </div>

              <label>Description * <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="2" required /></label>
              

              
              <label>Total Number of Copies 
                <input 
                  type="number" 
                  min={1} 
                  value={copiesCount} 
                  onChange={(e) => setCopiesCount(e.target.value)} 
                  required 
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-modal-secondary" onClick={closeAddModal}>Cancel</button>
                <button type="submit" className="btn-primary">{isEditing ? "Review Update" : "Review Details"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="modal-overlay modal-overlay--confirm" onClick={() => setConfirmOpen(false)}>
          <div className="modal-content modal-content--narrow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? "Confirm Update" : "Confirm Entry"}</h2></div>
            <p>{isEditing ? "Update" : "Save"} <strong>{title}</strong> under <strong>{genre}</strong>?</p>
            <div className="modal-actions">
              <button type="button" className="btn-modal-secondary" onClick={() => setConfirmOpen(false)}>Back</button>
              <button type="button" className="btn-primary" onClick={handleConfirmAdd}>{isEditing ? "Confirm Update" : "Confirm & Save"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="data-table-wrap manage-books-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>ISBN</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="manage-books-empty">
                    <strong>No books matched your filters.</strong>
                    <span>Try a different search keyword or switch the selected genre.</span>
                  </div>
                </td>
              </tr>
            ) : filteredBooks.map((b) => (
              <tr key={b._id}>
                <td><img src={b.image} alt="" className="table-book-thumb" /></td>
                <td>
                  <div className="manage-books-title-cell">
                    <strong>{b.title}</strong>
                    <span>{b.description?.slice(0, 72) || "No description available."}{b.description?.length > 72 ? "..." : ""}</span>
                  </div>
                </td>
                <td>{b.author}</td>
                <td><span className="badge badge-muted">{b.genre}</span></td>
                <td>{b.isbn}</td>
                <td>
                  <div className="manage-books-stock">
                    <strong>{b.availableCopies} / {b.copies}</strong>
                    <span className={`badge ${b.availableCopies === 0 ? "badge-danger" : b.availableCopies <= 1 ? "badge-warn" : "badge-success"}`}>
                      {b.availableCopies === 0 ? "Out of stock" : b.availableCopies <= 1 ? "Low stock" : "Available"}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="btn-row">
                    <button type="button" className="btn-sm secondary" onClick={() => handleEdit(b)}>Update</button>
                    <button type="button" className="btn-sm danger" onClick={() => remove(b._id)}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
