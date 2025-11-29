import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Lock, X } from 'lucide-react';
import '../pagesCSS/Stream.css';

const StreamPost = () => {
  const { id: streamId } = useParams(); // Get stream ID from URL parameters
  const navigate = useNavigate(); // For navigation
  
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [embedData, setEmbedData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (streamId) {
      fetchStreamById(streamId);
    } else {
      setError('No stream ID found in URL');
      setLoading(false);
    }
  }, [streamId]);

  const fetchStreamById = async (streamId) => {
    try {
      setLoading(true);
      
      // Fetch all streams to find the specific one
      const response = await fetch('https://connectwithaaditiyamg2.onrender.com/api/streams');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const allStreams = data.streams || [];
      const foundStream = allStreams.find(s => s._id === streamId);
      
      if (foundStream) {
        setStream(foundStream);
        
        // If stream is password protected, show password modal
        if (foundStream.isPasswordProtected) {
          setShowPasswordModal(true);
        } else {
          // If not password protected, fetch embed data directly
          await fetchEmbedData(streamId);
        }
      } else {
        setError('Stream not found');
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      setError('Error loading stream');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmbedData = async (streamId, streamPassword = '') => {
    try {
      const response = await fetch(`https://connectwithaaditiyamg2.onrender.com/api/streams/${streamId}/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: streamPassword })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error(errorData.message || 'Password required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setEmbedData(data);
      return data;
    } catch (error) {
      console.error('Error fetching embed data:', error);
      throw error;
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Please enter a password');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');

    try {
      await fetchEmbedData(stream._id, password);
      setShowPasswordModal(false);
      setPassword('');
    } catch (error) {
      setPasswordError(error.message || 'Invalid password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
    // Go back to streams list using React Router
    navigate('/stream');
  };

  const goBackToStreams = () => {
    navigate('/stream');
  };

  const formatDate = (dateStr) => {
    try {
      let date;
      if (dateStr.includes('-')) {
        date = new Date(dateStr + 'T00:00:00');
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    return timeStr;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: 'tyagi-status-scheduled',
      live: 'tyagi-status-live',
      ended: 'tyagi-status-ended'
    };
    
    return (
      <span className={`tyagi-status-badge ${statusClasses[status] || 'tyagi-status-scheduled'}`}>
        {status === 'live' && <span className="tyagi-live-dot"></span>}
        {status ? status.toUpperCase() : 'SCHEDULED'}
      </span>
    );
  };

  // Password Modal Component
 const PasswordModal = () => (
  <div className="tyagi-modal-overlay">
    <div className="tyagi-modal">
      <div className="tyagi-modal-header">
        <div className="tyagi-modal-title">
          <Lock size={20} />
          <h3>Password Protected Stream</h3>
        </div>
        <button 
          className="tyagi-modal-close"
          onClick={closePasswordModal}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="tyagi-modal-body">
        <p>This stream is password protected. Please enter the password to continue.</p>
        <p className="tyagi-modal-stream-title">
          <strong>{stream?.title}</strong>
        </p>
        
        <form onSubmit={handlePasswordSubmit}>
          <div className="tyagi-form-group">
            <label htmlFor="stream-password">Password</label>
            <input
              type="password"
              id="stream-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tyagi-form-input"
              placeholder="Enter stream password"
              autoFocus
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>
          
          {passwordError && (
            <div className="tyagi-error-message">
              {passwordError}
            </div>
          )}
          
          <div className="tyagi-modal-actions">
            <button
              type="button"
              onClick={closePasswordModal}
              className="tyagi-btn tyagi-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passwordLoading}
              className="tyagi-btn tyagi-btn-primary"
            >
              {passwordLoading ? 'Verifying...' : 'Access Stream'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

  // Loading state
  if (loading) {
    return (
      <div className="tyagi-app">
        <div className="tyagi-container">
          <div className="tyagi-loading">
            <div className="tyagi-loading-spinner"></div>
            <p>Loading stream...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !stream) {
    return (
      <div className="tyagi-app">
        <div className="tyagi-container">
          <div className="tyagi-empty-state">
            <h3>Stream Not Found</h3>
            <p>{error || 'The requested stream could not be found.'}</p>
            <button 
              className="tyagi-btn tyagi-btn-primary"
              onClick={goBackToStreams}
            >
              Back to Streams
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show password modal if needed and no embed data yet
  if (showPasswordModal || (stream.isPasswordProtected && !embedData)) {
    return (
      <div className="tyagi-app">
        <div className="tyagi-container">
          <button 
            className="tyagi-back-btn"
            onClick={goBackToStreams}
          >
            ← Back to Streams
          </button>
        </div>
        <PasswordModal />
      </div>
    );
  }

  // Main stream view
  if (stream && embedData) {
    return (
      <div className="tyagi-app2">
        <div className="tyagi-container">
          <button 
            className="tyagi-back-btn"
            onClick={goBackToStreams}
          >
            ← Back to Streams
          </button>
          
          <div className="tyagi-stream-viewer">
            <div className="tyagi-video-section">
              <div className="tyagi-video-container">
                <iframe
                  src={`${embedData.embedUrl}?autoplay=${stream.status === 'live' ? '1' : '0'}&modestbranding=1&rel=0`}
                  title={embedData.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="tyagi-video-iframe"
                ></iframe>
              </div>
              
              <div className="tyagi-video-info">
                <div className="tyagi-video-title-row">
                  <h1 className="tyagi-video-title">{stream.title}</h1>
                  {stream.isPasswordProtected && (
                    <div className="tyagi-protected-badge">
                      <Lock size={16} />
                      <span>Protected</span>
                    </div>
                  )}
                </div>
                <div className="tyagi-video-meta">
                  <div className="tyagi-meta-item">
                    <Calendar size={16} />
                    <span>{formatDate(stream.scheduledDate)}</span>
                  </div>
                  <div className="tyagi-meta-item">
                    <Clock size={16} />
                    <span>{formatTime(stream.scheduledTime)}</span>
                  </div>
                  {getStatusBadge(stream.status)}
                </div>
                <p className="tyagi-video-description">{stream.description}</p>
              </div>
            </div>
            
            <div className="tyagi-chat-section">
              <div className="tyagi-chat-header">
                <Users size={20} />
                <h3>Live Chat</h3>
              </div>
              <div className="tyagi-chat-container">
                {stream.status === 'live' ? (
                  <iframe
                    src={`https://www.youtube.com/live_chat?v=${embedData.embedId}&embed_domain=localhost&dark_theme=0`}
                    className="tyagi-chat-iframe"
                    frameBorder="0"
                    title="YouTube Live Chat"
                    allow="autoplay; encrypted-media"
                  ></iframe>
                ) : (
                  <div className="tyagi-chat-placeholder">
                    <Users size={48} className="tyagi-chat-placeholder-icon" />
                    <h4>Chat Not Available</h4>
                    <p>
                      {stream.status === 'ended' 
                        ? 'This stream has ended. Chat is no longer available.' 
                        : 'Live chat will be available when the stream goes live'
                      }
                    </p>
                    {stream.status === 'scheduled' && (
                      <div className="tyagi-chat-schedule">
                        <Clock size={16} />
                        <span>Scheduled for {formatDate(stream.scheduledDate)} at {formatTime(stream.scheduledTime)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="tyagi-app">
      <div className="tyagi-container">
        <div className="tyagi-loading">
          <div className="tyagi-loading-spinner"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    </div>
  );
};

export default StreamPost;