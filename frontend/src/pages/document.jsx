import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import '../pagesCSS/document.css';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Fetch all docs
  const fetchDocuments = async () => {
    try {
      setLoading(true);

      // IMPORTANT FIX: Use "." as search query to fetch everything
      const response = await fetch("https://connectwithaaditiyamg2.onrender.com/api/document/search?q=.");
      const data = await response.json();

      // Fetch full metadata for each
      const docsWithMetadata = await Promise.all(
        data.map(async (doc) => {
          const meta = await fetch(`https://connectwithaaditiyamg2.onrender.com/api/file/${doc.id}`);
          return await meta.json();
        })
      );

      setDocuments(docsWithMetadata);
      setFilteredDocs(docsWithMetadata);

    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredDocs(documents);
      return;
    }

    try {
      const response = await fetch(
        `https://connectwithaaditiyamg2.onrender.com/api/document/search?q=${encodeURIComponent(query)}`
      );
      const results = await response.json();

      const docsWithMetadata = await Promise.all(
        results.map(async (doc) => {
          const meta = await fetch(`https://connectwithaaditiyamg2.onrender.com/api/file/${doc.id}`);
          const fullMeta = await meta.json();
          return { ...fullMeta, score: doc.score };
        })
      );

      setFilteredDocs(docsWithMetadata);

    } catch (err) {
      console.error("Error searching docs:", err);
    }
  };

  // DOWNLOAD
  const handleDownload = async (docId) => {
    try {
      const res = await fetch(`https://connectwithaaditiyamg2.onrender.com/api/download/${docId}`);
      const data = await res.json();
      if (!data.downloadUrl) throw new Error("No download URL");

      window.open(data.downloadUrl, "_blank");
    } catch (err) {
      console.error("Error downloading:", err);
      alert("Failed to download file");
    }
  };

  // File icons
  const getFileIcon = (mime) => {
    if (!mime) return "📁";
    if (mime.includes("pdf")) return "📄";
    if (mime.includes("image")) return "🖼️";
    if (mime.includes("word")) return "📝";
    if (mime.includes("excel") || mime.includes("spreadsheet")) return "📊";
    return "📁";
  };

  // File size formatter
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="documents-container">

      {/* Header */}
      <div className="documents-header">
        <h1>Free Resources</h1>
        <p className="subtitle">{filteredDocs.length} document(s) available</p>
      </div>

      {/* Search */}
      <div className="search-container">
        <div className="search-box">
          <span className="search-icon"><Search/></span>

          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />

          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => handleSearch("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Documents */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading documents...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="no-documents">
          <span className="empty-icon">📭</span>
          <p>No documents found</p>
        </div>
      ) : (
        <div className="documents-grid">
          {filteredDocs.map((doc) => (
            <div key={doc._id} className="document-card">

              {/* Folder icon */}
              <div className="folder-icon">
                <div className="folder-top"></div>
                <div className="folder-body">
                  <span className="file-type-icon">{getFileIcon(doc.mimeType)}</span>
                </div>
              </div>

              {/* Info */}
              <div className="document-info">
                <h3 className="document-name" title={doc.originalName}>
                  {doc.originalName}
                </h3>
                <p className="document-size">{formatFileSize(doc.size)}</p>
              </div>

              {/* Download */}
              <button
                className="download-btn"
                onClick={() => handleDownload(doc._id)}
                title="Open / Download"
              >
                <span className="download-icon">⬇</span>
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
