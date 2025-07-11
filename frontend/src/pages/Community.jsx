import React, { useState, useEffect } from 'react';
import './Community.css';

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

  useEffect(() => {
    const savedUserInfo = localStorage.getItem('communityUserInfo');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    } else {
      setShowUserForm(true);
    }
    
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/community/posts?page=${currentPage}&limit=10`);
      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
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

  const handlePollVote = async (postId, optionIndex) => {
    if (!userInfo) return;

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
        alert(error.message);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
      fetchPosts();
    }
  };

  const handleQuizAnswer = (postId, questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [questionIndex]: answer
      }
    }));
  };

  const submitQuiz = async (postId, totalQuestions) => {
    if (!userInfo) return;

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
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const openFullScreenImage = (imageUrl) => {
    setFullScreenImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
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
            <span className="author-name">{post.author.username}</span>
            <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          {post.postType !== 'image' && (
            <div className="post-type-badge">{post.postType}</div>
          )}
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

          {post.postType === 'video' && post.video && (
            <div className="post-video">
              <video 
                src={`https://connectwithaaditiyamg.onrender.com/api/community/posts/${post._id}/media/video/0`}
                controls
                className="post-video-player"
              />
              {post.caption && <p className="video-caption">{post.caption}</p>}
            </div>
          )}

          {post.postType === 'poll' && (
            <div className="post-poll">
              <div className="poll-options">
                {post.pollOptions.map((option, index) => {
                  const totalVotes = post.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
                  const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                  
                  return (
                    <div key={index} className="poll-option">
                      <button
                        onClick={() => handlePollVote(post._id, index)}
                        disabled={hasVoted}
                        className={`poll-option-button ${hasVoted ? 'disabled' : ''}`}
                      >
                        <span className="poll-option-text">{option.option}</span>
                        {hasVoted && (
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
                <p className="poll-expiry">
                  Expires: {new Date(post.pollExpiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {post.postType === 'quiz' && (
            <div className="post-quiz">
              {!quizResults[post._id] ? (
                <div className="quiz-questions">
                  {post.quizQuestions.map((question, qIndex) => (
                    <div key={qIndex} className="quiz-question">
                      <h4 className="question-text">{question.question}</h4>
                      <div className="quiz-options">
                        {question.options.map((option, oIndex) => (
                          <label key={oIndex} className="quiz-option">
                            <input
                              type="radio"
                              name={`quiz-${post._id}-${qIndex}`}
                              value={oIndex}
                              onChange={() => handleQuizAnswer(post._id, qIndex, oIndex)}
                              checked={quizAnswers[post._id]?.[qIndex] === oIndex}
                            />
                            <span className="quiz-option-text">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => submitQuiz(post._id, post.quizQuestions.length)}
                    className="quiz-submit-button"
                  >
                    Submit Quiz
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
                        {new Date(comment.createdAt).toLocaleDateString()}
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
                                {new Date(reply.createdAt).toLocaleDateString()}
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
        <div className="loading-spinner">Loading posts...</div>
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