import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Play, Tv, Lock, X } from 'lucide-react';
import '../pagesCSS/Stream.css';
import profileImage from '../images/livestream.png';
const StreamApp = () => {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [embedData, setEmbedData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pendingStream, setPendingStream] = useState(null);

  useEffect(() => {
    fetchStreams();
  }, [activeTab]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/streams');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let streamData = data.streams || [];
      
      if (activeTab === 'upcoming') {
        streamData = streamData.filter(stream => stream.status === 'scheduled');
      } else if (activeTab === 'live') {
        streamData = streamData.filter(stream => stream.status === 'live');
      } else if(activeTab === 'ended'){
        streamData = streamData.filter(stream => stream.status === 'ended');
      }
      
      setStreams(streamData);
    } catch (error) {
      console.error('Error fetching streams:', error);
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmbedData = async (streamId, streamPassword = '') => {
    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/streams/${streamId}/embed`, {
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

  const selectStream = async (stream) => {
    // Check if stream is password protected
    if (stream.isPasswordProtected) {
      setPendingStream(stream);
      setShowPasswordModal(true);
      setPassword('');
      setPasswordError('');
      return;
    }
    
    // If not password protected, proceed normally
    try {
      setSelectedStream(stream);
      await fetchEmbedData(stream._id);
    } catch (error) {
      console.error('Error selecting stream:', error);
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
      await fetchEmbedData(pendingStream._id, password);
      setSelectedStream(pendingStream);
      setShowPasswordModal(false);
      setPendingStream(null);
      setPassword('');
    } catch (error) {
      setPasswordError(error.message || 'Invalid password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPendingStream(null);
    setPassword('');
    setPasswordError('');
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
            <strong>{pendingStream?.title}</strong>
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

  if (selectedStream && embedData) {
    return (
      <div className="tyagi-app">
        <div className="tyagi-container">
          <button 
            className="tyagi-back-btn"
            onClick={() => {
              setSelectedStream(null);
              setEmbedData(null);
            }}
          >
            ← Back to Streams
          </button>
          
          <div className="tyagi-stream-viewer">
            <div className="tyagi-video-section">
              <div className="tyagi-video-container">
                <iframe
                  src={`${embedData.embedUrl}?autoplay=${selectedStream.status === 'live' ? '1' : '0'}&modestbranding=1&rel=0`}
                  title={embedData.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="tyagi-video-iframe"
                ></iframe>
              </div>
              
              <div className="tyagi-video-info">
                <div className="tyagi-video-title-row">
                  <h1 className="tyagi-video-title">{selectedStream.title}</h1>
                  {embedData.isPasswordProtected && (
                    <div className="tyagi-protected-badge">
                      <Lock size={16} />
                      <span>Protected</span>
                    </div>
                  )}
                </div>
                <div className="tyagi-video-meta">
                  <div className="tyagi-meta-item">
                    <Calendar size={16} />
                    <span>{formatDate(selectedStream.scheduledDate)}</span>
                  </div>
                  <div className="tyagi-meta-item">
                    <Clock size={16} />
                    <span>{formatTime(selectedStream.scheduledTime)}</span>
                  </div>
                  {getStatusBadge(selectedStream.status)}
                </div>
                <p className="tyagi-video-description">{selectedStream.description}</p>
              </div>
            </div>
            
            <div className="tyagi-chat-section">
              <div className="tyagi-chat-header">
                <Users size={20} />
                <h3>Live Chat</h3>
              </div>
              <div className="tyagi-chat-container">
                {selectedStream.status === 'live' ? (
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
                      {selectedStream.status === 'ended' 
                        ? 'This stream has ended. Chat is no longer available.' 
                        : 'Live chat will be available when the stream goes live'
                      }
                    </p>
                    {selectedStream.status === 'scheduled' && (
                      <div className="tyagi-chat-schedule">
                        <Clock size={16} />
                        <span>Scheduled for {formatDate(selectedStream.scheduledDate)} at {formatTime(selectedStream.scheduledTime)}</span>
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

  return (
    <div className="tyagi-app">
      <div className="tyagi-container">
        <header className="tyagi-header">
          <div className="tyagi-header-content">
            <h1 className="tyagi-header-title">
              <Tv className="tyagi-header-icon" />
             
            </h1>
            <p className="tyagi-header-subtitle">Watch live streams and upcoming events</p>
          </div>
        </header>

        <div className="tyagi-tabs">
          <button
            className={`tyagi-tab ${activeTab === 'upcoming' ? 'tyagi-tab-active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <Calendar size={20} />
            Upcoming Streams
          </button>
          <button
            className={`tyagi-tab ${activeTab === 'live' ? 'tyagi-tab-active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            <Play size={20} />
            Live Now
          </button>
          <button
            className={`tyagi-tab ${activeTab === 'ended' ? 'tyagi-tab-active' : ''}`}
            onClick={() => setActiveTab('ended')}
          >
            <Tv size={20} />
            Ended Streams
          </button>
        </div>

        <div className="tyagi-content">
          {loading ? (
            <div className="tyagi-loading">
              <div className="tyagi-loading-spinner"></div>
              <p>Loading streams...</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="tyagi-empty-state">
              <Tv size={64} className="tyagi-empty-icon" />
              <h3>No {activeTab} streams</h3>
              <p>Check back later for new content!</p>
            </div>
          ) : (
            <div className="tyagi-streams-grid">
              {streams.map((stream) => (
                <div key={stream._id} className="tyagi-stream-card">
                  <div className="tyagi-stream-thumbnail">
                    <img
                      src={stream.embedId ? `https://img.youtube.com/vi/${stream.embedId}/maxresdefault.jpg` : profileImage}
                      alt={stream.title}
                      className="tyagi-thumbnail-img"
                      onError={(e) => {
                        if (stream.embedId) {
                          e.target.src = profileImage;
                        }
                      }}
                    />
                    <div className="tyagi-thumbnail-overlay">
                      <button
                        className="tyagi-play-btn"
                        onClick={() => selectStream(stream)}
                      >
                        {stream.isPasswordProtected ? <Lock size={24} /> : <Play size={24} />}
                      </button>
                    </div>
                    {getStatusBadge(stream.status)}
                    {stream.isPasswordProtected && (
                      <div className="tyagi-protected-indicator">
                        <Lock size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="tyagi-stream-info">
                    <div className="tyagi-stream-title-row">
                      <h3 className="tyagi-stream-title">{stream.title}</h3>
                      {stream.isPasswordProtected && (
                        <Lock size={16} className="tyagi-lock-icon" />
                      )}
                    </div>
                    <p className="tyagi-stream-description">{stream.description}</p>
                    
                    <div className="tyagi-stream-meta">
                      <div className="tyagi-meta-row">
                        <Calendar size={16} />
                        <span>{formatDate(stream.scheduledDate)}</span>
                      </div>
                      <div className="tyagi-meta-row">
                        <Clock size={16} />
                        <span>{formatTime(stream.scheduledTime)}</span>
                      </div>
                    </div>
                    
                    <button
                      className="tyagi-watch-btn"
                      onClick={() => selectStream(stream)}
                    >
                      {stream.isPasswordProtected && '🔒 '}
                      {stream.status === 'live' ? 'Watch Live' : stream.status === 'ended' ? 'Watch Recording' : 'Watch Stream'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && <PasswordModal />}
    </div>
  );
};

export default StreamApp;