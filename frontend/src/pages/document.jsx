import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Folder, File, Download, X, ChevronRight, Home, List, Grid, ArrowUpDown, Link as LinkIcon, ExternalLink, ListIcon, ArrowLeft,Code2,Terminal } from 'lucide-react';
import '../pagesCSS/document.css';

const Documents = () => {
  const { folderId, excelId } = useParams();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Excel viewing state
  const [excelData, setExcelData] = useState(null);
  const [viewingExcel, setViewingExcel] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);

  useEffect(() => {
    if (excelId) {
      loadExcelDataById(excelId);
    } else {
      fetchFolderContents(folderId || null);
    }
  }, [folderId, excelId]);

  useEffect(() => {
    const sorted = sortItems([...filteredItems]);
    setFilteredItems(sorted);
  }, [sortBy, sortOrder]);

  const sortItems = (itemsToSort) => {
    return itemsToSort.sort((a, b) => {
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
      
      if (parentId) {
        await fetchBreadcrumb(parentId);
      } else {
        setBreadcrumb([]);
      }
      
      setSearchMode(false);
      setSearchQuery('');
      setViewingExcel(null);
      setExcelData(null);
    } catch (err) {
      console.error("Error fetching folder contents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreadcrumb = async (itemId) => {
    try {
      const response = await fetch(`https://connectwithaaditiyamg2.onrender.com/api/item/${itemId}/breadcrumb`);
      const data = await response.json();
      setBreadcrumb(data.breadcrumb || []);
    } catch (err) {
      console.error("Error fetching breadcrumb:", err);
    }
  };

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

      const combined = [
        ...(results.folders || []), 
        ...(results.files || []),
        ...(results.links || []),
        ...(results.excels || [])
      ];
      setFilteredItems(combined);
    } catch (err) {
      console.error("Error searching:", err);
    }
  };

  const loadExcelDataById = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`https://connectwithaaditiyamg2.onrender.com/api/excel/${id}/data`);
      const data = await res.json();
      
      setExcelData(data);
      setViewingExcel({ _id: id, name: data.name || 'Excel File' });
      setSelectedSheet(data.sheetNames?.[0] || null);
    } catch (err) {
      console.error('Error loading Excel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeExcelView = () => {
    navigate('/resources');
  };

  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      navigate(`/resources/folder/${item._id}`);
    } else if (item.type === 'link') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.type === 'excel') {
      navigate(`/resources/list/${item._id}`);
    } else {
      handleDownload(item._id);
    }
  };

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

  const getFileIcon = (item) => {
    if (item.type === 'link') return <LinkIcon size={16} className="file-icon-link" />;
    if (item.type === 'excel') return <ListIcon size={16} className="file-icon-excel" />;
    
    const mime = item.mimeType;
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
    if (item.type === 'link') return 'Link';
    if (item.type === 'excel') return 'List';
    return item.mimeType?.split('/')[1]?.toUpperCase() || 'File';
  };

  const isURL = (value) => {
    if (typeof value !== 'string') return false;
    if (!value || value.trim() === '') return false;
    
    const stringValue = value.trim();
    
    const urlPattern = /^(https?:\/\/)/i;
    if (urlPattern.test(stringValue)) {
      try {
        new URL(stringValue);
        return true;
      } catch {
        return false;
      }
    }
    
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(\/.*)?$/;
    if (domainPattern.test(stringValue)) {
      try {
        new URL('https://' + stringValue);
        return true;
      } catch {
        return false;
      }
    }
    
    return false;
  };
const getCodingPlatformIcon = (url) => {
  const urlLower = url.toLowerCase();
  
  // GeeksforGeeks
  if (urlLower.includes('geeksforgeeks.org') || urlLower.includes('gfg.org')) {
    return <img src="https://media.geeksforgeeks.org/gfg-gg-logo.svg" alt="GFG" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // LeetCode
  if (urlLower.includes('leetcode.com')) {
    return <img src="https://leetcode.com/favicon.ico" alt="LeetCode" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // HackerRank
  if (urlLower.includes('hackerrank.com')) {
    return <img src="https://www.hackerrank.com/wp-content/uploads/2020/05/hackerrank_cursor_favicon_480px-150x150.png" alt="HackerRank" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // CodeChef
  if (urlLower.includes('codechef.com')) {
    return <img src="https://cdn.codechef.com/images/cc-logo.svg" alt="CodeChef" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // Codeforces
  if (urlLower.includes('codeforces.com')) {
    return <img src="https://codeforces.org/s/0/favicon-32x32.png" alt="Codeforces" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // HackerEarth
  if (urlLower.includes('hackerearth.com')) {
    return <img src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/logos/hackerearth-xbfvysgxrsn2j02f5cxoh6.png/hackerearth-88ifrxvj4oup9czcvfx5xt.png?_a=DATAg1AAZAA0" alt="HackerEarth" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // InterviewBit
  if (urlLower.includes('interviewbit.com')) {
    return <img src="https://www.interviewbit.com/favicon.ico" alt="InterviewBit" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // Coding Ninjas
  if (urlLower.includes('codingninjas.com') || urlLower.includes('naukri.com/code360')) {
    return <img src="https://files.codingninjas.in/favicon1-27190.ico" alt="Coding Ninjas" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // SPOJ
  if (urlLower.includes('spoj.com')) {
    return <LinkIcon size={20} style={{color: 'red', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // CP-Algorithms
  if (urlLower.includes('cp-algorithms.com')) {
    return <LinkIcon size={14} style={{color: 'red', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // Topcoder
  if (urlLower.includes('topcoder.com')) {
    return <img src="https://www.topcoder.com/favicon.ico" alt="Topcoder" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // AtCoder
  if (urlLower.includes('atcoder.jp')) {
    return <img src="https://img.atcoder.jp/assets/favicon.png" alt="AtCoder" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // GitHub
  if (urlLower.includes('github.com')) {
    return <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // LeetCode Discuss/Articles
  if (urlLower.includes('leetcode.') && (urlLower.includes('/discuss/') || urlLower.includes('/articles/'))) {
    return <img src="https://leetcode.com/favicon.ico" alt="LeetCode" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // CodeSignal
  if (urlLower.includes('codesignal.com') || urlLower.includes('app.codesignal.com')) {
    return <img src="https://codesignal.com/favicon.ico" alt="CodeSignal" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // Codewars
  if (urlLower.includes('codewars.com')) {
    return <img src="https://www.codewars.com/favicon.ico" alt="Codewars" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // Exercism
  if (urlLower.includes('exercism.org') || urlLower.includes('exercism.io')) {
    return <img src="https://exercism.org/favicon.ico" alt="Exercism" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // Project Euler
  if (urlLower.includes('projecteuler.net')) {
    return <Terminal size={20} style={{color: '#0C3C5E', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // Kaggle
  if (urlLower.includes('kaggle.com')) {
    return <img src="https://www.kaggle.com/static/images/favicon.ico" alt="Kaggle" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // Brilliant
  if (urlLower.includes('brilliant.org')) {
    return <img src="https://brilliant.org/favicon.ico" alt="Brilliant" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // USACO
  if (urlLower.includes('usaco.org')) {
    return <Code2 size={20} style={{color: '#4169E1', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // CSES (Code Submission Evaluation System)
  if (urlLower.includes('cses.fi')) {
    return <Terminal size={20} style={{color: '#1a1a1a', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // Kattis
  if (urlLower.includes('kattis.com') || urlLower.includes('open.kattis.com')) {
    return <img src="https://open.kattis.com/favicon" alt="Kattis" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // UVa Online Judge
  if (urlLower.includes('onlinejudge.org') || urlLower.includes('uva.onlinejudge.org')) {
    return <Code2 size={20} style={{color: '#006400', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // Toph
  if (urlLower.includes('toph.co')) {
    return <Terminal size={20} style={{color: '#FF6B35', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // DMOJ
  if (urlLower.includes('dmoj.ca')) {
    return <Code2 size={20} style={{color: '#2C3E50', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // Binarysearch
  if (urlLower.includes('binarysearch.com')) {
    return <Terminal size={20} style={{color: '#00D9FF', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // AlgoExpert
  if (urlLower.includes('algoexpert.io')) {
    return <img src="https://www.algoexpert.io/favicon.ico" alt="AlgoExpert" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // StrataScratch
  if (urlLower.includes('stratascratch.com')) {
    return <Terminal size={20} style={{color: '#FF4081', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // Pramp
  if (urlLower.includes('pramp.com')) {
    return <Code2 size={20} style={{color: '#00BFA5', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // CodinGame
  if (urlLower.includes('codingame.com')) {
    return <img src="https://www.codingame.com/favicon.ico" alt="CodinGame" style={{width: '20px' , height: '20px', marginRight: '4px'}} />;
  }
  
  // Advent of Code
  if (urlLower.includes('adventofcode.com')) {
    return <Terminal size={20} style={{color: '#00cc00', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // Edabit
  if (urlLower.includes('edabit.com')) {
    return <Code2 size={20} style={{color: '#5A67D8', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // CS Academy
  if (urlLower.includes('csacademy.com')) {
    return <Terminal size={20} style={{color: '#E74C3C', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // LightOJ
  if (urlLower.includes('lightoj.com')) {
    return <Code2 size={20} style={{color: '#FFA500', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // Sphere Online Judge (SPOJ alternative check)
  if (urlLower.includes('sphere') && urlLower.includes('online')) {
    return <Code2 size={20} style={{color: '#2F4F4F', marginRight: '4px', flexShrink: 0}} />;
  }
  
  // Default link icon for non-coding platforms
  return <LinkIcon size={20} style={{color: 'red', marginRight: '4px', flexShrink: 0}} />;
};
 const renderCellValue = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  
  const stringValue = String(value).trim();
  
  if (isURL(stringValue)) {
    let fullUrl = stringValue;
    if (!stringValue.startsWith('http://') && !stringValue.startsWith('https://')) {
      fullUrl = 'https://' + stringValue;
    }
    
    let displayText = stringValue;
    try {
      const urlObj = new URL(fullUrl);
      displayText = urlObj.hostname;
      if (urlObj.pathname && urlObj.pathname !== '/') {
        const pathPart = urlObj.pathname.substring(0, 15);
        displayText += pathPart + (urlObj.pathname.length > 15 ? '...' : '');
      }
    } catch (e) {
      displayText = stringValue.substring(0, 35) + (stringValue.length > 35 ? '...' : '');
    }
    
    return (
      <a 
        href={fullUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="excel-table-link"
        onClick={(e) => e.stopPropagation()}
        title={fullUrl}
      >
        {getCodingPlatformIcon(fullUrl)}
        {/* displayText removed as per your original code */}
      </a>
    );
  }
  
  return stringValue;
};

  const renderExcelTable = () => {
    if (!excelData || !selectedSheet) return null;

    const sheetData = excelData.data[selectedSheet];
    if (!sheetData || sheetData.length === 0) {
      return <div className="empty">No data in this sheet</div>;
    }

    const headers = Object.keys(sheetData[0]);

    return (
      <div className="excel-view-container">
        <div className="excel-header">
          <button onClick={closeExcelView} className="excel-back-btn">
            <ArrowLeft size={20} />
            <span>Back to Files</span>
          </button>
          <h2 className="excel-title">
           <ListIcon 
  size={24} 
  style={{ 
    marginRight: '10px', 
    position: 'relative', 
    top: '6px' 
  }} 
/>

            {viewingExcel.name}
          </h2>
        </div>

        {excelData.sheetNames && excelData.sheetNames.length > 1 && (
          <div className="sheet-tabs">
            {excelData.sheetNames.map(sheetName => (
              <button
                key={sheetName}
                onClick={() => setSelectedSheet(sheetName)}
                className={`sheet-tab ${selectedSheet === sheetName ? 'active-sheet-tab' : ''}`}
              >
                {sheetName}
              </button>
            ))}
          </div>
        )}


        <div className="excel-table-wrapper">
          <table className="excel-table">
            <thead>
              <tr>
                <th className="excel-table-header">#</th>
                {headers.map(header => (
                  <th key={header} className="excel-table-header">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheetData.map((row, rowIndex) => (
                <tr key={rowIndex} className="excel-table-row">
                  <td className="excel-table-cell">{rowIndex + 1}</td>
                  {headers.map(header => (
                    <td key={header} className="excel-table-cell">
                      {renderCellValue(row[header])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // If viewing Excel, show Excel view
  if (excelId && viewingExcel && excelData) {
    return (
      <div className="documents-container">
        {renderExcelTable()}
      </div>
    );
  }

  return (
    <div className="documents-container">
      {/* Header */}
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
                      ) : item.type === 'link' ? (
                        <LinkIcon size={16} className="file-icon-link" />
                      ) : item.type === 'excel' ? (
                        <List size={16} className="file-icon-excel" />
                      ) : (
                        getFileIcon(item)
                      )}
                      <span className="file-name">{item.name || item.originalName}</span>
                    </div>
                  </td>
                  <td className="td">{formatDate(item.updatedAt || item.createdAt)}</td>
                  <td className="td">{getFileType(item)}</td>
                  <td className="td">
                    {item.type === 'folder' || item.type === 'link' ? '' : 
                     item.type === 'excel' ?`${item.rowCount} items` :
                     formatFileSize(item.size)}
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
                    {item.type === 'link' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, '_blank', 'noopener,noreferrer');
                        }}
                        className="download-button"
                        title="Open Link"
                      >
                        <ExternalLink size={16} />
                      </button>
                    )}
                    {item.type === 'excel' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/resources/list/${item._id}`);
                        }}
                        className="download-button"
                        title="View Excel"
                      >
                        <ExternalLink size={16} />
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
                ) : item.type === 'link' ? (
                  <LinkIcon size={48} className="link-icon-large" />
                ) : item.type === 'excel' ? (
                  <ListIcon size={48} className="file-icon-excel" />
                ) : (
                  <div className="file-icon-large">
                    {getFileIcon(item)}
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
              {item.type === 'link' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(item.url, '_blank', 'noopener,noreferrer');
                  }}
                  className="grid-download-button"
                  title="Open Link"
                >
                  <ExternalLink size={14} />
                </button>
              )}
              {item.type === 'excel' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/resources/list/${item._id}`);
                  }}
                  className="grid-download-button"
                  title="View Excel"
                >
                  <ExternalLink size={14} />
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