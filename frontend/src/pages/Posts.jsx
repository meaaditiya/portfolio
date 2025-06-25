import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft,MessageCircle, X, Send, Trash2, User, ChevronLeft, ChevronRight, Globe, Twitter, Facebook, Linkedin } from 'lucide-react';
import './Posts.css';
const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [socialEmbeds, setSocialEmbeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [socialCurrentPage, setSocialCurrentPage] = useState(1);
  const [socialTotalPages, setSocialTotalPages] = useState(1);
  const [commentInput, setCommentInput] = useState('');
   const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
  });
  const [showUserForm, setShowUserForm] = useState(!userInfo.name || !userInfo.email);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState({});
  
  // New state for social media functionality
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'social'
  const [selectedPlatform, setSelectedPlatform] = useState('all'); // 'all', 'twitter', 'facebook', 'linkedin'
  const [selectedSocialEmbed, setSelectedSocialEmbed] = useState(null);

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: Globe },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin }
  ];

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  useEffect(() => {
    if (activeTab === 'social') {
      fetchSocialEmbeds();
    }
  }, [activeTab, selectedPlatform, socialCurrentPage]);

  // Load social media embed scripts
  useEffect(() => {
    const loadEmbedScript = (src, id) => {
      if (document.getElementById(id)) return;
      
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    };

    // Load Twitter embed script
    loadEmbedScript('https://platform.twitter.com/widgets.js', 'twitter-embed');
    
    // Load Facebook SDK
    loadEmbedScript('https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0', 'facebook-jssdk');
    
    // Load LinkedIn embed script
    loadEmbedScript('https://platform.linkedin.com/in.js', 'linkedin-embed');
    
    // Initialize LinkedIn when script loads
    const checkLinkedIn = () => {
      if (window.IN && window.IN.parse) {
        window.IN.parse();
      } else {
        setTimeout(checkLinkedIn, 100);
      }
    };
    
    setTimeout(checkLinkedIn, 1000);
  }, []);

  // Re-parse embeds when social embeds change
  useEffect(() => {
    if (activeTab === 'social' && socialEmbeds.length > 0) {
      setTimeout(() => {
        // Re-parse Twitter widgets
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
        
        // Re-parse Facebook posts
        if (window.FB && window.FB.XFBML) {
          window.FB.XFBML.parse();
        }
        
        // Re-parse LinkedIn posts
        if (window.IN && window.IN.parse) {
          window.IN.parse();
        }
      }, 100);
    }
  }, [socialEmbeds, activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/image-posts?page=${currentPage}&limit=9`);
      const data = await response.json();
      
      const postsWithDetails = await Promise.all(
        data.posts.map(async (post) => {
          const detailResponse = await fetch(`https://connectwithaaditiyamg.onrender.com/api/image-posts/${post._id}`);
          const detailData = await detailResponse.json();
          
          const reactionResponse = await fetch(
            `https://connectwithaaditiyamg.onrender.com/api/image-posts/${post._id}/has-reacted?email=${encodeURIComponent(userInfo.email)}`
          );
          const reactionData = await reactionResponse.json();
          
          return {
            ...detailData.post,
            comments: detailData.comments,
            hasReacted: reactionData.hasReacted,
          };
        })
      );
      setPosts(postsWithDetails);
      setTotalPages(data.pagination.pages);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch posts. Please try again later.');
      setLoading(false);
      console.error('Error fetching posts:', err);
    }
  };

  const fetchSocialEmbeds = async () => {
    try {
      setSocialLoading(true);
      const platformParam = selectedPlatform === 'all' ? '' : `&platform=${selectedPlatform}`;
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/social-embeds?page=${socialCurrentPage}&limit=9${platformParam}`);
      const data = await response.json();
      setSocialEmbeds(data.embeds);
      setSocialTotalPages(data.pagination.pages);
      setSocialLoading(false);
    } catch (err) {
      console.error('Error fetching social embeds:', err);
      setSocialLoading(false);
    }
  };

  // Extract post ID from URL for native embedding
  const extractPostId = (url, platform) => {
    try {
      switch (platform) {
        case 'twitter':
          const twitterMatch = url.match(/twitter\.com\/[^/]+\/status\/(\d+)/i) || 
                              url.match(/x\.com\/[^/]+\/status\/(\d+)/i);
          return twitterMatch ? twitterMatch[1] : null;
        
        case 'facebook':
          // Facebook post URLs can be complex, return the full URL for iframe
          return url;
        
        case 'linkedin':
          // LinkedIn post URLs, return the full URL
          return url;
        
        default:
          return null;
      }
    } catch (e) {
      console.error('Error extracting post ID:', e);
      return null;
    }
  };

  // Render native embed based on platform
  const renderNativeEmbed = (embed) => {
    const postId = extractPostId(embed.embedUrl, embed.platform);
    
    switch (embed.platform) {
      case 'twitter':
        if (!postId) return <div>Invalid Twitter URL</div>;
        return (
          <blockquote className="twitter-tweet" data-theme="light">
            <a href={embed.embedUrl}></a>
          </blockquote>
        );
      
      case 'facebook':
        return (
          <div className="fb-post" 
               data-href={embed.embedUrl}
               data-width="500"
               data-show-text="true">
          </div>
        );
      
      case 'linkedin':
        return (
          <div className="linkedin-embed">
            <script type="IN/Share" data-url={embed.embedUrl}></script>
          </div>
        );
      
      default:
        return <div>Unsupported platform</div>;
    }
  };

  const handleImageLoad = (postId) => {
    setImageLoadStates(prev => ({ ...prev, [postId]: 'loaded' }));
  };

  const handleImageError = (postId) => {
    setImageLoadStates(prev => ({ ...prev, [postId]: 'error' }));
  };

  const handleUserInfoSubmit = (e) => {
    e.preventDefault();
    if (userInfo.name && userInfo.email) {
      setShowUserForm(false);
    } else {
      alert('Please provide both name and email.');
    }
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentChange = (e) => {
    setCommentInput(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !userInfo.name || !userInfo.email || !selectedPost) {
      alert('Please provide your name, email, and a comment.');
      return;
    }
    
    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/image-posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          content: commentInput,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to post comment');
      
      setCommentInput('');
      
      const detailResponse = await fetch(`https://connectwithaaditiyamg.onrender.com/api/image-posts/${selectedPost.id}`);
      const detailData = await detailResponse.json();
      
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPost.id
            ? {
                ...post,
                comments: detailData.comments,
                commentCount: detailData.post.commentCount,
              }
            : post
        )
      );
      
      setSelectedPost({
        ...selectedPost,
        comments: detailData.comments,
        commentCount: detailData.post.commentCount,
      });
      
    } catch (err) {
      alert('Failed to post comment. Please try again.');
      console.error('Error posting comment:', err);
    }
  };

  const handleReaction = async (postId, e) => {
    e.stopPropagation();
    
    if (!userInfo.name || !userInfo.email) {
      alert('Please provide your name and email to react to posts.');
      return;
    }
    
    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/image-posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to react to post');
      const data = await response.json();
      
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const newReactionCount =
              post.reactionCount !== null
                ? data.hasReacted
                  ? post.reactionCount + 1
                  : post.reactionCount - 1
                : null;
            return {
              ...post,
              hasReacted: data.hasReacted,
              reactionCount: newReactionCount,
            };
          }
          return post;
        })
      );
      
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => ({
          ...prev,
          hasReacted: data.hasReacted,
          reactionCount:
            prev.reactionCount !== null
              ? data.hasReacted
                ? prev.reactionCount + 1
                : prev.reactionCount - 1
              : null,
        }));
      }
    } catch (err) {
      alert('Failed to react to post. Please try again.');
      console.error('Error reacting to post:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!userInfo.email) {
      alert('Please provide your email to delete your comment.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/image-posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userInfo.email }),
      });
      
      if (!response.ok) throw new Error('Failed to delete comment');
      
      const detailResponse = await fetch(`https://connectwithaaditiyamg.onrender.com/api/image-posts/${selectedPost.id}`);
      const detailData = await detailResponse.json();
      
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPost.id
            ? {
                ...post,
                comments: detailData.comments,
                commentCount: detailData.post.commentCount,
              }
            : post
        )
      );
      
      setSelectedPost({
        ...selectedPost,
        comments: detailData.comments,
        commentCount: detailData.post.commentCount,
      });
      
    } catch (err) {
      alert('Failed to delete comment. You can only delete your own comments.');
      console.error('Error deleting comment:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    setShowComments(false);
    document.body.style.overflow = 'hidden';
  };

  const openCommentsModal = (e) => {
    e.stopPropagation();
    setShowComments(true);
  };

  const openSocialEmbedModal = (embed) => {
    setSelectedSocialEmbed(embed);
    document.body.style.overflow = 'hidden';
    
    // Re-parse embeds in modal after a short delay
    setTimeout(() => {
      if (embed.platform === 'twitter' && window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      } else if (embed.platform === 'facebook' && window.FB && window.FB.XFBML) {
        window.FB.XFBML.parse();
      } else if (embed.platform === 'linkedin' && window.IN && window.IN.parse) {
        window.IN.parse();
      }
    }, 100);
  };

  const closeModals = () => {
    setSelectedPost(null);
    setSelectedSocialEmbed(null);
    setShowComments(false);
    document.body.style.overflow = '';
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'social') {
      setSocialCurrentPage(1);
    } else {
      setCurrentPage(1);
    }
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    setSocialCurrentPage(1);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModals();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading && posts.length === 0 && activeTab === 'posts') {
    return (
      <div className="pst-main">
        <div className="pst-loading">
           <div className="spinner"></div>
          <p className="pst-loading-text">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error && activeTab === 'posts') {
    return (
      <div className="pst-main">
        <div className="pst-error">
          <div className="pst-error-icon">⚠️</div>
          <p className="pst-error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pst-main">
      {showUserForm && (
        <div className="pst-user-modal">
          <div className="pst-user-form">
            <div className="pst-user-header">
              <div className="pst-user-icon">
                <User className="pst-icon" />
              </div>
              <h3 className="pst-user-title">Welcome!</h3>
              <p className="pst-user-subtitle">Enter your details to engage with posts</p>
            </div>
            <div className="pst-user-inputs">
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={handleUserInfoChange}
                placeholder="Your Name"
                className="pst-input"
              />
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleUserInfoChange}
                placeholder="Your Email"
                className="pst-input"
              />
              <button 
                onClick={handleUserInfoSubmit}
                className="pst-user-submit"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="pst-tab-navigation">
        <div className="pst-tab-buttons">
          <button
            className={`pst-tab-button ${activeTab === 'posts' ? 'pst-tab-active' : ''}`}
            onClick={() => handleTabChange('posts')}
          >
            <MessageCircle className="pst-icon-sm" />
            <span>Posts</span>
          </button>
          <button
            className={`pst-tab-button ${activeTab === 'social' ? 'pst-tab-active' : ''}`}
            onClick={() => handleTabChange('social')}
          >
            <Globe className="pst-icon-sm" />
            <span>Social Media</span>
          </button>
        </div>
      </div>

      {/* Platform Filter for Social Tab */}
      {activeTab === 'social' && (
        <div className="pst-platform-filter">
          <div className="pst-platform-buttons">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <button
                  key={platform.id}
                  className={`pst-platform-button ${selectedPlatform === platform.id ? 'pst-platform-active' : ''}`}
                  onClick={() => handlePlatformChange(platform.id)}
                >
                  <IconComponent className="pst-icon-sm" />
                  <span>{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pst-container">
        {/* Posts Tab Content */}
        {activeTab === 'posts' && (
          <>
            {posts.length === 0 ? (
              <div className="pst-empty">
                <div className="pst-empty-icon">📷</div>
                <p className="pst-empty-text">No posts yet.</p>
              </div>
            ) : (
              <>
                <div className="pst-grid">
                  {posts.map((post) => (
                    <div 
                      key={post.id} 
                      className="pst-post"
                      onClick={() => openPostModal(post)}
                    >
                      <div className="pst-post-card">
                        <div className="pst-post-image">
                          {imageLoadStates[post.id] !== 'loaded' && imageLoadStates[post.id] !== 'error' && (
                            <div className="pst-image-loading">
                              <div className="pst-image-spinner"></div>
                            </div>
                          )}
                          {imageLoadStates[post.id] === 'error' ? (
                            <div className="pst-image-error">
                              <div className="pst-image-error-content">
                                <div className="pst-image-error-icon">🖼️</div>
                                <p className="pst-image-error-text">Image unavailable</p>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={post.image} 
                              alt={post.caption || 'Post image'} 
                              className="pst-image"
                              onLoad={() => handleImageLoad(post.id)}
                              onError={() => handleImageError(post.id)}
                            />
                          )}
                          <div className="pst-post-overlay">
                            <div className="pst-post-stats">
                              <div className="pst-stat">
                                <Heart className="pst-icon-sm" />
                                <span className="pst-stat-count">{post.reactionCount || 0}</span>
                              </div>
                              <div className="pst-stat">
                                <MessageCircle className="pst-icon-sm" />
                                <span className="pst-stat-count">{post.commentCount || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                       <div className="pst-post-caption">                       
                        <p className="pst-caption-text">                         
                         {post.caption}
                        </p>                        
                         <p className="pst-modal-date">
                           {formatDate(post.createdAt)}                                       
                          </p>                     
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pst-pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="pst-prev-button"
                    >
                      <ChevronLeft className="pst-icon-sm" />
                      <span className="pst-button-text">Previous</span>
                    </button>
                    <div className="pst-page-info">
                      <div className="pst-page-number">
                        {currentPage} / {totalPages}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="pst-next-button"
                    >
                      <span className="pst-button-text">Next</span>
                      <ChevronRight className="pst-icon-sm" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Social Media Tab Content */}
        {activeTab === 'social' && (
          <>
            {socialLoading ? (
              <div className="pst-loading">
               <div className="spinner"></div>
                <p className="pst-loading-text">Loading social media posts...</p>
              </div>
            ) : socialEmbeds.length === 0 ? (
              <div className="pst-empty">
                <div className="pst-empty-icon">🌐</div>
                <p className="pst-empty-text">No social media posts available.</p>
              </div>
            ) : (
              <>
                <div className="pst-grid">
                  {socialEmbeds.map((embed) => {
                    const platformIcon = platforms.find(p => p.id === embed.platform)?.icon || Globe;
                    const PlatformIcon = platformIcon;
                    
                    return (
                      <div 
                        key={embed._id} 
                        className="pst-post pst-social-embed"
                        onClick={() => openSocialEmbedModal(embed)}
                      >
                        <div className="pst-post-card">
                          <div className="pst-social-header">
                            <div className="pst-platform-badge">
                              <PlatformIcon className="pst-icon-sm" />
                              <span className="pst-platform-name">{embed.platform}</span>
                            </div>
                          </div>
                          <div className="pst-social-content">
                            <h3 className="pst-social-title">{embed.title}</h3>
                            {embed.description && (
                              <p className="pst-social-description">{embed.description}</p>
                            )}
                            <p className="pst-modal-date">
                              {formatDate(embed.createdAt)}
                            </p>
                            <div className="pst-social-preview">
                              {renderNativeEmbed(embed)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {socialTotalPages > 1 && (
                  <div className="pst-pagination">
                    <button
                      onClick={() => setSocialCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={socialCurrentPage === 1}
                      className="pst-prev-button"
                    >
                      <ChevronLeft className="pst-icon-sm" />
                      <span className="pst-button-text">Previous</span>
                    </button>
                    <div className="pst-page-info">
                      <div className="pst-page-number">
                        {socialCurrentPage} / {socialTotalPages}
                      </div>
                    </div>
                    <button
                      onClick={() => setSocialCurrentPage((prev) => Math.min(prev + 1, socialTotalPages))}
                      disabled={socialCurrentPage === socialTotalPages}
                      className="pst-next-button"
                    >
                      <span className="pst-button-text">Next</span>
                      <ChevronRight className="pst-icon-sm" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Existing Post Modal */}
      {selectedPost && (
        <div className="pst-post-modal" onClick={closeModals}>
          <div className="pst-post-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="pst-close-button"
              onClick={closeModals}
            >
              <X className="pst-icon" />
            </button>
            <div className="pst-modal-image">
              {imageLoadStates[selectedPost.id] === 'error' ? (
                <div className="pst-modal-image-error">
                  <div className="pst-modal-image-error-icon">🖼️</div>
                  <p className="pst-modal-image-error-text">Image unavailable</p>
                </div>
              ) : (
                <img
                  src={selectedPost.image}
                  alt={selectedPost.caption || 'Post image'}
                  className="pst-modal-image-content"
                  onLoad={() => handleImageLoad(selectedPost.id)}
                  onError={() => handleImageError(selectedPost.id)}
                />
              )}
            </div>
            <div className="pst-modal-details">
              <div className="pst-modal-info">
                <div className="pst-modal-caption">
                  <p className="pst-modal-caption-text">
                    {selectedPost.caption}
                  </p>
                  <p className="pst-modal-date">
                    {formatDate(selectedPost.createdAt)}
                  </p>
                  
                </div>
                <div className="pst-modal-actions">
                  <button
                    className={`pst-like-button ${selectedPost.hasReacted ? 'pst-liked' : ''}`}
                    onClick={(e) => handleReaction(selectedPost.id, e)}
                  >
                    <Heart className={`pst-icon-sm ${selectedPost.hasReacted ? 'pst-icon-filled' : ''}`} />
                    <span className="pst-stat-count">{selectedPost.reactionCount || 0}</span>
                  </button>
                  <button 
                    className="pst-comment-button"
                    onClick={openCommentsModal}
                  >
                    <MessageCircle className="pst-icon-sm" />
                    <span className="pst-stat-count">{selectedPost.commentCount || 0}</span>
                  </button>
                </div>
              </div>
              {showComments && (
                <div className="pst-comments-panel">
                   <h3 className="pst-comments-title">Comments</h3>
                    <button 
                      className="pst-comments-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowComments(false);
                      }}
                    >
                      <ArrowLeft className="pst-icon-sm" />
                    </button>
                  <div className="pst-comments-header">
                   
                  </div>
                  <div className="pst-comments-list">
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((comment) => (
                        <div key={comment._id} className="pst-comment">
                          <div className="pst-comment-icon">
                            <User className="pst-icon-sm" />
                          </div>
                          <div className="pst-comment-content">
                            <div className="pst-comment-header">
                              <span className="pst-comment-name">{comment.user.name}</span>
                              <span className="pst-comment-date">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="pst-comment-text">{comment.content}</p>
                            {comment.user.email === userInfo.email && (
                                <button
                                className="pst-delete-comment"
                                onClick={() => handleDeleteComment(comment._id)}
                              >
                                <Trash2 className="pst-icon-xs" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="pst-no-comments">
                        <MessageCircle className="pst-icon-lg" />
                        <p className="pst-no-comments-text">No comments yet.</p>
                        <p className="pst-no-comments-subtext">Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                  <div className="pst-comment-form">
                    <div className="pst-comment-input">
                      <textarea
                        placeholder="Add a comment..."
                        value={commentInput}
                        onChange={handleCommentChange}
                        className="pst-textarea"
                        rows="2"
                      />
                      <button
                        className="pst-submit-comment"
                        onClick={handleCommentSubmit}
                        disabled={!commentInput.trim() || !userInfo.name || !userInfo.email}
                      >
                        <Send className="pst-icon-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Social Media Embed Modal */}
      {selectedSocialEmbed && (
        <div className="pst-post-modal" onClick={closeModals}>
          <div className="pst-social-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="pst-close-button"
              onClick={closeModals}
            >
              <X className="pst-icon" />
            </button>
            <div className="pst-social-modal-header">
              <div className="pst-platform-badge">
                {(() => {
                  const platformIcon = platforms.find(p => p.id === selectedSocialEmbed.platform)?.icon || Globe;
                  const PlatformIcon = platformIcon;
                  return <PlatformIcon className="pst-icon-sm" />;
                })()}
                <span className="pst-platform-name">{selectedSocialEmbed.platform}</span>
              </div>
              <h2 className="pst-social-modal-title">{selectedSocialEmbed.title}</h2>
              {selectedSocialEmbed.description && (
                <p className="pst-social-modal-description">{selectedSocialEmbed.description}</p>
              )}
              <p className="pst-modal-date">{formatDate(selectedSocialEmbed.createdAt)}</p>
            </div>
            <div className="pst-social-embed-container">
              <div 
                className="pst-social-embed-content"
                dangerouslySetInnerHTML={{ __html: selectedSocialEmbed.embedCode }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;