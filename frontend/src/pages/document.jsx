import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Folder, File, Download, X, ChevronRight, Home, List, Grid, Star, ArrowUpDown, Link as LinkIcon, ExternalLink, ListIcon, ArrowLeft, Code2, Terminal, CheckSquare, Check, Circle, Heart, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import '../pagesCSS/document.css';
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
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
  
  const [excelData, setExcelData] = useState(null);
  const [viewingExcel, setViewingExcel] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [checkmarkColumns, setCheckmarkColumns] = useState([]);
  const [excelCheckmarks, setExcelCheckmarks] = useState({});
  
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [activeCheckmarkFilters, setActiveCheckmarkFilters] = useState(new Set());
  const [showCheckmarkFilterMenu, setShowCheckmarkFilterMenu] = useState(false);
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
const [turnstileAction, setTurnstileAction] = useState(null);
const [turnstileToken, setTurnstileToken] = useState(null);
const [turnstilePending, setTurnstilePending] = useState(false);
const turnstileWidgetId = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showAccessRequestModal, setShowAccessRequestModal] = useState(false);
const [accessRequestItem, setAccessRequestItem] = useState(null);
const [requestFormData, setRequestFormData] = useState({
  name: '',
  email: '',
  message: ''
});
const [submittingRequest, setSubmittingRequest] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 800);
  const CHECKMARK_ICON_MAP = {
    'checkbox': CheckSquare,
    'check': Check,
    'circle': Circle,
    'star': Star,
    'heart': Heart
  };
const [alertPopup, setAlertPopup] = useState({
  show: false,
  type: 'success', 
  message: ''
});
  const getCheckmarkIcon = (type = 'checkbox') => {
    const IconComponent = CHECKMARK_ICON_MAP[type] || CheckSquare;
    return IconComponent;
  };
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      if (excelId) {
        loadExcelDataById(excelId);
      } else {
        fetchFolderContents(folderId || null);
      }
    }
  }, [folderId, excelId, userId]);

 // useEffect 1: Handle filtering (bookmarks, sorting)
useEffect(() => {
  let result = [...items];
  if (showBookmarkedOnly) {
    result = result.filter(item => item.isBookmarked);
  }
  if (!searchMode) {
    setFilteredItems(sortItems(result));
  }
}, [items, showBookmarkedOnly, sortBy, sortOrder, searchMode]);
useEffect(() => {
  if (debouncedSearchQuery.trim()) {
    handleSearch(debouncedSearchQuery);
  } else {
    setFilteredItems(sortItems(items));
    setSearchMode(false);
  }
}, [debouncedSearchQuery]);
  const getFilteredExcelRows = (sheetData) => {
    if (activeCheckmarkFilters.size === 0) return sheetData;
    
    return sheetData.filter((row, rowIndex) => {
      let passesAllFilters = true;
      
      for (const filterKey of activeCheckmarkFilters) {
        if (filterKey.startsWith('done-')) {
          const fieldId = filterKey.replace('done-', '');
          if (!excelCheckmarks[rowIndex]?.[fieldId]) {
            passesAllFilters = false;
            break;
          }
        } else if (filterKey.startsWith('not-done-')) {
          const fieldId = filterKey.replace('not-done-', '');
          if (excelCheckmarks[rowIndex]?.[fieldId]) {
            passesAllFilters = false;
            break;
          }
        }
      }
      
      return passesAllFilters;
    });
  };
useEffect(() => {
  const handleClickOutside = (event) => {
    if (showCheckmarkFilterMenu && !event.target.closest('.checkmark-filter-dropdown')) {
      setShowCheckmarkFilterMenu(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showCheckmarkFilterMenu]);
const handleTurnstileVerify = (token) => {
  setTurnstileToken(token);
  setTurnstilePending(false);
  
  // Execute the pending action
  if (turnstileAction) {
    turnstileAction.callback(token);
    setTurnstileAction(null);
    setShowTurnstileModal(false);
  }
};

// Initialize Turnstile widget when modal opens
useEffect(() => {
  if (showTurnstileModal && window.turnstile && !turnstileWidgetId.current) {
    setTurnstilePending(true);
    setTimeout(() => {
      turnstileWidgetId.current = window.turnstile.render('#turnstile-widget', {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        callback: handleTurnstileVerify,
        theme: 'light'
      });
    }, 100);
  }
  return () => {
    if (turnstileWidgetId.current && window.turnstile) {
      try {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      } catch (e) {
        console.error('Error removing turnstile:', e);
      }
    }
  };
}, [showTurnstileModal]);
  const toggleCheckmarkFilter = (filterKey) => {
    setActiveCheckmarkFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterKey)) {
        newFilters.delete(filterKey);
      } else {
        newFilters.add(filterKey);
      }
      return newFilters;
    });
  };

  const clearAllCheckmarkFilters = () => {
    setActiveCheckmarkFilters(new Set());
    setShowCheckmarkFilterMenu(false);
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userIdFromToken = payload.user_id;
        
        if (userIdFromToken) {
          setIsAuthenticated(true);
          setUserId(userIdFromToken);
          return;
        }
      } catch (e) {
        console.error('Invalid token:', e);
      }
    }
    
    const anonId = getOrCreateAnonId();
    setIsAuthenticated(false);
    setUserId(anonId);
  };

  const getOrCreateAnonId = () => {
    let anonId = localStorage.getItem('__app_anonymous_user_id__');
    if (!anonId) {
      anonId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('__app_anonymous_user_id__', anonId);
    }
    return anonId;
  };
const requestAccess = async () => {
  if (!requestFormData.name.trim() || !requestFormData.email.trim() || !requestFormData.message.trim()) {
   showAlert('Please fill in all fields', 'error');
    return;
  }

  try {
    setSubmittingRequest(true);
    
    const response = await fetch(
      `https://connectwithaaditiyamg2.onrender.com/api/user/request-access/${accessRequestItem._id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: requestFormData.name,
          email: requestFormData.email,
          message: requestFormData.message,
          userId: isAuthenticated ? userId : null
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
    showAlert('Access request submitted successfully! You will receive an email when it is reviewed.', 'success');
      setShowAccessRequestModal(false);
      setRequestFormData({ name: '', email: '', message: '' });
      setAccessRequestItem(null);
    } else {
     showAlert(data.message || 'Failed to submit request', 'error');
    }
  } catch (err) {
    console.error('Error requesting access:', err);
  showAlert('Failed to submit access request', 'error');
  } finally {
    setSubmittingRequest(false);
  }
};
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


const showAlert = (message, type = 'info') => {
  setAlertPopup({ show: true, type, message });
  
  // Auto-close after 3 seconds
  setTimeout(() => {
    setAlertPopup({ show: false, type: '', message: '' });
  }, 7000);
};

const closeAlert = () => {
  setAlertPopup({ show: false, type: '', message: '' });
};
const fetchFolderContents = async (parentId) => {
  try {
    setLoading(true);
    
    const urlParams = new URLSearchParams(window.location.search);
    const accessKey = urlParams.get('key');
    
    let url = parentId 
      ? `https://connectwithaaditiyamg2.onrender.com/api/folder/contents?parentId=${parentId}`
      : `https://connectwithaaditiyamg2.onrender.com/api/folder/contents`;
    
    if (accessKey) {
      url += `${parentId ? '&' : '?'}key=${accessKey}`;
    }
    
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(url, { headers });
    const data = await response.json();

  

    let itemsWithBookmarks = data.items || [];

    if (!isAuthenticated) {
      itemsWithBookmarks = itemsWithBookmarks.map(item => ({
        ...item,
        isBookmarked: isItemBookmarkedLocally(item._id)
      }));
    }

    setItems(itemsWithBookmarks);
    setFilteredItems(sortItems(itemsWithBookmarks));
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
    alert('Failed to load folder. Access denied or folder not found.');
    navigate('/resources');
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
  if (!query.trim()) {
    setFilteredItems(sortItems(items));
    setSearchMode(false);
    return;
  }

  try {
    setSearchMode(true);
    setLoading(true);
    
    const urlParams = new URLSearchParams(window.location.search);
    const accessKey = urlParams.get('key');
    
    const params = new URLSearchParams({
      q: query,
      limit: 10
    });
    
    if (folderId) {
      params.append('parentId', folderId);
    }
    
    if (accessKey) {
      params.append('key', accessKey);
    }
    
    const response = await fetch(
      `https://connectwithaaditiyamg2.onrender.com/api/search?${params.toString()}`
    );

  

    const data = await response.json();

    let results = data.results || [];
    
    results = results.filter(item => item.hasAccess !== false);
    
    if (!isAuthenticated) {
      results = results.map(item => ({
        ...item,
        isBookmarked: isItemBookmarkedLocally(item._id)
      }));
    }

    setFilteredItems(results);
  } catch (err) {
    console.error("Error searching:", err);
    setFilteredItems([]);
  } finally {
    setLoading(false);
  }
};

  const isItemBookmarkedLocally = (itemId) => {
    if (isAuthenticated) return false;
    const key = `bookmarks_${userId}`;
    const bookmarks = JSON.parse(localStorage.getItem(key) || '[]');
    return bookmarks.includes(itemId);
  };

  const getBookmarksFromStorage = () => {
    const key = `bookmarks_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  };

  const saveBookmarksToStorage = (bookmarks) => {
    const key = `bookmarks_${userId}`;
    localStorage.setItem(key, JSON.stringify(bookmarks));
  };

  const toggleUserBookmark = async (item, e) => {
    e.stopPropagation();
    
    if (!item.bookmarkEnabled) {
      alert('Bookmarking is not enabled for this item');
      return;
    }

    const currentlyBookmarked = item.isBookmarked;

    if (!isAuthenticated) {
      const bookmarks = getBookmarksFromStorage();
      
      if (currentlyBookmarked) {
        const updatedBookmarks = bookmarks.filter(id => id !== item._id);
        saveBookmarksToStorage(updatedBookmarks);
        updateItemBookmarkStatus(item._id, false);
       
      } else {
        bookmarks.push(item._id);
        saveBookmarksToStorage(bookmarks);
        updateItemBookmarkStatus(item._id, true);
        
      }
    } else {
      const token = localStorage.getItem('token');
      
      try {
        const res = await fetch(`https://connectwithaaditiyamg2.onrender.com/api/user/bookmark/${item._id}`, {
          method: currentlyBookmarked ? 'DELETE' : 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          updateItemBookmarkStatus(item._id, !currentlyBookmarked);
         
        } else {
          const error = await res.json();
          console.error('Bookmark error:', error);
          alert(error.message || 'Error toggling bookmark');
        }
      } catch (err) {
        console.error('Error toggling bookmark:', err);
        alert('Network error toggling bookmark');
      }
    }
  };

  const updateItemBookmarkStatus = (itemId, bookmarked) => {
    setItems(prevItems => 
      prevItems.map(i => i._id === itemId ? { ...i, isBookmarked: bookmarked } : i)
    );
    setFilteredItems(prevItems => 
      prevItems.map(i => i._id === itemId ? { ...i, isBookmarked: bookmarked } : i)
    );
  };

  const loadExcelCheckmarks = async (excelFileId) => {
    if (!isAuthenticated) {
      const key = `checkmarks_${userId}_${excelFileId}`;
      const checkmarks = JSON.parse(localStorage.getItem(key) || '{}');
      setExcelCheckmarks(checkmarks);
    } else {
      const token = localStorage.getItem('token');
      
      try {
        const res = await fetch(
          `https://connectwithaaditiyamg2.onrender.com/api/user/excel/${excelFileId}/checkmarks`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (res.ok) {
          const data = await res.json();
          setExcelCheckmarks(data.userCheckmarks || {});
        } else {
          console.error('Failed to load checkmarks');
          setExcelCheckmarks({});
        }
      } catch (err) {
        console.error('Error loading checkmarks:', err);
        setExcelCheckmarks({});
      }
    }
  };

  const toggleRowCheckmark = async (rowIndex, fieldId, currentValue) => {
    const newValue = !currentValue;

    if (!isAuthenticated) {
      const key = `checkmarks_${userId}_${excelId}`;
      const checkmarks = JSON.parse(localStorage.getItem(key) || '{}');
      
      if (!checkmarks[rowIndex]) checkmarks[rowIndex] = {};
      checkmarks[rowIndex][fieldId] = newValue;
      
      localStorage.setItem(key, JSON.stringify(checkmarks));
      setExcelCheckmarks(checkmarks);
    } else {
      const token = localStorage.getItem('token');
      
      try {
        const res = await fetch(
          `https://connectwithaaditiyamg2.onrender.com/api/user/excel/${excelId}/row-checkmark`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rowIndex, fieldId, checked: newValue })
          }
        );

        if (res.ok) {
          setExcelCheckmarks(prev => ({
            ...prev,
            [rowIndex]: { ...prev[rowIndex], [fieldId]: newValue }
          }));
        } else {
          const error = await res.json();
          console.error('Error updating checkmark:', error);
          alert('Failed to update checkmark');
        }
      } catch (err) {
        console.error('Error updating checkmark:', err);
        alert('Error updating checkmark');
      }
    }
  };
const loadExcelDataById = async (id) => {
  const executeLoadExcel = async (token) => {
    try {
      setLoading(true);
      
      const urlParams = new URLSearchParams(window.location.search);
      const accessKey = urlParams.get('key');
      
      let url = `https://connectwithaaditiyamg2.onrender.com/api/excel/${id}/data`;
      if (accessKey) {
        url += `?key=${accessKey}`;
      }
      
      const tokenObj = localStorage.getItem('token');
      const headers = {
        'X-Turnstile-Token': token
      };
      
      if (tokenObj) {
        headers['Authorization'] = `Bearer ${tokenObj}`;
      }
      
      const res = await fetch(url, { headers });
      
      if (res.status === 403) {
        const data = await res.json();
        if (data.requiresTurnstile) {
          showAlert('Verification failed. Please try again.', 'error');
          navigate('/resources');
          return;
        }
      }
      
      if (res.status === 404 || !res.ok) {
        throw new Error('Failed to load Excel file');
      }
      
      const data = await res.json();
      
      setExcelData(data);
      setViewingExcel({ _id: id, name: data.name || 'Excel File' });
      setSelectedSheet(data.sheetNames?.[0] || null);
      setCheckmarkColumns(data.checkmarkFields || []);
      
      if (isAuthenticated && data.userCheckmarks) {
        setExcelCheckmarks(data.userCheckmarks);
      } else {
        await loadExcelCheckmarks(id);
      }
    } catch (err) {
      console.error('Error loading List data:', err);
      showAlert('Failed to load file. Access denied or file not found.', 'error');
      navigate('/resources');
    } finally {
      setLoading(false);
    }
  };

  // Show Turnstile modal
  setTurnstileAction({
    type: 'excel',
    excelId: id,
    callback: executeLoadExcel
  });
  setShowTurnstileModal(true);
  turnstileWidgetId.current = null;
};
 
  const closeExcelView = () => {
    navigate('/resources');
  };

 const handleItemClick = (item) => {
  // Check if item has access restrictions
  if (item.hasAccess === false || item.accessLevel === 'locked') {
    if (item.canRequestAccess) {
      // Show access request modal
      setShowAccessRequestModal(true);
      setAccessRequestItem(item);
    } else {
    showAlert('You do not have access to this item', 'error');
    }
    return;
  }

  // Get access key to pass along
  const urlParams = new URLSearchParams(window.location.search);
  const accessKey = urlParams.get('key');
  const keyParam = accessKey ? `?key=${accessKey}` : '';

  if (item.type === 'folder') {
    navigate(`/resources/folder/${item._id}${keyParam}`);
  } else if (item.type === 'link') {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  } else if (item.type === 'excel') {
    navigate(`/resources/list/${item._id}${keyParam}`);
  } else {
    handleDownload(item._id);
  }
};

const handleDownload = async (docId) => {
  const executeDownload = async (token) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const accessKey = urlParams.get('key');
      
      const params = new URLSearchParams();
      
      if (accessKey) {
        params.append('key', accessKey);
      }
      if (userId) {
        params.append('userId', userId);
      }
      // Send turnstile token as query param instead of header
      params.append('turnstileToken', token);
      
      let url = `https://connectwithaaditiyamg2.onrender.com/api/download/${docId}?${params.toString()}`;
      
      const res = await fetch(url);
      
      if (res.status === 403) {
        const data = await res.json();
        if (data.requiresTurnstile) {
          showAlert('Verification failed. Please try again.', 'error');
          return;
        }
      }
      
      const data = await res.json();
      if (!data.downloadUrl) throw new Error("No download URL");
      
      // Navigate to download URL
      window.location.href = data.downloadUrl;
      
    } catch (err) {
      console.error("Error downloading:", err);
      showAlert("Failed to download file. Access denied or file not found.", 'error');
    }
  };

  // Show Turnstile modal
  setTurnstileAction({
    type: 'download',
    docId,
    callback: executeDownload
  });
  setShowTurnstileModal(true);
  turnstileWidgetId.current = null;
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
    
    if (urlLower.includes('geeksforgeeks.org') || urlLower.includes('gfg.org')) {
      return <img src="https://media.geeksforgeeks.org/gfg-gg-logo.svg" alt="GFG" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('leetcode.com')) {
      return <img src="https://leetcode.com/favicon.ico" alt="LeetCode" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('hackerrank.com')) {
      return <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png" alt="HackerRank" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('hackerearth.com')) {
      return <img src="https://www.clipartmax.com/png/full/344-3444494_hackerearth-logo-png-clipart-hackathon-hackerearth-icon-logo-hackerearth.png" alt="HackerEarth" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('codechef.com')) {
      return <img src="https://cdn.codechef.com/images/cc-logo.svg" alt="CodeChef" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('codeforces.com')) {
      return <img src="https://sta.codeforces.com/s/43704/favicon-32x32.png" alt="Codeforces" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('spoj.com')) {
      return <img src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/logos/spoj-rfhniy255xlgkrm1d9aegd.png/spoj-9e9o8x5923tpg6tmu6qe.png?_a=DATAg1AAZAA0" alt="SPOJ" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('atcoder.jp')) {
      return <img src="https://img.atcoder.jp/assets/top/img/logo_bk.svg" alt="AtCoder" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('topcoder.com')) {
      return <img src="https://www.topcoder.com/wp-content/uploads/2020/04/cropped-TC-Icon-32x32.png" alt="TopCoder" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('codingninjas.com') || urlLower.includes('naukri.com/code360')) {
      return <img src="https://files.codingninjas.in/pl-ninja-16706.svg" alt="Coding Ninjas" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('interviewbit.com')) {
      return <img src="https://ibassets.s3.amazonaws.com/static-assets/ib-logo-square.png" alt="InterviewBit" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('takeuforward.org') || urlLower.includes('tuf')) {
      return <img src="https://yt3.googleusercontent.com/dSkEwiYrGlZPE6t9irfN8RlpDlaU_n7u3oEnHxJIY_knycUXPzEVlFKbYtwzkcysNDVZPn5zmHg=s900-c-k-c0x00ffffff-no-rj" alt="TakeUForward" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return <img src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png" alt="YouTube" style={{width: '25px', height: '16px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('github.com')) {
      return <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('stackoverflow.com')) {
      return <img src="https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico" alt="Stack Overflow" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('medium.com')) {
      return <img src="https://medium.com/favicon.ico" alt="Medium" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('dev.to')) {
      return <img src="https://dev.to/favicon.ico" alt="Dev.to" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('coursera.org')) {
      return <img src="https://d3njjcbhbojbot.cloudfront.net/web/images/favicons/favicon-v2-32x32.png" alt="Coursera" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('udemy.com')) {
      return <img src="https://www.udemy.com/staticx/udemy/images/v7/favicon-32x32.png" alt="Udemy" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('freecodecamp.org')) {
      return <img src="https://cdn.freecodecamp.org/universal/favicons/favicon-32x32.png" alt="freeCodeCamp" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('educative.io')) {
      return <img src="https://www.educative.io/favicon.ico" alt="Educative" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('brilliant.org')) {
      return <img src="https://brilliant.org/favicon.ico" alt="Brilliant" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('kaggle.com')) {
      return <img src="https://www.kaggle.com/static/images/favicon.ico" alt="Kaggle" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('projecteuler.net')) {
      return <img src="https://projecteuler.net/favicon.ico" alt="Project Euler" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('exercism.org')) {
      return <img src="https://assets.exercism.org/meta/favicon-32x32.png" alt="Exercism" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('codewars.com')) {
      return <img src="https://www.codewars.com/favicon.ico" alt="Codewars" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('csacademy.com')) {
      return <img src="https://csacademy.com/static/images/favicon.png" alt="CS Academy" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('algoexpert.io')) {
      return <img src="https://assets.algoexpert.io/spas/main/prod/g523bdafee8-prod/dist/images/ae-logo-white.png" alt="AlgoExpert" style={{width: '20px', height: '20px', marginRight: '4px', filter: 'invert(1)'}} />;
    }
    
    if (urlLower.includes('pramp.com')) {
      return <img src="https://www.pramp.com/favicon.ico" alt="Pramp" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('binarysearch.com')) {
      return <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNRGmq5BCn8JtJgiPokv3dNSa18B4KEwC_fA&s" alt="BinarySearch" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('programiz.com')) {
      return <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpM5TTwBPk6iTL0xSGinoPQbRvbM0vdyLBqA&s" alt="Programiz" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
    if (urlLower.includes('cp-algorithms.com')) {
      return <img src="https://avatars.githubusercontent.com/u/8272813?s=200&v=4" alt="CP Algorithms" style={{width: '20px', height: '20px', marginRight: '4px'}} />;
    }
    
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
const filteredRows = getFilteredExcelRows(sheetData);

return (
  <div className="excel-view-container">
    <div className="excel-header">
      <button onClick={closeExcelView} className="excel-back-btn">
        <ArrowLeft size={20} />
        <span>Back to Files</span>
      </button>
      <h2 className="excel-title">
        <ListIcon size={24} style={{ marginRight: '10px', position: 'relative', top: '6px' }} />
        {viewingExcel.name}
      </h2>
      
      {checkmarkColumns.length > 0 && (
        <div className="excel-filters">
          <div className="checkmark-filter-dropdown">
            <button 
              className={`icon-button filter-button ${activeCheckmarkFilters.size > 0 ? 'active' : ''}`}
              onClick={() => setShowCheckmarkFilterMenu(!showCheckmarkFilterMenu)}
              title="Filter by completion"
            >
              <CheckSquare size={18} />
              <span style={{ marginLeft: '6px', fontSize: '14px' }}>
                Filter {activeCheckmarkFilters.size > 0 ? `(${activeCheckmarkFilters.size})` : ''}
              </span>
            </button>
            {showCheckmarkFilterMenu && (
              <div className="checkmark-filter-menu">
                {activeCheckmarkFilters.size > 0 && (
                  <>
                    <button
                      className="filter-option clear-all"
                      onClick={clearAllCheckmarkFilters}
                    >
                      Clear All Filters
                    </button>
                    <div className="filter-divider"></div>
                  </>
                )}
                
                {checkmarkColumns.map(field => (
                  <React.Fragment key={field.fieldId}>
                    <button
                      className={`filter-option ${activeCheckmarkFilters.has(`done-${field.fieldId}`) ? 'active' : ''}`}
                      onClick={() => toggleCheckmarkFilter(`done-${field.fieldId}`)}
                    >
                      <span className="filter-checkbox">
                        {activeCheckmarkFilters.has(`done-${field.fieldId}`) ? '☑' : '☐'}
                      </span>
                      ✓ {field.fieldName} (Done)
                    </button>
                    <button
                      className={`filter-option ${activeCheckmarkFilters.has(`not-done-${field.fieldId}`) ? 'active' : ''}`}
                      onClick={() => toggleCheckmarkFilter(`not-done-${field.fieldId}`)}
                    >
                      <span className="filter-checkbox">
                        {activeCheckmarkFilters.has(`not-done-${field.fieldId}`) ? '☑' : '☐'}
                      </span>
                      ○ {field.fieldName} (Not Done)
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
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
            {checkmarkColumns.map(field => (
              <th key={field.fieldId} className="excel-table-header checkmark-header">
                {field.fieldName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row, displayIndex) => {
            const originalRowIndex = sheetData.findIndex(r => r === row);
            
            return (
              <tr key={originalRowIndex} className="excel-table-row">
                <td className="excel-table-cell">{originalRowIndex + 1}</td>
                {headers.map(header => (
                  <td key={header} className="excel-table-cell">
                    {renderCellValue(row[header])}
                  </td>
                ))}
                {checkmarkColumns.map(field => {
                  const isChecked = excelCheckmarks[originalRowIndex]?.[field.fieldId] || false;
                  const IconComponent = getCheckmarkIcon(field.checkmarkType);
                  
                  return (
                    <td 
                      key={field.fieldId} 
                      className={`excel-checkmark-cell checkmark-type-${field.checkmarkType}`}
                      onClick={() => toggleRowCheckmark(
                        originalRowIndex,
                        field.fieldId,
                        isChecked
                      )}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconComponent
                        size={20}
                        className={isChecked ? 'checkmark-checked' : 'checkmark-unchecked'}
                        strokeWidth={2}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);
};
if (excelId && viewingExcel && excelData) {
return (
<div className="documents-container">
{renderExcelTable()}
</div>
);
}
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
<button
 className={`icon-button filter-button ${showBookmarkedOnly ? 'active' : ''}`}
onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
title={showBookmarkedOnly ? 'Show All' : 'Show Bookmarked Only'}
>
<Star size={16} fill={showBookmarkedOnly ? '#FFC107' : 'none'} />
</button>
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

  {!searchMode && breadcrumb.length > 0 && (
    <div className="breadcrumb-container">
      <Link to="/resources" className="breadcrumb-item">
        <Home size={14} />
        <span>Documents</span>
      </Link>
      {breadcrumb.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <Link to={`/resources/folder/${crumb.id}`} className="breadcrumb-item">
            {crumb.name}
          </Link>
        </React.Fragment>
      ))}
    </div>
  )}

  <div className="search-container">
    <div className="search-box">
      <Search size={16} className="search-icon" />
     <input
  type="text"
  placeholder={folderId ? "Search in this folder..." : "Search all documents..."}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)} // Just update state, debounce handles the rest
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
    className={`table-row ${(item.hasAccess === false || item.accessLevel === 'locked') ? 'locked-row' : ''}`}
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
        {(item.hasAccess === false || item.accessLevel === 'locked') && (
          <Lock size={14} style={{ marginLeft: '8px', color: '#605E5C' }} />
        )}
      </div>
    </td>
    <td className="td">{formatDate(item.createdAt)}</td>
    <td className="td">{getFileType(item)}</td>
    <td className="td">
      {item.type === 'folder' || item.type === 'link' ? '' : 
       item.type === 'excel' ? `${item.rowCount} items` :
       formatFileSize(item.size)}
    </td>
    <td className="td action-column">
      <div className="action-buttons-container">
        {/* Only show action buttons if user has access */}
        {item.hasAccess !== false && item.accessLevel !== 'locked' && (
          <>
            {item.bookmarkEnabled && (
              <button
                onClick={(e) => toggleUserBookmark(item, e)}
                className={`bookmark-button ${item.isBookmarked ? 'bookmarked' : ''}`}
                title={item.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
              >
                <Star
                  size={16}
                  fill={item.isBookmarked ? '#FFC107' : 'none'}
                  color={item.isBookmarked ? '#FFC107' : 'currentColor'}
                />
              </button>
            )}
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
                  const urlParams = new URLSearchParams(window.location.search);
                  const accessKey = urlParams.get('key');
                  const keyParam = accessKey ? `?key=${accessKey}` : '';
                  navigate(`/resources/list/${item._id}${keyParam}`);
                }}
                className="download-button"
                title="View List"
              >
                <ExternalLink size={16} />
              </button>
            )}
          </>
        )}
      </div>
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
    className={`grid-item ${(item.hasAccess === false || item.accessLevel === 'locked') ? 'locked-item' : ''}`}
    onDoubleClick={() => handleItemClick(item)}
  >
          {item.bookmarkEnabled && (
            <button
              onClick={(e) => toggleUserBookmark(item, e)}
              className={`grid-bookmark-button ${item.isBookmarked ? 'bookmarked' : ''}`}
              title={item.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
            >
              <Star 
                size={14} 
                fill={item.isBookmarked ? 'white' : 'none'}
                color={item.isBookmarked ? 'white' : '#666'}
              />
            </button>
          )}

       
<div className="grid-icon">
  {item.hasAccess === false || item.accessLevel === 'locked' ? (
    <div className="locked-item-indicator">
      {item.type === 'folder' ? (
        <Folder size={48} className="folder-icon-large locked-icon" />
      ) : item.type === 'link' ? (
        <LinkIcon size={48} className="link-icon-large locked-icon" />
      ) : item.type === 'excel' ? (
        <ListIcon size={48} className="file-icon-excel locked-icon" />
      ) : (
        <div className="file-icon-large locked-icon">
          {getFileIcon(item)}
        </div>
      )}
      <div className="lock-overlay">
        <Lock size={24} className="lock-icon" />
      </div>
    </div>
  ) : (
    <>
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
    </>
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
              title="View List"
            >
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  )}
  {/* Access Request Modal */}
{showAccessRequestModal && accessRequestItem && (
  <div className="access-modal-overlay" onClick={() => setShowAccessRequestModal(false)}>
    <div className="access-modal" onClick={(e) => e.stopPropagation()}>
      <div className="access-modal-header">
        <h3>Request Access</h3>
        <button 
          className="access-modal-close"
          onClick={() => setShowAccessRequestModal(false)}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="access-modal-body">
        <p className="access-modal-description">
          Request access to: <strong>{accessRequestItem.name}</strong>
        </p>
        
        <div className="access-form-group">
          <label>Your Name *</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={requestFormData.name}
            onChange={(e) => setRequestFormData({...requestFormData, name: e.target.value})}
            className="access-form-input"
          />
        </div>
        
        <div className="access-form-group">
          <label>Your Email *</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={requestFormData.email}
            onChange={(e) => setRequestFormData({...requestFormData, email: e.target.value})}
            className="access-form-input"
          />
        </div>
        
        <div className="access-form-group">
          <label>Reason for Access *</label>
          <textarea
            placeholder="Why do you need access to this document?"
            value={requestFormData.message}
            onChange={(e) => setRequestFormData({...requestFormData, message: e.target.value})}
            className="access-form-textarea"
            rows="4"
          />
        </div>
      </div>
      
       <div className="access-modal-footer">
        <button 
          className="usersubmit-btn-small"
          onClick={() => setShowAccessRequestModal(false)}
          disabled={submittingRequest}
        >
          Cancel
        </button>
        <button 
          className="usersubmit-btn-small"
          onClick={requestAccess}
          disabled={submittingRequest}
        >
          {submittingRequest ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </div>
  </div>
)}
{/* Alert Popup */}
{alertPopup.show && (
  <div className="usersubmit-overlay" onClick={closeAlert}>
    <div className="usersubmit-modal" onClick={(e) => e.stopPropagation()}>
      <div className={`usersubmit-successicon ${alertPopup.type}`}>
        {alertPopup.type === 'success' && <CheckCircle size={60} />}
        {alertPopup.type === 'error' && <AlertCircle size={60} />}
        {alertPopup.type === 'info' && <AlertCircle size={60} />}
      </div>
      
      <p className="usersubmit-message">{alertPopup.message}</p>
      
      <div className="usersubmit-actions">
        <button className="usersubmit-btn-small" onClick={closeAlert}>
          Close
        </button>
      </div>
    </div>
  </div>
)}
{/* Turnstile Verification Modal */}

{showTurnstileModal && (
  <div className="turnstile-modal-overlay">
    <div className="turnstile-modal">
      <div className="turnstile-modal-header">
        <h3>Security Verification</h3>
        <p>Please verify you're human to continue</p>
      </div>
      
      <div className="turnstile-modal-body">
        <div id="turnstile-widget"></div>
        {turnstilePending && (
          <div className="turnstile-loading">
            <div className="spinner4">
              <div className="spinner4-ring"></div>
              <div className="spinner4-ring"></div>
              <div className="spinner4-ring"></div>
            </div>
            <p>Verifying your identity...</p>
          </div>
        )}
      </div>
      
      <div className="turnstile-modal-footer">
        <button
          onClick={() => {
            setShowTurnstileModal(false);
            setTurnstileAction(null);
            if (turnstileWidgetId.current && window.turnstile) {
              window.turnstile.remove(turnstileWidgetId.current);
              turnstileWidgetId.current = null;
            }
          }}
          className="usersubmit-btn-small"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


<style jsx>{`
/* Full Screen Overlay */
.turnstile-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(245, 243, 240, 0.98);
  backdrop-filter: blur(12px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modal Container */
.turnstile-modal {
  position: relative;
  width: 100%;
  max-width: 500px;
  padding: 3rem 2rem;
  text-align: center;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Header */
.turnstile-modal-header {
  margin-bottom: 3rem;
}

.turnstile-modal-header h3 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
}

.turnstile-modal-header p {
  font-size: 1.125rem;
  color: #5e4d3a;
  margin: 0;
  font-weight: 500;
}

/* Modal Body */
.turnstile-modal-body {
  margin: 2.5rem 0;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#turnstile-widget {
  margin: 0 auto;
}

/* Loading State */
.turnstile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

/* Modern 3-Ring Spinner */
.spinner4 {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner4-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #0f172a;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner4-ring:nth-child(2) {
  border-top-color: rgba(15, 23, 42, 0.5);
  animation-delay: -0.5s;
  animation-duration: 2s;
}

.spinner4-ring:nth-child(3) {
  border-top-color: rgba(15, 23, 42, 0.25);
  animation-delay: -1s;
  animation-duration: 2.5s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.turnstile-loading p {
  font-size: 0.9375rem;
  color: #5e4d3a;
  font-weight: 600;
  margin: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Modal Footer */
.turnstile-modal-footer {
  margin-top: 2rem;
}

.usersubmit-btn-small {
  padding: 0.875rem 2rem;
  background: transparent;
  color: #0f172a;
  border: 2px solid #0f172a;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.usersubmit-btn-small::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #0f172a;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: -1;
}

.usersubmit-btn-small:hover::before {
  transform: translateX(0);
}

.usersubmit-btn-small:hover {
  color: #f5f3f0;
  transform: translateY(-2px);
}

.usersubmit-btn-small:active {
  transform: translateY(0);
}

/* Animated Grid Background */
.turnstile-modal-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  opacity: 0.4;
  pointer-events: none;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .turnstile-modal {
    padding: 2rem 1.5rem;
  }

  .turnstile-modal-header h3 {
    font-size: 2rem;
  }

  .turnstile-modal-header p {
    font-size: 1rem;
  }

  .spinner {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .turnstile-modal {
    padding: 1.5rem 1rem;
  }

  .turnstile-modal-header h3 {
    font-size: 1.75rem;
  }

  .turnstile-modal-header p {
    font-size: 0.9375rem;
  }

  .usersubmit-btn-small {
    width: 100%;
    max-width: 300px;
  }
}

/* Accessibility - Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .turnstile-modal-overlay,
  .turnstile-modal,
  .spinner-ring,
  .turnstile-loading p,
  .usersubmit-btn-small::before,
  .turnstile-modal-overlay::before {
    animation: none !important;
    transition: none !important;
  }
}
`}</style>
</div>
);
};
export default Documents;