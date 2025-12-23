import React, { useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import '../pagesCSS/ProfileSlider.css';

const PostsSlider = ({ posts, onPostClick }) => {
  const videoRefs = useRef({});

  const handleVideoHover = (postId, shouldPlay) => {
    const video = videoRefs.current[postId];
    if (video) {
      if (shouldPlay) {
        video.play().catch(err => console.log('Play error:', err));
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }
  };

  const formatVideoDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Duplicate posts for seamless loop
  const duplicatedPosts = [...posts, ...posts];

  return (
    <div className="slider-wrapper">
      <div className="slider-container-custom">
        <div className="slider-track-custom">
          {duplicatedPosts.map((post, index) => (
            <div
              key={`${post.id}-${index}`}
              className="slider-item"
              onClick={() => onPostClick(post)}
              onMouseEnter={() => post.mediaType === 'video' && handleVideoHover(post.id, true)}
              onMouseLeave={() => post.mediaType === 'video' && handleVideoHover(post.id, false)}
            >
              <div className="slider-card">
                {post.mediaType === 'video' ? (
                  <div className="slider-video-container">
                    <video
                      ref={el => videoRefs.current[post.id] = el}
                      src={post.media}
                      poster={post.thumbnail || ''}
                      className="slider-media"
                      loop
                      muted
                      playsInline
                    />
                    <div className="slider-video-badge">
                      <Play className="slider-icon-xs" />
                      {formatVideoDuration(post.videoDuration)}
                    </div>
                  </div>
                ) : (
                  <img
                    src={post.media}
                    alt={post.caption || 'Post'}
                    className="slider-media"
                  />
                )}
                <div className="slider-overlay">
                  <p className="slider-caption">
                    {post.caption?.length > 50
                      ? post.caption.substring(0, 50) + '...'
                      : post.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostsSlider;