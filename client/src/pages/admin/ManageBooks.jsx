import { useState, useEffect, useCallback } from "react";
import { getAllBooks, addBook, deleteBook } from "../../services/bookService";
import "../../styles/pages.css";
import "../../styles/bookmodal.css";

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
  }, []);

  const closeAddModal = () => {
    setAddModalOpen(false);
    setConfirmOpen(false);
    resetForm();
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
      await addBook(bookData);
      alert("Success! Book saved to catalog.");
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

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <>
      <h1>Admin Catalog Management</h1>
      <div className="manage-books-toolbar">
        <button type="button" className="btn-primary" onClick={() => setAddModalOpen(true)}>
          Add New Book
        </button>
      </div>

      {addModalOpen && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content modal-content--form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Book</h2>
              <button type="button" className="close-btn" onClick={closeAddModal}>&times;</button>
            </div>
            <form className="modal-form-stack" onSubmit={handleOpenConfirm}>
              <label>Image Source
                <input type="url" placeholder="Image URL" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImageDataUrl(""); }} disabled={Boolean(imageDataUrl)} />
                <input type="file" accept="image/*" onChange={handleFileChange} style={{marginTop: '5px'}} />
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
                  </select>
                </label>

                <label>ISBN * <input value={isbn} onChange={(e) => setIsbn(e.target.value)} required /></label>
              </div>

              <label>Description * <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="2" required /></label>
              <label>Number of Copies <input type="number" min={1} value={copiesCount} onChange={(e) => setCopiesCount(e.target.value)} required /></label>

              <div className="modal-actions">
                <button type="button" className="btn-modal-secondary" onClick={closeAddModal}>Cancel</button>
                <button type="submit" className="btn-primary">Review Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="modal-overlay modal-overlay--confirm" onClick={() => setConfirmOpen(false)}>
          <div className="modal-content modal-content--narrow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Confirm Entry</h2></div>
            <p>Save <strong>{title}</strong> under <strong>{genre}</strong>?</p>
            <div className="modal-actions">
              <button type="button" className="btn-modal-secondary" onClick={() => setConfirmOpen(false)}>Back</button>
              <button type="button" className="btn-primary" onClick={handleConfirmAdd}>Confirm & Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>ISBN</th>
              <th>Copies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b._id}>
                <td><img src={b.image} alt="" className="table-book-thumb" /></td>
                <td><strong>{b.title}</strong></td>
                <td>{b.author}</td>
                <td>{b.genre}</td>
                <td>{b.isbn}</td>
                <td>{b.availableCopies} / {b.copies}</td>
                <td>
                  <button type="button" className="btn-sm danger" onClick={() => remove(b._id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}