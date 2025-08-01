
import React, { useState, useEffect, useRef } from 'react';
import '../pagesCSS/Community.css';
import Dots from './DotsLoader';

const Community = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ email: '', name: '' });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [pollVotes, setPollVotes] = useState({});
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [activeProfileImage, setActiveProfileImage] = useState(null);
  const [videoStates, setVideoStates] = useState({});
  const [controlsTimeout, setControlsTimeout] = useState({});
  const videoRefs = useRef({});

  useEffect(() => {
    const savedUserInfo = localStorage.getItem('communityUserInfo');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    } else {
      setShowUserForm(true);
    }
    
    fetchPosts();
    fetchActiveProfileImage();
  }, [currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      Object.keys(videoRefs.current).forEach(postId => {
        const video = videoRefs.current[postId];
        if (video) {
          const rect = video.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          
          if (isVisible && !videoStates[postId]?.userInteracted) {
            if (video.paused) {
              video.play().catch(console.error);
              setVideoStates(prev => ({
                ...prev,
                [postId]: { ...prev[postId], isPlaying: true }
              }));
            }
          } else if (!isVisible && !videoStates[postId]?.userInteracted) {
            if (!video.paused) {
              video.pause();
              setVideoStates(prev => ({
                ...prev,
                [postId]: { ...prev[postId], isPlaying: false }
              }));
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [videoStates]);
useEffect(() => {
  return () => {
    Object.values(controlsTimeout).forEach(timeoutId => {
      if (timeoutId) clearTimeout(timeoutId);
    });
  };
}, [controlsTimeout]);
  const fetchActiveProfileImage = async () => {
    try {
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/profile-image/active');
      if (response.ok) {
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setActiveProfileImage(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching active profile image:', error);
    }
  };

 const fetchPosts = async () => {
  try {
    setLoading(true);
    const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/posts?page=${currentPage}&limit=10`);
    const data = await response.json();
    setPosts(data.posts);
    setTotalPages(data.totalPages);
    
    // Initialize video states for new posts
    data.posts.forEach(post => {
      if (post.postType === 'video') {
        setVideoStates(prev => ({
          ...prev,
          [post._id]: {
            isPlaying: false,
            isMuted: true,
            volume: 0.5, // Ensure initial volume is set
            currentTime: 0,
            duration: 0,
            isLoading: false,
            showControls: false,
            quality: 'auto',
            playbackRate: 1,
            userInteracted: false
          }
        }));
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
  } finally {
    setLoading(false);
  }
};

  const handleUserSubmit = () => {
    if (userForm.email && userForm.name) {
      const userInfo = { email: userForm.email, name: userForm.name };
      localStorage.setItem('communityUserInfo', JSON.stringify(userInfo));
      setUserInfo(userInfo);
      setShowUserForm(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('communityUserInfo');
    setUserInfo(null);
    setShowUserForm(true);
  };

  const handleLike = async (postId) => {
    if (!userInfo) return;

    try {
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const isLiked = post.likes.some(like => like.userEmail === userInfo.email);
            const newLikes = isLiked 
              ? post.likes.filter(like => like.userEmail !== userInfo.email)
              : [...post.likes, { userEmail: userInfo.email, userName: userInfo.name }];
            
            return { ...post, likes: newLikes };
          }
          return post;
        })
      );

      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: userInfo.email, userName: userInfo.name })
      });

      if (!response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error liking post:', error);
      fetchPosts();
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/posts/${postId}/comments`);
      const data = await response.json();
      setComments(prev => ({ ...prev, [postId]: data.comments }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    if (!showComments[postId]) {
      fetchComments(postId);
    }
  };

  const handleComment = async (postId) => {
    if (!userInfo || !newComment.trim()) return;

    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment,
          parentComment: replyTo,
          userEmail: userInfo.email,
          userName: userInfo.name
        })
      });

      if (response.ok) {
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              return { ...post, comments: [...post.comments, {}] };
            }
            return post;
          })
        );

        setNewComment('');
        setReplyTo(null);
        fetchComments(postId);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!userInfo) return;

    try {
      setComments(prevComments => {
        const newComments = { ...prevComments };
        Object.keys(newComments).forEach(postId => {
          newComments[postId] = newComments[postId].map(comment => {
            if (comment._id === commentId) {
              const isLiked = comment.likes.some(like => like.userEmail === userInfo.email);
              const newLikes = isLiked 
                ? comment.likes.filter(like => like.userEmail !== userInfo.email)
                : [...comment.likes, { userEmail: userInfo.email, userName: userInfo.name }];
              return { ...comment, likes: newLikes };
            }
            
            if (comment.replies) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply._id === commentId) {
                  const isLiked = reply.likes.some(like => like.userEmail === userInfo.email);
                  const newLikes = isLiked 
                    ? reply.likes.filter(like => like.userEmail !== userInfo.email)
                    : [...reply.likes, { userEmail: userInfo.email, userName: userInfo.name }];
                  return { ...reply, likes: newLikes };
                }
                return reply;
              });
              return { ...comment, replies: updatedReplies };
            }
            
            return comment;
          });
        });
        return newComments;
      });

      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: userInfo.email, userName: userInfo.name })
      });

      if (!response.ok) {
        const postId = Object.keys(comments).find(pId => 
          comments[pId].some(comment => comment._id === commentId)
        );
        if (postId) {
          fetchComments(postId);
        }
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!userInfo) return;

    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: userInfo.email })
      });

      if (response.ok) {
        const postId = Object.keys(comments).find(pId => 
          comments[pId].some(comment => comment._id === commentId)
        );
        if (postId) {
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post._id === postId) {
                return { ...post, comments: post.comments.slice(0, -1) };
              }
              return post;
            })
          );
          
          fetchComments(postId);
        }
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!userInfo) return;

    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: userInfo.email })
      });

      if (response.ok) {
        const postId = Object.keys(comments).find(pId => 
          comments[pId].some(comment => comment._id === commentId)
        );
        if (postId) {
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post._id === postId) {
                return { ...post, comments: post.comments.slice(0, -x1) };
              }
              return post;
            })
          );
          
          fetchComments(postId);
        }
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

   const isPollExpired = (post) => {
    if (!post.pollExpiresAt) return false;
    return new Date() > new Date(post.pollExpiresAt);
  };

  // Updated handlePollVote function
  const handlePollVote = async (postId, optionIndex) => {
    if (!userInfo) return;

    const post = posts.find(p => p._id === postId);
    if (isPollExpired(post)) {
      return; // Don't allow voting on expired polls
    }

    try {
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const updatedPollOptions = post.pollOptions.map((option, index) => {
              if (index === optionIndex) {
                const newVotes = [...option.votes, { userEmail: userInfo.email, userName: userInfo.name }];
                return { ...option, votes: newVotes };
              }
              return option;
            });
            return { ...post, pollOptions: updatedPollOptions };
          }
          return post;
        })
      );

      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIndex,
          userEmail: userInfo.email,
          userName: userInfo.name
        })
      });

      if (response.ok) {
        setPollVotes(prev => ({ ...prev, [postId]: optionIndex }));
      } else {
        const error = await response.json();
        if (error.message && error.message.includes('expired')) {
          alert('This poll has expired and is no longer accepting votes.');
        } else {
          alert(error.message || 'Error voting on poll');
        }
        fetchPosts();
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
      alert('Error voting on poll. Please try again.');
      fetchPosts();
    }
  };


  const isQuizExpired = (post) => {
    if (!post.quizExpiresAt) return false;
    return new Date() > new Date(post.quizExpiresAt);
  };

  // Updated handleQuizAnswer function
  const handleQuizAnswer = (postId, questionIndex, answer) => {
    const post = posts.find(p => p._id === postId);
    if (isQuizExpired(post)) {
      return; // Don't allow answering expired quizzes
    }
    
    setQuizAnswers(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [questionIndex]: answer
      }
    }));
  };

  // Updated submitQuiz function
  const submitQuiz = async (postId, totalQuestions) => {
    if (!userInfo) return;

    const post = posts.find(p => p._id === postId);
    if (isQuizExpired(post)) {
      alert('This quiz has expired and can no longer be submitted.');
      return;
    }

    const answers = [];
    for (let i = 0; i < totalQuestions; i++) {
      answers.push(quizAnswers[postId]?.[i] || 0);
    }

    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/posts/${postId}/quiz-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          userEmail: userInfo.email,
          userName: userInfo.name
        })
      });

      if (response.ok) {
        const result = await response.json();
        setQuizResults(prev => ({ ...prev, [postId]: result }));
      } else {
        const error = await response.json();
        if (error.message && error.message.includes('expired')) {
          alert('This quiz has expired and can no longer be submitted.');
        } else {
          alert(error.message || 'Error submitting quiz');
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    }
  };


  const openFullScreenImage = (imageUrl) => {
    setFullScreenImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  // Video Player Functions
  const handleVideoClick = (postId, event) => {
  event.stopPropagation();
  const video = videoRefs.current[postId];
  if (!video) {
    console.error(`Video element not found for postId: ${postId}`);
    return;
  }

  // Show controls when video is clicked
  showVideoControls(postId);

  console.log(`Video click for postId: ${postId}, paused: ${video.paused}, ended: ${video.ended}`);

  if (video.paused || video.ended) {
    video.play().then(() => {
      console.log(`Playing video for postId: ${postId}`);
      setVideoStates(prev => ({
        ...prev,
        [postId]: { ...prev[postId], isPlaying: true, userInteracted: true }
      }));
    }).catch(error => {
      console.error(`Error playing video for postId: ${postId}`, error);
    });
  } else {
    video.pause();
    console.log(`Pausing video for postId: ${postId}`);
    setVideoStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], isPlaying: false, userInteracted: true }
    }));
  }
};

 const handleVolumeChange = (postId, volume) => {
  const video = videoRefs.current[postId];
  if (video) {
    const clampedVolume = Math.max(0, Math.min(1, parseFloat(volume))); // Ensure volume is between 0 and 1
    video.volume = clampedVolume;
    video.muted = clampedVolume === 0; // Sync muted state with volume
    setVideoStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], volume: clampedVolume, isMuted: clampedVolume === 0 }
    }));
    console.log(`Volume changed for postId: ${postId}, volume: ${clampedVolume}`); // Debugging
  } else {
    console.error(`Video element not found for postId: ${postId}`);
  }
};
const toggleMute = (postId) => {
  const video = videoRefs.current[postId];
  if (video) {
    const newMutedState = !video.muted;
    video.muted = newMutedState;
    setVideoStates(prev => ({
      ...prev,
      [postId]: { 
        ...prev[postId], 
        isMuted: newMutedState,
        volume: newMutedState ? 0 : (prev[postId].volume || 0.5) // Restore previous volume or default to 0.5
      }
    }));
    console.log(`Mute toggled for postId: ${postId}, muted: ${newMutedState}`);
  }
};
  const handleTimeUpdate = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      setVideoStates(prev => ({
        ...prev,
        [postId]: { 
          ...prev[postId], 
          currentTime: video.currentTime,
          duration: video.duration || 0
        }
      }));
    }
  };

  const handleProgressClick = (postId, event) => {
    const video = videoRefs.current[postId];
    const progressBar = event.currentTarget;
    const clickX = event.clientX - progressBar.getBoundingClientRect().left;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;
    
    if (video && video.duration) {
      video.currentTime = percentage * video.duration;
    }
  };

  const handleQualityChange = (postId, quality) => {
    const video = videoRefs.current[postId];
    if (video) {
      const currentTime = video.currentTime;
      const isPlaying = !video.paused;
      
      // Construct URL for the selected quality
      const qualityMap = {
        '1080p': '1080p',
        '720p': '720p',
        '480p': '480p',
        '360p': '360p',
        'auto': '0'
      };
      const qualityPath = qualityMap[quality] || '0';
      video.src = `https://connectwithaaditiyamg.onrender.com/api/community/posts/${postId}/media/video/${qualityPath}`;
      
      setVideoStates(prev => ({
        ...prev,
        [postId]: { ...prev[postId], quality, isLoading: true }
      }));

      video.load();
      video.currentTime = currentTime;
      
      if (isPlaying) {
        video.play().catch(console.error);
      }
    }
  };
