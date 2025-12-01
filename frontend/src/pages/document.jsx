import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Folder, File, Download, X, ChevronRight, Home, List, Grid, ArrowUpDown } from 'lucide-react';
import '../pagesCSS/document.css';

const Documents = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'size', 'type'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    fetchFolderContents(folderId || null);
  }, [folderId]);

  // Sort items when sortBy or sortOrder changes
  useEffect(() => {
    const sorted = sortItems([...filteredItems]);
    setFilteredItems(sorted);
  }, [sortBy, sortOrder]);

  // Sort function
  const sortItems = (itemsToSort) => {
    return itemsToSort.sort((a, b) => {
      // Always put folders first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.name || a.originalName || '').localeCompare(b.name || b.originalName || '');
          break;
        case 'date':
          comparison = new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'type':
          const typeA = getFileType(a);
          const typeB = getFileType(b);
          comparison = typeA.localeCompare(typeB);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  };

  // Fetch folder contents
  const fetchFolderContents = async (parentId) => {
    try {
      setLoading(true);
      const url = parentId 
        ? `https://connectwithaaditiyamg2.onrender.com/api/folder/contents?parentId=${parentId}`
        : `https://connectwithaaditiyamg2.onrender.com/api/folder/contents`;
      
      const response = await fetch(url);
      const data = await response.json();

      setItems(data.items || []);
      setFilteredItems(data.items || []);
      setCurrentFolder(data.currentFolder);
      
      // Build breadcrumb
      if (parentId) {
        await fetchBreadcrumb(parentId);
      } else {
        setBreadcrumb([]);
      }
      
      setSearchMode(false);
      setSearchQuery('');
    } catch (err) {
      console.error("Error fetching folder contents:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch breadcrumb for navigation
  const fetchBreadcrumb = async (itemId) => {
    try {
      const response = await fetch(`https://connectwithaaditiyamg2.onrender.com/api/item/${itemId}/breadcrumb`);
      const data = await response.json();
      setBreadcrumb(data.breadcrumb || []);
    } catch (err) {
      console.error("Error fetching breadcrumb:", err);
    }
  };

  // Search documents
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredItems(items);
      setSearchMode(false);
      return;
    }

    try {
      setSearchMode(true);
      const response = await fetch(
        `https://connectwithaaditiyamg2.onrender.com/api/search?q=${encodeURIComponent(query)}`
      );
      const results = await response.json();

      // Combine folders and files
      const combined = [...(results.folders || []), ...(results.files || [])];
      setFilteredItems(combined);
    } catch (err) {
      console.error("Error searching:", err);
    }
  };

  // Handle item click (navigate into folder or download file)
  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      navigate(`/resources/folder/${item._id}`);
    } else {
      handleDownload(item._id);
    }
  };

  // Download file
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

  // Get file icon with color
  const getFileIcon = (mime) => {
    if (!mime) return <File size={16} />;
    if (mime.includes("pdf")) return <File size={16} className="file-icon-pdf" />;
    if (mime.includes("image")) return <File size={16} className="file-icon-image" />;
    if (mime.includes("word")) return <File size={16} className="file-icon-word" />;
    if (mime.includes("excel") || mime.includes("spreadsheet")) return <File size={16} className="file-icon-excel" />;
    return <File size={16} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }) + ' ' + d.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFileType = (item) => {
    if (item.type === 'folder') return 'File folder';
    return item.mimeType?.split('/')[1]?.toUpperCase() || 'File';
  };

  return (
    <div className="documents-container">
      <div className="documents-header">
        <div className="title-section">
          <Folder size={24} className="folder-icon" />
          <h1 className="title">
            {searchMode ? 'Search Results' : (currentFolder?.name || 'Documents')}
          </h1>
        </div>
        <div className="header-actions">
          <div className="item-count">{filteredItems.length} items</div>
          
          {/* Sort Button */}
          <div className="sort-dropdown">
            <button 
              className="icon-button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              title="Sort"
            >
              <ArrowUpDown size={16} />
            </button>
            {showSortMenu && (
              <div className="sort-menu">
                <button 
                  className={`sort-option ${sortBy === 'name' ? 'active' : ''}`}
                  onClick={() => handleSort('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className={`sort-option ${sortBy === 'date' ? 'active' : ''}`}
                  onClick={() => handleSort('date')}
                >
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className={`sort-option ${sortBy === 'size' ? 'active' : ''}`}
                  onClick={() => handleSort('size')}
                >
                  Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className={`sort-option ${sortBy === 'type' ? 'active' : ''}`}
                  onClick={() => handleSort('type')}
                >
                  Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            )}
          </div>

          {/* View Toggle Buttons */}
          <button 
            className={`icon-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List size={16} />
          </button>
          <button 
            className={`icon-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {!searchMode && breadcrumb.length > 0 && (
        <div className="breadcrumb-container">
          <Link 
            to="/resources"
            className="breadcrumb-item"
          >
            <Home size={14} />
            <span>Documents</span>
          </Link>
          {breadcrumb.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <Link 
                to={`/resources/folder/${crumb.id}`}
                className="breadcrumb-item"
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="search-container">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => {
                handleSearch("");
                if (searchMode) {
                  fetchFolderContents(folderId || null);
                }
              }}
              className="clear-button"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty">
          <Folder size={48} className="empty-icon" />
          <p className="empty-text">
            {searchMode ? 'No results found' : 'This folder is empty'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="table-container">
          <table className="documents-table">
            <thead>
              <tr className="table-header">
                <th className="th name-column">Name</th>
                <th className="th">Date modified</th>
                <th className="th">Type</th>
                <th className="th">Size</th>
                <th className="th action-column"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr 
                  key={item._id} 
                  className="table-row"
                  onDoubleClick={() => handleItemClick(item)}
                >
                  <td className="td name-cell">
                    <div className="name-content">
                      {item.type === 'folder' ? (
                        <Folder size={16} className="folder-icon-small" />
                      ) : (
                        getFileIcon(item.mimeType)
                      )}
                      <span className="file-name">{item.name || item.originalName}</span>
                    </div>
                  </td>
                  <td className="td">{formatDate(item.updatedAt || item.createdAt)}</td>
                  <td className="td">{getFileType(item)}</td>
                  <td className="td">
                    {item.type === 'folder' ? '' : formatFileSize(item.size)}
                  </td>
                  <td className="td">
                    {item.type === 'file' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item._id);
                        }}
                        className="download-button"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid-container">
          {filteredItems.map((item) => (
            <div 
              key={item._id} 
              className="grid-item"
              onDoubleClick={() => handleItemClick(item)}
            >
              <div className="grid-icon">
                {item.type === 'folder' ? (
                  <Folder size={48} className="folder-icon-large" />
                ) : (
                  <div className="file-icon-large">
                    {getFileIcon(item.mimeType)}
                  </div>
                )}
              </div>
              <div className="grid-item-name" title={item.name || item.originalName}>
                {item.name || item.originalName}
              </div>
              {item.type === 'file' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item._id);
                  }}
                  className="grid-download-button"
                  title="Download"
                >
                  <Download size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;