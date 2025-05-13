import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Posts.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commentInput, setCommentInput] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
  });
  const [showUserForm, setShowUserForm] = useState(!userInfo.name || !userInfo.email);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/image-posts?page=${currentPage}&limit=8`);
      const postsWithDetails = await Promise.all(
        response.data.posts.map(async (post) => {
          const detailResponse = await axios.get(`http://localhost:5000/api/image-posts/${post._id}`);
          const reactionResponse = await axios.get(
            `http://localhost:5000/api/image-posts/${post._id}/has-reacted`,
            { params: { email: userInfo.email } }
          );
          return {
            ...detailResponse.data.post,
            comments: detailResponse.data.comments,
            hasReacted: reactionResponse.data.hasReacted,
          };
        })
      );
      setPosts(postsWithDetails);
      setTotalPages(response.data.pagination.pages);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch posts. Please try again later.');
      setLoading(false);
      console.error('Error fetching posts:', err);
    }
  };

  // Handle user info submission
  const handleUserInfoSubmit = (e) => {
    e.preventDefault();
    if (userInfo.name && userInfo.email) {
      localStorage.setItem('userName', userInfo.name);
      localStorage.setItem('userEmail', userInfo.email);
      setShowUserForm(false);
    } else {
      alert('Please provide both name and email.');
    }
  };

  // Handle user info changes
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle comment input changes
  const handleCommentChange = (e) => {
    setCommentInput(e.target.value);
  };

  // Submit a new comment
  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !userInfo.name || !userInfo.email || !selectedPost) {
      alert('Please provide your name, email, and a comment.');
      return;
    }
    
    try {
      await axios.post(`http://localhost:5000/api/image-posts/${selectedPost.id}/comments`, {
        name: userInfo.name,
        email: userInfo.email,
        content: commentInput,
      });
      
      setCommentInput('');
      
      // Refresh comments for the selected post
      const detailResponse = await axios.get(`http://localhost:5000/api/image-posts/${selectedPost.id}`);
      
      // Update the posts array
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPost.id
            ? {
                ...post,
                comments: detailResponse.data.comments,
                commentCount: detailResponse.data.post.commentCount,
              }
            : post
        )
      );
      
      // Update the selected post state
      setSelectedPost({
        ...selectedPost,
        comments: detailResponse.data.comments,
        commentCount: detailResponse.data.post.commentCount,
      });
      
    } catch (err) {
      alert('Failed to post comment. Please try again.');
      console.error('Error posting comment:', err);
    }
  };

  // Toggle like/unlike
  const handleReaction = async (postId, e) => {
    e.stopPropagation();
    
    if (!userInfo.name || !userInfo.email) {
      alert('Please provide your name and email to react to posts.');
      return;
    }
    
    try {
      const response = await axios.post(`http://localhost:5000/api/image-posts/${postId}/react`, {
        name: userInfo.name,
        email: userInfo.email,
      });
      
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const newReactionCount =
              post.reactionCount !== null
                ? response.data.hasReacted
                  ? post.reactionCount + 1
                  : post.reactionCount - 1
                : null;
            return {
              ...post,
              hasReacted: response.data.hasReacted,
              reactionCount: newReactionCount,
            };
          }
          return post;
        })
      );
      
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => ({
          ...prev,
          hasReacted: response.data.hasReacted,
          reactionCount:
            prev.reactionCount !== null
              ? response.data.hasReacted
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

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (!userInfo.email) {
      alert('Please provide your email to delete your comment.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/image-posts/comments/${commentId}`, {
        data: { email: userInfo.email },
      });
      
      // Refresh comments for the selected post
      const detailResponse = await axios.get(`http://localhost:5000/api/image-posts/${selectedPost.id}`);
      
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPost.id
            ? {
                ...post,
                comments: detailResponse.data.comments,
                commentCount: detailResponse.data.post.commentCount,
              }
            : post
        )
      );
      
      setSelectedPost({
        ...selectedPost,
        comments: detailResponse.data.comments,
        commentCount: detailResponse.data.post.commentCount,
      });
      
    } catch (err) {
      alert('Failed to delete comment. You can only delete your own comments.');
      console.error('Error deleting comment:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Open post modal
  const openPostModal = (post) => {
    setSelectedPost(post);
    setShowComments(false);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  // Open comments modal
  const openCommentsModal = (e) => {
    e.stopPropagation();
    setShowComments(true);
  };

  // Close modals
  const closeModals = () => {
    setSelectedPost(null);
    setShowComments(false);
    document.body.style.overflow = ''; // Re-enable scrolling
  };

  // Handle keyboard events to close modals with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModals();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading && posts.length === 0) {
    return <div className="imageFeed_loadingIndicator">Loading posts...</div>;
  }

  if (error) {
    return <div className="imageFeed_errorMessage">{error}</div>;
  }

  return (
    <div className="imageFeed_mainContainer">
      {showUserForm && (
        <div className="imageFeed_userInfoOverlayWrapper">
          <div className="imageFeed_userInfoModalBox">
            <h3>Welcome</h3>
            <p>Please enter your information to interact with posts</p>
            <form onSubmit={handleUserInfoSubmit}>
              <div className="imageFeed_formFieldGroup">
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleUserInfoChange}
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="imageFeed_formFieldGroup">
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleUserInfoChange}
                  placeholder="Your Email"
                  required
                />
              </div>
              <button type="submit" className="imageFeed_submitActionButton">
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="imageFeed_emptyStateMessage">No posts available.</div>
      ) : (
        <>
          <div className="imageFeed_postsGridLayout">
            {posts.map((post) => (
              <div key={post.id} className="imageFeed_postCardItem" onClick={() => openPostModal(post)}>
                <div className="imageFeed_postImageContainer">
                  <img src={post.image} alt={post.caption || 'Post image'} className="imageFeed_postThumbnailImage" />
                  <div className="imageFeed_postOverlayEffect">
                    <div className="imageFeed_postStatsContainer">
                      <span className="imageFeed_statItemDisplay">
                        <span className="imageFeed_statIconDisplay">❤️</span>
                        <span className="imageFeed_statCountDisplay">{post.reactionCount || 0}</span>
                      </span>
                      <span className="imageFeed_statItemDisplay">
                        <span className="imageFeed_statIconDisplay">💬</span>
                        <span className="imageFeed_statCountDisplay">{post.commentCount || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="imageFeed_postInfoSection">
                  <div className="imageFeed_postCaptionPreviewText">{post.caption}</div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="imageFeed_paginationControls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="imageFeed_paginationButton"
              >
                Previous
              </button>
              <span className="imageFeed_pageIndicatorText">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="imageFeed_paginationButton"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Post View Modal */}
      {selectedPost && (
        <div className="imageFeed_modalOverlayBackdrop" onClick={closeModals}>
          <div className={`imageFeed_postModalContainer ${showComments ? 'imageFeed_withCommentsSection' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="imageFeed_closeModalButton" onClick={closeModals}>
              <span className="imageFeed_closeIconSymbol">×</span>
            </button>
            
            <div className="imageFeed_modalContentLayout">
              {/* Post Image Section */}
              <div className="imageFeed_modalImageContainer">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.caption || 'Post image'}
                  className="imageFeed_modalFullImage"
                />
              </div>
              
              {/* Post Details Section */}
              <div className="imageFeed_modalDetailsContainer">
               
                
                <div className="imageFeed_postCaptionContainer">
                  <p className="imageFeed_postCaptionText">{selectedPost.caption}</p>
                  <p className="imageFeed_postDateDisplay">{formatDate(selectedPost.createdAt)}</p>
                </div>
                
                <div className="imageFeed_modalActionsBar">
                  <button
                    className={`imageFeed_actionButtonGeneric imageFeed_likeButtonSpecific ${selectedPost.hasReacted ? 'imageFeed_activeState' : ''}`}
                    onClick={(e) => handleReaction(selectedPost.id, e)}
                  >
                    <span className="imageFeed_actionIconDisplay">{selectedPost.hasReacted ? '❤️' : '🤍'}</span>
                    <span className="imageFeed_actionCountDisplay">{selectedPost.reactionCount || 0}</span>
                  </button>
                  
                  <button 
                    className="imageFeed_actionButtonGeneric imageFeed_commentButtonSpecific"
                    onClick={openCommentsModal}
                  >
                    <span className="imageFeed_actionIconDisplay">💬</span>
                    <span className="imageFeed_actionCountDisplay">{selectedPost.commentCount || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comments Modal */}
          {showComments && (
            <div className="imageFeed_commentsModalPanel" onClick={(e) => e.stopPropagation()}>
              <div className="imageFeed_commentsHeaderBar">
                <h3>Comments</h3>
                <button className="imageFeed_closeCommentsButton" onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(false);
                }}>
                  <span className="imageFeed_closeIconSymbol">×</span>
                </button>
              </div>
              
              <div className="imageFeed_commentsListContainer">
                {selectedPost.comments && selectedPost.comments.length > 0 ? (
                  selectedPost.comments.map((comment) => (
                    <div key={comment._id} className="imageFeed_commentItemBox">
                      <div className="imageFeed_commentAvatarPlaceholder"></div>
                      <div className="imageFeed_commentContentWrapper">
                        <div className="imageFeed_commentHeaderBar">
                          <span className="imageFeed_commentAuthorName">{comment.user.name}</span>
                          <span className="imageFeed_commentTimestamp">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="imageFeed_commentTextContent">{comment.content}</p>
                        {comment.user.email === userInfo.email && (
                          <button
                            className="imageFeed_deleteCommentButton"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="imageFeed_noCommentsPlaceholder">No comments yet. Be the first to comment!</div>
                )}
              </div>
              
              <div className="imageFeed_commentFormContainer">
                <textarea
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={handleCommentChange}
                  className="imageFeed_commentInputField"
                />
                <button
                  className="imageFeed_postCommentActionButton"
                  onClick={handleCommentSubmit}
                  disabled={!commentInput.trim() || !userInfo.name || !userInfo.email}
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Posts;