const handleSpeedChange = (postId, speed) => {
  const video = videoRefs.current[postId];
  if (video) {
    video.playbackRate = speed;
    setVideoStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], playbackRate: speed }
    }));
  }
};
  const handleFullscreen = (postId) => {
    const videoWrapper = videoRefs.current[postId]?.parentElement;
    if (videoWrapper) {
      if (!document.fullscreenElement) {
        videoWrapper.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      } else {
        document.exitFullscreen().catch(err => {
          console.error('Error attempting to exit fullscreen:', err);
        });
      }
    }
  };

  const showVideoControls = (postId) => {
    setVideoStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], showControls: true }
    }));
    if (controlsTimeout[postId]) {
    clearTimeout(controlsTimeout[postId]);
  }
   const timeoutId = setTimeout(() => {
    setVideoStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], showControls: false }
    }));
  }, 5000);
  
  setControlsTimeout(prev => ({
    ...prev,
    [postId]: timeoutId
  }));
  };

 const hideVideoControls = (postId) => {
  // Clear the timeout when manually hiding
  if (controlsTimeout[postId]) {
    clearTimeout(controlsTimeout[postId]);
    setControlsTimeout(prev => {
      const newTimeouts = { ...prev };
      delete newTimeouts[postId];
      return newTimeouts;
    });
  }
  
  setVideoStates(prev => ({
    ...prev,
    [postId]: { ...prev[postId], showControls: false }
  }));
};

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

const renderVideoPlayer = (post) => {
  const videoState = videoStates[post._id] || {};
  const progress = videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0;

  return (
    <div className="advanced-video-container">
      <div 
        className="video-wrapper"
        onMouseEnter={() => showVideoControls(post._id)}
        onMouseLeave={() => hideVideoControls(post._id)}
        onMouseMove={() => showVideoControls(post._id)} // Add this to reset timer on mouse movement
      >
        <video
          ref={el => videoRefs.current[post._id] = el}
          src={`https://connectwithaaditiyamg.onrender.com/api/community/posts/${post._id}/media/video/0`}
          className="advanced-video-player"
          loop
          muted={videoState.isMuted}
          onTimeUpdate={() => handleTimeUpdate(post._id)}
          onLoadedMetadata={() => handleTimeUpdate(post._id)}
          onClick={(e) => handleVideoClick(post._id, e)}
          onWaiting={() => setVideoStates(prev => ({ ...prev, [post._id]: { ...prev[post._id], isLoading: true } }))}
          onCanPlay={() => setVideoStates(prev => ({ ...prev, [post._id]: { ...prev[post._id], isLoading: false } }))}
        />
        
        {/* Loading Spinner */}
        {videoState.isLoading && (
          <div className="video-loading-spinner">
            <div className="spinner"></div>
          </div>
        )}

        {/* Video Controls */}
        <div className={`video-controls ${videoState.showControls ? 'visible' : ''}`}>
          <div className="video-controls-background"></div>
          
          {/* Progress Bar */}
          <div className="video-progress-container">
            <div 
              className="video-progress-bar"
              onClick={(e) => handleProgressClick(post._id, e)}
              onMouseDown={() => showVideoControls(post._id)} // Reset timer when interacting
            >
              <div 
                className="video-progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
              <div 
                className="video-progress-handle"
                style={{ left: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="video-controls-bar">
            <div className="video-controls-left">
              <button 
                className="video-control-button"
                onClick={(e) => handleVideoClick(post._id, e)}
                onMouseDown={() => showVideoControls(post._id)} // Reset timer when clicking buttons
              >
                {videoState.isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
                
              {/* --- CORRECTED VOLUME BUTTON --- */}
              <button 
                className="video-control-button"
                onClick={() => toggleMute(post._id)}
                onMouseDown={() => showVideoControls(post._id)}
              >
                {videoState.isMuted ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
              {/* --- END OF CORRECTION --- */}

              <div className="video-volume-container">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01" // Changed from 0.1 to 0.01 for smoother control
                  value={videoState.volume !== undefined ? videoState.volume : 0.5}
                  onChange={(e) => handleVolumeChange(post._id, parseFloat(e.target.value))}
                  onInput={(e) => console.log(`Slider input: ${e.target.value}`)} // Debugging
                  onMouseDown={() => showVideoControls(post._id)}
                  className="video-volume-slider"
                />
              </div>

              <span className="video-time">
                {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
              </span>
            </div>

            <div className="video-controls-right">
              <select 
                className="video-speed-selector"
                value={videoState.playbackRate || 1}
                onChange={(e) => handleSpeedChange(post._id, parseFloat(e.target.value))}
                onMouseDown={() => showVideoControls(post._id)}
              >
                <option value="0.1">0.1x</option>
                <option value="0.2">0.2x</option>
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
                <option value="8">8x</option>
                <option value="16">16x</option>
              </select>
              
              <select 
                className="video-quality-selector"
                value={videoState.quality || 'auto'}
                onChange={(e) => handleQualityChange(post._id, e.target.value)}
                onMouseDown={() => showVideoControls(post._id)}
              >
                <option value="auto">Auto</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>

              <button 
                className="video-control-button"
                onClick={() => handleFullscreen(post._id)}
                onMouseDown={() => showVideoControls(post._id)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {post.caption && <p className="video-caption">{post.caption}</p>}
    </div>
  );
};

  const renderPost = (post) => {
    const isLiked = post.likes.some(like => like.userEmail === userInfo?.email);
    const hasVoted = post.postType === 'poll' && post.pollOptions.some(option => 
      option.votes.some(vote => vote.userEmail === userInfo?.email)
    );

    return (
      <div key={post._id} className="community-post-card">
        <div className="post-header">           
          <div className="post-author-info">             
            <div className="author-profile-section">               
              {activeProfileImage && (                 
                <img                    
                  src={activeProfileImage}                    
                  alt="Profile"                    
                  className="author-profile-image"                 
                />               
              )}               
              <span className="author-name">{post.author.username}</span>
              <span className="post-time-ago">{formatTimeAgo(post.createdAt)}</span>
              {post.postType !== 'image' && (                 
                <div className="post-type-badge">{post.postType}</div>               
              )}
            </div>           
          </div>         
        </div>

        <div className="post-content">
          <p className="post-description">{post.description}</p>

          {post.postType === 'image' && post.images && (
            <div className="post-images">
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={`https://connectwithaaditiyamg.onrender.com/api/community/posts/${post._id}/media/image/${index}`}
                  alt={`Post image ${index + 1}`}
                  className="post-image"
                  onClick={() => openFullScreenImage(`https://connectwithaaditiyamg.onrender.com/api/community/posts/${post._id}/media/image/${index}`)}
                />
              ))}
            </div>
          )}

          {post.postType === 'video' && post.video && renderVideoPlayer(post)}

          {post.postType === 'poll' && (
    <div className="post-poll">
      
      
      <div className="poll-options">
        {post.pollOptions.map((option, index) => {
          const totalVotes = post.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
          const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
          const userHasVoted = post.pollOptions.some(opt => 
            opt.votes.some(vote => vote.userEmail === userInfo?.email)
          );
          
          return (
            <div key={index} className="poll-option">
              <button
                onClick={() => handlePollVote(post._id, index)}
                disabled={userHasVoted || isPollExpired(post)}
                className={`poll-option-button ${userHasVoted || isPollExpired(post) ? 'disabled' : ''}`}
              >
                <span className="poll-option-text">{option.option}</span>
                {(userHasVoted || isPollExpired(post)) && (
                  <div className="poll-result">
                    <div 
                      className="poll-progress-bar"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="poll-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                )}
              </button>
              <span className="poll-vote-count">{option.votes.length} votes</span>
            </div>
          );
        })}
      </div>
      
      {post.pollExpiresAt && (
        <p className={`poll-expiry ${isPollExpired(post) ? 'expired' : ''}`}>
          {isPollExpired(post) ? 'Expired' : 'Expires'}: {new Date(post.pollExpiresAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )}
         {post.postType === 'quiz' && (
    <div className="post-quiz">
      {isQuizExpired(post) && (
        <div className="quiz-expired-notice">
          <p>This quiz has expired and is no longer available.</p>
          {post.quizExpiresAt && (
            <p>Expired on: {new Date(post.quizExpiresAt).toLocaleDateString()}</p>
          )}
        </div>
      )}
      
      {!quizResults[post._id] ? (
        <div className="quiz-questions">
          {post.quizQuestions.map((question, qIndex) => (
            <div key={qIndex} className="quiz-question">
              <h4 className="question-text">{question.question}</h4>
              <div className="quiz-options">
                {question.options.map((option, oIndex) => (
                  <label key={oIndex} className={`quiz-option ${isQuizExpired(post) ? 'disabled' : ''}`}>
                    <input
                      type="radio"
                      name={`quiz-${post._id}-${qIndex}`}
                      value={oIndex}
                      onChange={() => handleQuizAnswer(post._id, qIndex, oIndex)}
                      checked={quizAnswers[post._id]?.[qIndex] === oIndex}
                      disabled={isQuizExpired(post)}
                    />
                    <span className="quiz-option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => submitQuiz(post._id, post.quizQuestions.length)}
            className={`quiz-submit-button ${isQuizExpired(post) ? 'disabled' : ''}`}
            disabled={isQuizExpired(post)}
          >
            {isQuizExpired(post) ? 'Quiz Expired' : 'Submit Quiz'}
          </button>
        </div>
      ) : (
        <div className="quiz-results">
          <h4 className="quiz-score">
            Score: {quizResults[post._id].score} / {quizResults[post._id].totalQuestions}
          </h4>
          <div className="quiz-detailed-results">
            {quizResults[post._id].results.map((result, index) => (
              <div key={index} className={`quiz-result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                <p className="result-question">{result.question}</p>
                <p className="result-status">
                  {result.isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                {result.explanation && (
                  <p className="result-explanation">{result.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {post.quizExpiresAt && !isQuizExpired(post) && (
        <p className="quiz-expiry">
          Expires: {new Date(post.quizExpiresAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )}
          {post.postType === 'link' && (
            <div className="post-link">
              <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="link-preview">
                {post.linkThumbnail && (
                  <img src={post.linkThumbnail} alt="Link preview" className="link-thumbnail" />
                )}
                <div className="link-content">
                  <h4 className="link-title">{post.linkTitle}</h4>
                  <p className="link-description">{post.linkDescription}</p>
                  <span className="link-url">{post.linkUrl}</span>
                </div>
              </a>
            </div>
          )}
        </div>

        <div className="post-actions">
          <button
            onClick={() => handleLike(post._id)}
            className={`action-button like-button ${isLiked ? 'liked' : ''}`}
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="action-text">Like ({post.likes.length})</span>
          </button>

          <button
            onClick={() => toggleComments(post._id)}
            className="action-button comment-button"
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h11c.55 0 1-.45 1-1z"/>
            </svg>
            <span className="action-text">Comment ({post.comments.length})</span>
          </button>
        </div>

        {showComments[post._id] && (
          <div className="unique-post-interaction-zone">
            <div className="unique-comment-input-panel">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                className="unique-comment-text-field"
              />
              <div className="unique-comment-action-controls">
                {replyTo && (
                  <button
                    onClick={() => setReplyTo(null)}
                    className="unique-cancel-response-btn"
                  >
                    Cancel Reply
                  </button>
                )}
                <button
                  onClick={() => handleComment(post._id)}
                  className="unique-submit-response-btn"
                >
                  {replyTo ? 'Reply' : 'Comment'}
                </button>
              </div>
            </div>

            <div className="unique-comment-thread">
              {comments[post._id]?.map((comment) => (
                <div key={comment._id} className="unique-comment-entry">
                  <div className="unique-comment-header-bar">
                    <div className="unique-comment-author-details">
                      <span className="unique-comment-author-name">{comment.userName}</span>
                      <span className="unique-comment-timestamp">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    {comment.userEmail === userInfo?.email && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="unique-comment-remove-btn"
                        title="Delete comment"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <p className="unique-comment-body">{comment.comment}</p>
                  <div className="unique-comment-interactions">
                    <button
                      onClick={() => handleCommentLike(comment._id)}
                      className="unique-comment-like-action"
                    >
                      <svg className="unique-comment-symbol" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {comment.likes.length}
                    </button>
                    <button
                      onClick={() => setReplyTo(comment._id)}
                      className="unique-comment-reply-action"
                    >
                      Reply
                    </button>
                  </div>

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="unique-comment-responses">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="unique-response-item">
                          <div className="unique-response-header">
                            <div className="unique-response-author-info">
                              <span className="unique-response-author">{reply.userName}</span>
                              <span className="unique-response-timestamp">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            {reply.userEmail === userInfo?.email && (
                              <button
                                onClick={() => handleDeleteReply(comment._id, reply._id)}
                                className="unique-response-remove-btn"
                                title="Delete reply"
                              >
                                <svg className="unique-delete-symbol" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                              </button>
                            )}
                          </div>
                          <p className="unique-response-text">{reply.comment}</p>
                          <button
                            onClick={() => handleCommentLike(reply._id)}
                            className="unique-response-like-action"
                          >
                            <svg className="unique-response-symbol" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {reply.likes.length}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (showUserForm) {
    return (
      <div className="community-container">
        <div className="user-form-overlay">
          <div className="user-form-modal">
            <h2 className="form-title">Join the Community</h2>
            <p className="form-subtitle">Please enter your details to interact with posts</p>
            <div className="user-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <button 
                onClick={handleUserSubmit} 
                className="form-submit-button"
              >
                Join Community
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-container">
      <div className="community-header">
        <div className="user-info">
          <span className="welcome-text">Welcome, {userInfo?.name}!</span>
          <button onClick={handleLogout} className="logout-button">
            Leave Community!
          </button>
        </div>
      </div>

      {loading ? (
            <div className="pst-loading">
              <div><Dots/></div>
              </div>
      ) : (
        <div className="posts-container">
          {posts.length === 0 ? (
            <div className="no-posts-message">
              <p>No posts available at the moment.</p>
            </div>
          ) : (
            posts.map(post => renderPost(post))
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

      {fullScreenImage && (
        <div className="fullscreen-image-overlay" onClick={closeFullScreenImage}>
          <div className="fullscreen-image-container">
            <button
              onClick={closeFullScreenImage}
              className="fullscreen-close-button"
            >
              ×
            </button>
            <img
              src={fullScreenImage}
              alt="Full screen view"
              className="fullscreen-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;