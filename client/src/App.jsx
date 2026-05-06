import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [preview, setPreview] = useState(null);

  const API = "http://localhost:5000";

  // ================= FETCH NOTES =================
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API}/notes`, {
        headers: { Authorization: token },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setNotes(data);
        setFilteredNotes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  // ================= SEARCH =================
  const handleSearch = (value) => {
    const filtered = notes.filter((n) =>
      n.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredNotes(filtered);
  };

  // ================= AUTH =================
  const signup = async () => {
    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      alert(data.message || data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const login = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ================= UPLOAD =================
  const upload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        setTitle("");
        setFile(null);
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE =================
  const del = async (id) => {
    try {
      await fetch(`${API}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DRAG DROP =================
  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  // ================= LOGIN UI =================
  if (!token) {
    return (
      <div className="auth">
        <h2>Login / Signup</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
        <button onClick={signup}>Signup</button>
      </div>
    );
  }

  // ================= MAIN APP =================
  return (
    <div className="app">
      <h1>📒 Notes App</h1>
      <button onClick={logout}>Logout</button>

      {/* DRAG DROP */}
      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {file ? `Selected: ${file.name}` : "Drag & Drop file here"}
      </div>

      {/* UPLOAD */}
      <div className="upload">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={upload}>Upload</button>
      </div>

      {/* SEARCH */}
      <div className="search">
        <input
          placeholder="Search notes..."
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* NOTES */}
      <div className="notes">
        {filteredNotes.map((n) => (
          <div className="card" key={n._id}>
            <p>{n.title}</p>

            <button onClick={() => setPreview(n.fileUrl)}>
              Preview
            </button>

            <a href={n.fileUrl} target="_blank" rel="noreferrer">
              Open
            </a>

            <button onClick={() => del(n._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* PREVIEW */}
      {preview && (
        <div className="modal">
          <button onClick={() => setPreview(null)}>Close</button>

          {preview.endsWith(".pdf") ? (
            <iframe src={preview} title="preview" />
          ) : (
            <img src={preview} alt="preview" />
          )}
        </div>
      )}
    </div>
  );
}

export default App;