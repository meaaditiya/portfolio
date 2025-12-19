import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import '../pagesCSS/AudioCard.css'; 

const AudioPlayerWave = ({ blogPost, isLoggedIn, loggedInUser, navigate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (blogPost?._id) {
      fetchAudio();
    }
  }, [blogPost?._id]);

  const fetchAudio = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/blogs/${blogPost._id}/audio`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      if (!response.ok) throw new Error('Failed to load audio');
      
      const data = await response.json();
      if (audioRef.current) {
        audioRef.current.src = data.audio.url;
      }
    } catch (err) {
      console.error('Error loading audio:', err);
      setError('Audio not available');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  const handleSkip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(
        audioRef.current.currentTime + seconds,
        duration
      ));
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player-modern-wrapper">
      <div className="audio-player-modern">
        <div className="audio-content-area">
          {/* Header with title */}
          <div className="audio-header">
            <div className="audio-title-section">
              <h3 className="audio-title">{blogPost?.title}</h3>
              <p className="audio-podcast-name">
                {blogPost?.author?.name || 'Aaditiya Tyagi'}
              </p>
            </div>
          </div>

          {/* Wave Progress Audio Player */}
          <div className="audio-native-player">
            <audio
              ref={audioRef}
              preload="metadata"
              style={{ display: 'none' }}
            />

            {/* Wave Progress Bar */}
            <div className="wave-progress-container">
              {/* Play Button */}
              <button 
                className="wave-play-btn"
                onClick={handlePlayPause}
                disabled={isLoading || error}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path 
                    d="M8 5v14l11-7z" 
                    style={{ display: isPlaying ? 'none' : 'block' }}
                  />
                  <path 
                    d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" 
                    style={{ display: isPlaying ? 'block' : 'none' }}
                  />
                </svg>
              </button>

              {/* Wave Bars Container */}
              <div className="wave-bars-wrapper">
                <div className="wave-bars-container">
                  {[...Array(50)].map((_, i) => {
                    const heights = [20, 35, 50, 45, 60, 40, 55, 30, 65, 45, 
                                   50, 40, 70, 35, 60, 45, 55, 40, 50, 60,
                                   45, 55, 40, 65, 35, 50, 45, 60, 40, 55,
                                   50, 45, 60, 35, 55, 40, 65, 45, 50, 40,
                                   55, 45, 60, 40, 50, 35, 65, 45, 55, 50];
                    const barProgress = (i / 50) * 100;
                    const isActive = barProgress <= progress;
                    
                    return (
                      <div 
                        key={i} 
                        className={`wave-bar ${isActive ? 'active' : ''} ${isPlaying ? 'playing' : ''}`}
                        style={{ 
                          height: `${heights[i]}%`,
                          animationDelay: `${i * 0.05}s`
                        }}
                        onClick={() => {
                          if (audioRef.current && duration) {
                            audioRef.current.currentTime = (i / 50) * duration;
                          }
                        }}
                      />
                    );
                  })}
                </div>
                
                {/* Hidden Range Slider for accessibility */}
                <input 
                  type="range" 
                  className="wave-progress-slider"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  aria-label="Audio progress"
                />
              </div>

              {/* Time Display */}
              <div className="wave-time-display">
                <span className="wave-current-time">{formatTime(currentTime)}</span>
                <span className="wave-divider">/</span>
                <span className="wave-total-time">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="audio-custom-controls">
            {/* Skip Backward 10s */}
            <button
              className="audio-control-btn skip-btn"
              onClick={() => handleSkip(-10)}
              disabled={isLoading || error}
              title="Rewind 10 seconds"
            >
              <RotateCcw size={18} />
              <span className="skip-time">10s</span>
            </button>

            {/* Skip Forward 10s */}
            <button
              className="audio-control-btn skip-btn"
              onClick={() => handleSkip(10)}
              disabled={isLoading || error}
              title="Forward 10 seconds"
            >
              <RotateCw size={18} />
              <span className="skip-time">10s</span>
            </button>

            {/* Playback Speed */}
            <button
              className="audio-control-btn speed-btn"
              onClick={(e) => {
                if (audioRef.current) {
                  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
                  const currentSpeed = audioRef.current.playbackRate || 1;
                  const currentIndex = speeds.indexOf(currentSpeed);
                  const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
                  audioRef.current.playbackRate = nextSpeed;
                  e.currentTarget.textContent = `${nextSpeed}x`;
                }
              }}
              disabled={isLoading || error}
              title="Playback speed"
            >
              1x
            </button>

            {/* Login Button - Only if subscriber-only AND not logged in */}
            {blogPost?.audioBlog?.audioAccess?.isSubscriberOnly && !isLoggedIn && (
              <button 
                className="audio-login-btn"
                onClick={() => navigate('/auth')}
                title="Login to access subscriber audio"
              >
                Login to access
              </button>
            )}
          </div>

          {/* Audio Metadata */}
          <div className="audio-metadata">
            {blogPost?.audioBlog?.audioMetadata?.language && (
              <span className="audio-language">
                {blogPost.audioBlog.audioMetadata.language.toUpperCase()}
              </span>
            )}
            {blogPost?.audioBlog?.audioMetadata?.narrator && (
              <span className="audio-narrator">
                {blogPost.audioBlog.audioMetadata.narrator}
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="audio-error-message">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="audio-loading-message">
              Loading audio...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerWave;