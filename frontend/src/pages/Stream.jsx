import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Play, Tv } from 'lucide-react';
import './Stream.css';

const StreamApp = () => {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [embedData, setEmbedData] = useState(null);

  useEffect(() => {
    fetchStreams();
  }, [activeTab]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      
      // Always use the main streams endpoint and filter client-side
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/streams');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let streamData = data.streams || [];
      
      // Filter based on active tab
      if (activeTab === 'upcoming') {
        streamData = streamData.filter(stream => stream.status === 'scheduled');
      } else if (activeTab === 'live') {
        streamData = streamData.filter(stream => stream.status === 'live');
      }
      
      setStreams(streamData);
    } catch (error) {
      console.error('Error fetching streams:', error);
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmbedData = async (streamId) => {
    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/streams/${streamId}/embed`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmbedData(data);
    } catch (error) {
      console.error('Error fetching embed data:', error);
      setEmbedData(null);
    }
  };

  const selectStream = (stream) => {
    setSelectedStream(stream);
    fetchEmbedData(stream._id);
  };

  const formatDate = (dateStr) => {
    try {
      // Handle different date formats
      let date;
      if (dateStr.includes('-')) {
        // Format: YYYY-MM-DD
        date = new Date(dateStr + 'T00:00:00');
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        return dateStr; // Return original if parsing fails
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
    // The time is already in the correct format from the schema (HH:MM AM/PM)
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
                  src={`${embedData.embedUrl}?autoplay=1&modestbranding=1&rel=0`}
                  title={embedData.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="tyagi-video-iframe"
                ></iframe>
              </div>
              
              <div className="tyagi-video-info">
                <h1 className="tyagi-video-title">{selectedStream.title}</h1>
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
                    <p>Live chat will be available when the stream goes live</p>
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
                      src={`https://img.youtube.com/vi/${stream.embedId}/maxresdefault.jpg`}
                      alt={stream.title}
                      className="tyagi-thumbnail-img"
                      onError={(e) => {
                        // Fallback to standard definition thumbnail
                        e.target.src = `https://img.youtube.com/vi/${stream.embedId}/sddefault.jpg`;
                      }}
                    />
                    <div className="tyagi-thumbnail-overlay">
                      <button
                        className="tyagi-play-btn"
                        onClick={() => selectStream(stream)}
                      >
                        <Play size={24} />
                      </button>
                    </div>
                    {getStatusBadge(stream.status)}
                  </div>
                  
                  <div className="tyagi-stream-info">
                    <h3 className="tyagi-stream-title">{stream.title}</h3>
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
                      {stream.status === 'live' ? 'Watch Live' : 'Watch Stream'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamApp;