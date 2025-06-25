import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown, FaShare, FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaCopy } from 'react-icons/fa';
import axios from 'axios';
import './blogPost.css';

// Import ReactMarkdown for proper markdown rendering
import ReactMarkdown from 'react-markdown';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Reaction state
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [storedUserInfo, setStoredUserInfo] = useState(null);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [reactionType, setReactionType] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '' });
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [commentSuccess, setCommentSuccess] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentPagination, setCommentPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch blog post details
  useEffect(() => {
    const fetchBlogDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/blogs/${slug}`);
        const data = await response.json();
        
        setBlogPost(data);
        
        // Also fetch reactions if blog post is found
        if (data._id) {
          fetchReactions(data._id);
          fetchComments(data._id);
          
          // Check if user has stored info in localStorage
          const storedInfo = localStorage.getItem('blogUserInfo');
          if (storedInfo) {
            const parsedInfo = JSON.parse(storedInfo);
            setStoredUserInfo(parsedInfo);
            setUserForm({
              name: parsedInfo.name || '',
              email: parsedInfo.email || ''
            });
            
            // Check if user has already reacted
            checkUserReaction(data._id, parsedInfo.email);
          }
        }
      } catch (err) {
        setError('Failed to fetch blog details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogDetails();
  }, [slug]);
  
  // Fetch reaction counts
  const fetchReactions = async (blogId) => {
    try {
      const response = await axios.get(`https://connectwithaaditiyamg.onrender.com/api/blogs/${blogId}/reactions/count`);
      setReactions(response.data);
    } catch (err) {
      console.error('Error fetching reactions:', err);
    }
  };
  
  // Check if user has already reacted
  const checkUserReaction = async (blogId, email) => {
    try {
      const response = await axios.get(
        `https://connectwithaaditiyamg.onrender.com/api/blogs/${blogId}/reactions/user`,
        { params: { email } }
      );
      
      if (response.data.hasReacted) {
        setUserReaction(response.data.reactionType);
      }
    } catch (err) {
      console.error('Error checking user reaction:', err);
    }
  };
  
  // Fetch comments
  const fetchComments = async (blogId, page = 1) => {
    setCommentsLoading(true);
    try {
      const response = await axios.get(
        `https://connectwithaaditiyamg.onrender.com/api/blogs/${blogId}/comments`,
        { params: { page, limit: 5 } }
      );
      
      setComments(response.data.comments);
      setCommentPagination({
        page: response.data.pagination.page,
        pages: response.data.pagination.pages,
        total: response.data.pagination.total
      });
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };
  
  // Handle page change for comments
  const handleCommentPageChange = (newPage) => {
    if (blogPost && blogPost._id) {
      fetchComments(blogPost._id, newPage);
    }
  };
  
  // Handle reaction click
  const handleReactionClick = (type) => {
    setReactionType(type);
    
    // If user info is already stored, submit reaction directly
    if (storedUserInfo && storedUserInfo.email && storedUserInfo.name) {
      submitReaction(type, storedUserInfo);
    } else {
      // Otherwise show modal to collect user info
      setShowReactionModal(true);
    }
  };
  
  // Submit reaction with user info
  const submitReaction = async (type, userInfo) => {
    if (!blogPost || !blogPost._id) return;
    
    try {
      const response = await axios.post(
        `https://connectwithaaditiyamg.onrender.com/api/blogs/${blogPost._id}/reactions`,
        {
          name: userInfo.name,
          email: userInfo.email,
          type
        }
      );
      
      // Store user info for future use
      localStorage.setItem('blogUserInfo', JSON.stringify(userInfo));
      setStoredUserInfo(userInfo);
      
      // Check if user toggled off their reaction
      if (response.data.reactionRemoved) {
        setUserReaction(null);
      } else {
        setUserReaction(type);
      }
      
      // Refresh reaction counts
      fetchReactions(blogPost._id);
      
      // Close modal if open
      setShowReactionModal(false);
    } catch (err) {
      console.error('Error submitting reaction:', err);
      alert(`Error: ${err.response?.data?.message || 'Failed to submit reaction'}`);
    }
  };
  
  // Handle user form submit for reaction
  const handleReactionFormSubmit = (e) => {
    e.preventDefault();
    if (userForm.name.trim() === '' || userForm.email.trim() === '') {
      alert('Name and email are required');
      return;
    }
    
    submitReaction(reactionType, userForm);
  };
  
  // Handle comment form change
  const handleCommentFormChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle comment form submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError(null);
    setCommentSuccess(null);
    
    if (!blogPost || !blogPost._id) return;
    
    if (commentForm.name.trim() === '' || 
        commentForm.email.trim() === '' || 
        commentForm.content.trim() === '') {
      setCommentError('All fields are required');
      return;
    }
    
    try {
      await axios.post(
        `https://connectwithaaditiyamg.onrender.com/api/blogs/${blogPost._id}/comments`,
        commentForm
      );
      
      // Store user info for future use
      localStorage.setItem('blogUserInfo', JSON.stringify({
        name: commentForm.name,
        email: commentForm.email
      }));
      
      // Reset form and show success message
      setCommentForm(prev => ({
        ...prev,
        content: ''
      }));
      setCommentSuccess('Comment submitted successfully! It will appear after review.');
      
      // Refresh comments
      fetchComments(blogPost._id, 1);
      
      // Close form
      setTimeout(() => {
        setShowCommentForm(false);
        setCommentSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setCommentError(err.response?.data?.message || 'Failed to submit comment');
    }
  };

  // Share functions
  const getCurrentUrl = () => {
    return window.location.href;
  };

  const getShareData = () => {
    const url = getCurrentUrl();
    const title = blogPost ? blogPost.title : 'Check out this blog post';
    const text = blogPost ? `Check out this amazing blog post: "${blogPost.title}"` : 'Check out this blog post';
    
    return { url, title, text };
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareData = getShareData();
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
        // Fall back to showing share modal
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleSocialShare = (platform) => {
    const { url, title, text } = getShareData();
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(text);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    const url = getCurrentUrl();
    
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareModal(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
          setShowShareModal(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Could not copy text: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Custom component to render content with inline images
const renderContentWithImages = (content) => {
  if (!content) return null;
  
  // Check if blog post has inline images
  if (blogPost.contentImages && blogPost.contentImages.length > 0) {
    // Create a map of imageId to image object for quick lookup
    const imageMap = {};
    blogPost.contentImages.forEach(image => {
      if (image.imageId) {
        imageMap[image.imageId] = image;
      }
    });
    
    // Split content by image placeholders
    let processedContent = content;
    const parts = [];
    let currentIndex = 0;
    
    // Find all image placeholders and their positions
    const imagePlaceholders = [];
    Object.keys(imageMap).forEach(imageId => {
      const placeholder = `[IMAGE:${imageId}]`;
      let searchIndex = 0;
      let foundIndex;
      
      while ((foundIndex = processedContent.indexOf(placeholder, searchIndex)) !== -1) {
        imagePlaceholders.push({
          imageId,
          placeholder,
          startIndex: foundIndex,
          endIndex: foundIndex + placeholder.length,
          image: imageMap[imageId]
        });
        searchIndex = foundIndex + placeholder.length;
      }
    });
    
    // Sort placeholders by their position in content
    imagePlaceholders.sort((a, b) => a.startIndex - b.startIndex);
    
    // Build parts array with text and images
    imagePlaceholders.forEach((placeholderInfo, index) => {
      // Add text content before this image
      if (placeholderInfo.startIndex > currentIndex) {
        const textContent = processedContent.substring(currentIndex, placeholderInfo.startIndex);
        if (textContent.trim()) {
          parts.push({
            type: 'text',
            content: textContent.trim(),
            key: `text-${index}`
          });
        }
      }
      
      // Add the image
      parts.push({
        type: 'image',
        image: placeholderInfo.image,
        key: `image-${placeholderInfo.imageId}`
      });
      
      currentIndex = placeholderInfo.endIndex;
    });
    
    // Add remaining text content after the last image
    if (currentIndex < processedContent.length) {
      const remainingContent = processedContent.substring(currentIndex);
      if (remainingContent.trim()) {
        parts.push({
          type: 'text',
          content: remainingContent.trim(),
          key: `text-final`
        });
      }
    }
    
    // If no placeholders were found, render as normal markdown
    if (parts.length === 0) {
      return (
        <div className="blog-post-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }
    
    // Render mixed content
    return (
      <div className="blog-post-content">
        {parts.map(part => {
          if (part.type === 'text') {
            return (
              <div key={part.key}>
                <ReactMarkdown>{part.content}</ReactMarkdown>
              </div>
            );
          } else if (part.type === 'image') {
            return (
              <div 
                key={part.key} 
                className={`blog-image blog-image-${part.image.position || 'center'}`}
              >
                <img 
                  src={part.image.url} 
                  alt={part.image.alt || ''} 
                  loading="lazy" 
                />
                {part.image.caption && (
                  <p className="image-caption">{part.image.caption}</p>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }
  
  // No inline images, render as normal markdown
  return (
    <div className="blog-post-content">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

  return (
    <section className="section blog-post-section">
      <button
        className="back-button"
        onClick={() => navigate('/blog')}
      >
        <FaArrowLeft className="back-icon" />
        Back to all posts
      </button>
      
      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="error">{error}</div>
      )}
      
      {!isLoading && blogPost && (
        <div className="card blog-post">
          {blogPost.featuredImage && (
            <img src={blogPost.featuredImage} alt={blogPost.title} className="blog-post-image" />
          )}
          <h1 className="blog-post-title">{blogPost.title}</h1>
          <div className="blog-post-meta">
            <span className="blog-post-date">
              {new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="meta-divider">•</span>
            <span className="blog-post-author">
              {blogPost.author ? `By ${blogPost.author.name}` : 'By Aaditiya Tyagi'}
            </span>
          </div>
          
          {/* Display tags exactly as they are in the blog post */}
          <div className="blog-post-tags">
            {blogPost.tags && blogPost.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
          
          {/* Render content with inline images */}
          {renderContentWithImages(blogPost.content)}
          
          {/* Reactions section */}
          <div className="blog-reactions">
            <h3>Did you find this article helpful?</h3>
            <div className="reaction-buttons">
              <button
                className={`reaction-btn ${userReaction === 'like' ? 'active' : ''}`}
                onClick={() => handleReactionClick('like')}
              >
                {userReaction === 'like' ? <FaThumbsUp /> : <FaRegThumbsUp />}
                <span>{reactions.likes}</span>
              </button>
              <button
                className={`reaction-btn ${userReaction === 'dislike' ? 'active' : ''}`}
                onClick={() => handleReactionClick('dislike')}
              >
                {userReaction === 'dislike' ? <FaThumbsDown /> : <FaRegThumbsDown />}
                <span>{reactions.dislikes}</span>
              </button>
            </div>
          </div>
          
          {/* Share section */}
          <div className="blog-share">
            
            <button 
              className="btn share-btn"
              onClick={handleNativeShare}
            >
              <FaShare />
              Share
            </button>
          </div>
          
          {/* Comments section */}
          <div className="blog-comments">
            <div className="comments-header">
              <h3>Comments ({commentPagination.total})</h3>
              <button 
                className="btn comment-btn"
                onClick={() => {
                  // Pre-fill form if user info exists
                  if (storedUserInfo) {
                    setCommentForm(prev => ({
                      ...prev,
                      name: storedUserInfo.name,
                      email: storedUserInfo.email
                    }));
                  }
                  setShowCommentForm(!showCommentForm);
                }}
              >
                {showCommentForm ? 'Cancel' : 'Add Comment'}
              </button>
            </div>
            
            {/* Comment form */}
            {showCommentForm && (
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                {commentError && <div className="error-message">{commentError}</div>}
                {commentSuccess && <div className="success-message">{commentSuccess}</div>}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={commentForm.name}
                      onChange={handleCommentFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={commentForm.email}
                      onChange={handleCommentFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="content">Comment *</label>
                  <textarea
                    id="content"
                    name="content"
                    value={commentForm.content}
                    onChange={handleCommentFormChange}
                    rows="4"
                    required
                    maxLength="1000"
                  ></textarea>
                  <span className="character-count">
                    {commentForm.content.length}/1000
                  </span>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Submit Comment
                </button>
              </form>
            )}
            
            {/* Comments list */}
            {commentsLoading ? (
              <div className="loading comments-loading">
                <div className="spinner"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <>
                <div className="comments-list">
                  {comments.map(comment => (
                    <div className="comment-card" key={comment._id}>
                      <div className="comment-header">
                        <strong className="comment-author">{comment.user.name}</strong>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                    </div>
                  ))}
                </div>
                
                {/* Comment pagination */}
                {commentPagination.pages > 1 && (
                  <div className="comments-pagination">
                    <button
                      onClick={() => handleCommentPageChange(commentPagination.page - 1)}
                      disabled={commentPagination.page === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    
                    {[...Array(commentPagination.pages).keys()].map(number => (
                      <button
                        key={number + 1}
                        onClick={() => handleCommentPageChange(number + 1)}
                        className={`pagination-btn ${commentPagination.page === number + 1 ? 'active' : ''}`}
                      >
                        {number + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handleCommentPageChange(commentPagination.page + 1)}
                      disabled={commentPagination.page === commentPagination.pages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Share modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share this article</h3>
            <p>Choose how you'd like to share this blog post</p>
            
            <div className="share-options">
              <button 
                className="share-option-btn facebook"
                onClick={() => handleSocialShare('facebook')}
              >
                <FaFacebook />
                Facebook
              </button>
              
              <button 
                className="share-option-btn twitter"
                onClick={() => handleSocialShare('twitter')}
              >
                <FaTwitter />
                Twitter
              </button>
              
              <button 
                className="share-option-btn linkedin"
                onClick={() => handleSocialShare('linkedin')}
              >
                <FaLinkedin />
                LinkedIn
              </button>
              
              <button 
                className="share-option-btn whatsapp"
                onClick={() => handleSocialShare('whatsapp')}
              >
                <FaWhatsapp />
                WhatsApp
              </button>
              
              <button 
                className="share-option-btn copy-link"
                onClick={handleCopyLink}
              >
                <FaCopy />
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowShareModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reaction modal */}
      {showReactionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Share your reaction</h3>
            <p>Please provide your name and email to {reactionType} this post</p>
            
            <form onSubmit={handleReactionFormSubmit}>
              <div className="form-group">
                <label htmlFor="modal-name">Name *</label>
                <input
                  type="text"
                  id="modal-name"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="modal-email">Email *</label>
                <input
                  type="email"
                  id="modal-email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowReactionModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogPost;