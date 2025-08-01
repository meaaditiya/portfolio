import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Tv, Lock } from 'lucide-react';
import '../pagesCSS/Stream.css';
import profileImage from '../images/livestream.png';

const StreamApp = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

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

  const selectStream = (stream) => {
    // Navigate to StreamPost component with stream ID
    window.location.href = `/streampost/${stream._id}`;
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
    </div>
  );
};

export default StreamApp;