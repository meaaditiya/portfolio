import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown, FaShare, FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaCopy, FaTelegramPlane, FaPinterest,FaFlag } from 'react-icons/fa';
import axios from 'axios';
import '../pagesCSS/blogPost.css';
import '../pagesCSS/commentmoderation.css';
import Dots from './DotsLoader';
import { Volume2, Pause, Play, Square , ChevronDown} from 'lucide-react';
// Import ReactMarkdown for proper markdown rendering
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(2);

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState({});
  const [replyForm, setReplyForm] = useState({ name: '', email: '', content: '' });
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(null);
  const [replyLoading, setReplyLoading] = useState(null);

  // Comment replies state
  const [commentReplies, setCommentReplies] = useState({});
  const [repliesLoading, setRepliesLoading] = useState({});
  const [showReplies, setShowReplies] = useState({});

  // Comment reactions state
  const [commentReactions, setCommentReactions] = useState({});
  const [userCommentReactions, setUserCommentReactions] = useState({});
  const [commentReactionLoading, setCommentReactionLoading] = useState(null);
  const [commentReactionTarget, setCommentReactionTarget] = useState(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  //summary State
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ email: '', reason: '' });
  const [reportError, setReportError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  // Author modal state
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [authorData, setAuthorData] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  // Moderation error state
const [showModerationModal, setShowModerationModal] = useState(false);
const [moderationError, setModerationError] = useState('');
// Read Along state
 // Read Along state
const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isPausedReading, setIsPausedReading] = useState(false);
const [uniqueReaders, setUniqueReaders] = useState(0);
  // Add these states
const [availableVoices, setAvailableVoices] = useState([]);
const [selectedVoice, setSelectedVoice] = useState(null);
const [showVoiceSelector, setShowVoiceSelector] = useState(false);
const [currentSentence, setCurrentSentence] = useState('');
const [showReadingOverlay, setShowReadingOverlay] = useState(false);
const [shouldRestartReading, setShouldRestartReading] = useState(false);
const [lightboxImage, setLightboxImage] = useState(null);
const [blogs, setBlogs] = useState([]);
// Add near other state declarations
const [relatedBlogsLoading, setRelatedBlogsLoading] = useState(false);
const [copiedCode, setCopiedCode] = useState(null);
const [reactionInProgress, setReactionInProgress] = useState(false);
const [lastReactionTime, setLastReactionTime] = useState(0);
const [commentReactionInProgress, setCommentReactionInProgress] = useState({});
// Add these state variables at the top of BlogPost component
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [loggedInUser, setLoggedInUser] = useState(null);
const [commentDeletability, setCommentDeletability] = useState({});
const [authCheckComplete, setAuthCheckComplete] = useState(false);
  // Fetch blog post details
 useEffect(() => {
  const fetchBlogDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/blogs/${slug}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
      const data = await response.json();
      
      console.log('Blog data received:', data);
      
      setBlogPost(data);
      setUniqueReaders(data.uniqueReaders || 0);
      
      // Check if user has stored info in localStorage FIRST
      const storedInfo = localStorage.getItem('blogUserInfo');
      let parsedInfo = null;
      if (storedInfo) {
        parsedInfo = JSON.parse(storedInfo);
        setStoredUserInfo(parsedInfo);
        setUserForm({
          name: parsedInfo.name || '',
          email: parsedInfo.email || ''
        });
      }
      
     if (data._id) {
  // OPTIMIZED: Don't block blog render waiting for reactions/comments
  fetchReactions(data._id);
  
  if (parsedInfo && parsedInfo.email) {
    checkUserReaction(data._id, parsedInfo.email);
  }
  
  // Load comments in background without awaiting
  fetchCommentsWithReactions(data._id, 1, parsedInfo);
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

  // When modal opens
  useEffect(() => {
    if (showShareModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showShareModal]);
  // Initialize available voices
// Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  // Load voices properly (browsers load them async)
useEffect(() => {
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setAvailableVoices(voices);
      // Auto-select best voice
      const bestVoice = voices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Microsoft') || 
        v.name.includes('Natural') ||
        v.lang.includes('en-US') || 
        v.lang.includes('en-IN')
      ) || voices[0];
      setSelectedVoice(bestVoice);
    }
  };

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;

  return () => {
    window.speechSynthesis.onvoiceschanged = null;
  };
}, []);
useEffect(() => {
  if (shouldRestartReading) {
    handleStopReading();

    setTimeout(() => {
      handlePlayReading();   // now React has updated selectedVoice
    }, 150);

    setShouldRestartReading(false);
  }
}, [selectedVoice, shouldRestartReading]);
// Fetch other blogs for "See Other Blogs" section
// Fetch related blogs using vector search
useEffect(() => {
  const fetchRelatedBlogs = async () => {
    if (!blogPost || !blogPost.title) return;
    
    setRelatedBlogsLoading(true);
    try {
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: blogPost.title,
          limit: 4,
          minScore: 0.3,
          includeUnpublished: false,
          hybridSearch: true,
          generateSuggestions: false
        })
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      // Filter out current blog and take top 3
      const relatedBlogs = data.results
        .filter(blog => blog._id !== blogPost._id)
        .slice(0, 3);
      
      setBlogs(relatedBlogs);
    } catch (err) {
      console.error('Error fetching related blogs:', err);
      // Fallback to regular fetch if vector search fails
      try {
        const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/blogs?status=published&limit=4');
        const data = await response.json();
        const otherBlogs = data.blogs.filter(blog => blog._id !== blogPost._id);
        setBlogs(otherBlogs.slice(0, 3));
      } catch (fallbackErr) {
        console.error('Fallback fetch also failed:', fallbackErr);
      }
    } finally {
      setRelatedBlogsLoading(false);
    }
  };
  
  if (blogPost) {
    fetchRelatedBlogs();
  }
}, [blogPost]);
// Add this useEffect after your existing useEffects
// Check authentication on component mount
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
    
    if (token) {
      try {
        // Verify token with your backend
        const response = await axios.get('https://connectwithaaditiyamg.onrender.com/api/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.user) {
          setIsLoggedIn(true);
          setLoggedInUser(response.data.user);
          
          // Pre-fill forms with logged-in user data
          setUserForm({
            name: response.data.user.name,
            email: response.data.user.email
          });
          setCommentForm(prev => ({
            ...prev,
            name: response.data.user.name,
            email: response.data.user.email
          }));
          setReplyForm(prev => ({
            ...prev,
            name: response.data.user.name,
            email: response.data.user.email
          }));
          
          console.log('User authenticated:', response.data.user.name);
        }
      } catch (err) {
        console.log('Not authenticated or token expired');
        setIsLoggedIn(false);
        setLoggedInUser(null);
        
        // Clear token if invalid
        localStorage.removeItem('token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
  };
  
  checkAuth();
}, []);
const getUserProfilePicture = (comment) => {
  // Check if comment has user profile picture (for authenticated users)
  if (comment.user?.profilePicture) {
    return comment.user.profilePicture;
  }
  return null;
};

// Get initials for fallback avatar
const getInitials = (name) => {
  if (!name) return 'U';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};
const isSubscriberOnlyBlog = () => {
  return blogPost && blogPost.isSubscriberOnly === true;
};

const canAccessFullContent = () => {
  // User can access if: logged in OR not subscriber-only
  return isLoggedIn || !isSubscriberOnlyBlog();
};
// Get clean text to read
  const getTextToRead = () => {
    if (!blogPost || !blogPost.content) return '';
    
    let text = blogPost.content
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\[IMAGE:.*?\]/g, '')
      .replace(/\[VIDEO:.*?\]/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text;
  };

  // Play reading
 const handlePlayReading = () => {
  if (isPausedReading) {
    window.speechSynthesis.resume();
    setIsPausedReading(false);
    setIsReadingAloud(true);
    setShowReadingOverlay(true);
    return;
  }

  window.speechSynthesis.cancel();
  const textToRead = getTextToRead();
  if (!textToRead) return;

  // Split into sentences for overlay highlighting
  const sentences = textToRead.match(/[^.!?]+[.!?]+/g) || [textToRead];
  let currentIndex = 0;

  const speakNextSentence = () => {
    if (currentIndex >= sentences.length) {
      setIsReadingAloud(false);
      setIsPausedReading(false);
      setShowReadingOverlay(false);
      setCurrentSentence('');
      return;
    }

    const sentence = sentences[currentIndex].trim();
    setCurrentSentence(sentence);

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Use selected voice or fallback
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else if (availableVoices.length > 0) {
      // Prefer Google or Microsoft voices
      const preferred = availableVoices.find(v => 
        v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Zira') || v.name.includes('David')
      ) || availableVoices[0];
      utterance.voice = preferred;
      setSelectedVoice(preferred);
    }

    utterance.onstart = () => {
      setIsReadingAloud(true);
      setIsPausedReading(false);
      setShowReadingOverlay(true);
    };

    utterance.onend = () => {
      currentIndex++;
      speakNextSentence();
    };

    utterance.onerror = () => {
      setIsReadingAloud(false);
      setShowReadingOverlay(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  speakNextSentence();
};

  // Pause reading
  const handlePauseReading = () => {
    if (window.speechSynthesis.speaking && !isPausedReading) {
      window.speechSynthesis.pause();
      setIsPausedReading(true);
      setIsReadingAloud(false);
    }
  };

  // Stop reading
  const handleStopReading = () => {
    window.speechSynthesis.cancel();
    setIsReadingAloud(false);
    setIsPausedReading(false);
  };
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
  
  // Handle page change for comments
  const handleCommentPageChange = (newPage) => {
    if (blogPost && blogPost._id) {
      // Pass the current stored user info
      fetchCommentsWithReactions(blogPost._id, newPage, storedUserInfo);
    }
  };
const handleReactionClick = (type) => {
  // Prevent rapid clicks (debounce)
  const now = Date.now();
  if (now - lastReactionTime < 1000) {
    console.log('Please wait before reacting again');
    return;
  }
  
  // Prevent multiple simultaneous requests
  if (reactionInProgress) {
    console.log('Reaction already in progress');
    return;
  }
  
  setReactionType(type);
  
  // If logged in, submit directly without showing modal
  if (isLoggedIn && loggedInUser) {
    submitReaction(type, {
      name: loggedInUser.name,
      email: loggedInUser.email
    });
  } else if (storedUserInfo && storedUserInfo.email && storedUserInfo.name) {
    // Use stored info from localStorage
    submitReaction(type, storedUserInfo);
  } else {
    // Show modal for guests
    setShowReactionModal(true);
  }
};
 
 
// FIXED: Submit Blog Reaction with proper locking
const submitReaction = async (type, userInfo) => {
  if (!blogPost || !blogPost._id) return;
  
  // Double-check if already in progress
  if (reactionInProgress) {
    console.log('Reaction submission blocked - already in progress');
    return;
  }
  
  // Lock the reaction system
  setReactionInProgress(true);
  setLastReactionTime(Date.now());
  
  // Store previous state for rollback
  const previousReaction = userReaction;
  const previousReactions = { ...reactions };
  
  // Calculate expected new state
  let newReactions = { ...reactions };
  let newUserReaction = null;
  
  if (previousReaction === type) {
    // Removing reaction
    newReactions[type] = Math.max(0, newReactions[type] - 1);
    newUserReaction = null;
  } else {
    // Adding or changing reaction
    if (previousReaction) {
      newReactions[previousReaction] = Math.max(0, newReactions[previousReaction] - 1);
    }
    newReactions[type] = newReactions[type] + 1;
    newUserReaction = type;
  }
  
  // Optimistic UI update
  setReactions(newReactions);
  setUserReaction(newUserReaction);
  
  
    const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
  
  try {
    const response = await axios.post(
      `https://connectwithaaditiyamg.onrender.com/api/blogs/${blogPost._id}/reactions`,
      {
        name: userInfo.name,
        email: userInfo.email,
        type
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 10000
      }
    );
    // Store user info for future use
    localStorage.setItem('blogUserInfo', JSON.stringify(userInfo));
    setStoredUserInfo(userInfo);
    
    // Update with actual server response
    if (response.data.reactionRemoved) {
      setUserReaction(null);
    } else {
      setUserReaction(type);
    }
    
    // Fetch accurate counts from server
    await fetchReactions(blogPost._id);
    
    // Close modal if open
    setShowReactionModal(false);
    
  } catch (err) {
    console.error('Error submitting reaction:', err);
    
    // ROLLBACK optimistic update on error
    setReactions(previousReactions);
    setUserReaction(previousReaction);
    
    // Show user-friendly error
    const errorMessage = err.response?.data?.message || 
                        err.code === 'ECONNABORTED' ? 'Request timeout. Please try again.' :
                        'Failed to submit reaction. Please try again.';
    alert(errorMessage);
    
  } finally {
    // Always unlock after completion
    setReactionInProgress(false);
  }
};
  
  // Handle user form submit for reaction
  const handleReactionFormSubmit = (e) => {
    e.preventDefault();
    if (userForm.name.trim() === '' || userForm.email.trim() === '') {
      alert('Name and email are required');
      return;
    }
    
    if (commentReactionTarget) {
      // This is a comment reaction
      submitCommentReaction(commentReactionTarget, reactionType, userForm);
      setCommentReactionTarget(null);
    } else {
      // This is a blog post reaction
      submitReaction(reactionType, userForm);
    }
  };
  
  // Handle comment form change
  const handleCommentFormChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
const handleCommentSubmit = async (e) => {
  e.preventDefault();
  setCommentError(null);
  setCommentSuccess(null);
  setCommentSubmitting(true);
  
  if (!blogPost || !blogPost._id) return;
  
  // Get token for authenticated users
  const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
  
  // For logged-in users, use their info directly
  let submitData = {};
  if (isLoggedIn && loggedInUser) {
    submitData = {
      name: loggedInUser.name,
      email: loggedInUser.email,
      content: commentForm.content.trim()
    };
  } else {
    // For guests, validate form fields
    if (commentForm.name.trim() === '' || 
        commentForm.email.trim() === '' || 
        commentForm.content.trim() === '') {
      setCommentError('All fields are required');
      setCommentSubmitting(false);
      return;
    }
    submitData = {
      name: commentForm.name.trim(),
      email: commentForm.email.trim(),
      content: commentForm.content.trim()
    };
  }
  
  try {
    await axios.post(
      `https://connectwithaaditiyamg.onrender.com/api/blogs/${blogPost._id}/comments`,
      submitData,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      }
    );
    
    // Store user info for future use (only if not logged in)
    if (!isLoggedIn) {
      const userInfo = {
        name: submitData.name,
        email: submitData.email
      };
      localStorage.setItem('blogUserInfo', JSON.stringify(userInfo));
      setStoredUserInfo(userInfo);
    }
    
    // Reset form content only (keep name/email for guests)
    setCommentForm(prev => ({
      ...prev,
      content: ''
    }));
    setCommentSuccess('Comment submitted successfully! It will appear after review.');
    
    // Refresh comments with updated user info
    const userInfoForRefresh = isLoggedIn ? {
      name: loggedInUser.name,
      email: loggedInUser.email
    } : {
      name: submitData.name,
      email: submitData.email
    };
    fetchCommentsWithReactions(blogPost._id, 1, userInfoForRefresh);
    
    // Close form after delay
    setTimeout(() => {
      setShowCommentForm(false);
      setCommentSuccess(null);
    }, 3000);
  } catch (err) {
    console.error('Error submitting comment:', err);
    
    // Check if it's a moderation error (422)
    if (err.response?.status === 422) {
      setModerationError(err.response?.data?.message || 'Your comment was flagged by our moderation system.');
      setShowModerationModal(true);
    } else {
      setCommentError(err.response?.data?.message || 'Failed to submit comment');
    }
  } finally {
    setCommentSubmitting(false);
  }
};
  // Add this function to handle comment deletion
  const handleDeleteComment = async () => {
  if (!commentToDelete) return;

  setDeleteCommentLoading(commentToDelete.id);
  
  // Get token for authenticated users
  const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
  
  // Determine which email to use
  let emailToUse = commentToDelete.email;
  if (isLoggedIn && loggedInUser) {
    emailToUse = loggedInUser.email;
  }
  
  try {
    await axios.delete(
      `https://connectwithaaditiyamg.onrender.com/api/comments/${commentToDelete.id}/user`,
      { 
        data: { email: emailToUse },
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      }
    );
    
    // Find if this is a reply being deleted
    const isReply = Object.values(commentReplies).some(replies => 
      replies.some(reply => reply._id === commentToDelete.id)
    );
    
    if (isReply) {
      // Find the parent comment and refresh its replies
      const parentCommentId = Object.keys(commentReplies).find(commentId =>
        commentReplies[commentId].some(reply => reply._id === commentToDelete.id)
      );
      
      if (parentCommentId) {
        // Remove the deleted reply from state immediately
        setCommentReplies(prev => ({
          ...prev,
          [parentCommentId]: prev[parentCommentId].filter(reply => reply._id !== commentToDelete.id)
        }));
        
        // Update the reply count in the main comments list
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === parentCommentId 
              ? { ...comment, repliesCount: Math.max(0, comment.repliesCount - 1) }
              : comment
          )
        );
        
        // Also refresh the parent comment to get accurate reply count from server
        fetchReplies(parentCommentId);
      }
    } else {
      // This is a main comment, refresh the main comments list
      if (blogPost && blogPost._id) {
        const userInfoForRefresh = isLoggedIn ? {
          name: loggedInUser.name,
          email: loggedInUser.email
        } : storedUserInfo;
        fetchCommentsWithReactions(blogPost._id, commentPagination.page, userInfoForRefresh);
      }
    }
    
    // Close modal and reset state
    setShowDeleteModal(false);
    setCommentToDelete(null);
  } catch (err) {
    console.error('Error deleting comment:', err);
    
    // Show appropriate error message
    const errorMessage = err.response?.status === 403 
      ? 'You can only delete your own comments.'
      : err.response?.data?.message || 'Failed to delete comment. Please try again.';
    
    alert(errorMessage);
  } finally {
    setDeleteCommentLoading(null);
  }
};

 const loadRepliesReactions = async (replies) => {
  if (replies && replies.length > 0) {
    const currentStoredInfo = localStorage.getItem('blogUserInfo');
    let currentUserInfo = null;
    
    if (currentStoredInfo) {
      currentUserInfo = JSON.parse(currentStoredInfo);
    } else if (isLoggedIn && loggedInUser) {
      currentUserInfo = { email: loggedInUser.email, name: loggedInUser.name };
    } else if (storedUserInfo) {
      currentUserInfo = storedUserInfo;
    }
    
    // OPTIMIZED: Fire all in parallel, don't block
    const replyIds = replies.map(r => r._id);
    const reactionPromises = replyIds.map(id => fetchCommentReactions(id));
    const userReactionPromises = currentUserInfo?.email
      ? replyIds.map(id => checkUserCommentReaction(id, currentUserInfo.email))
      : [];
    
    // Execute in background without blocking
    Promise.all([
      ...reactionPromises,
      ...userReactionPromises,
      batchVerifyCommentOwnership(replies, currentUserInfo)
    ]).catch(err => console.error('Error loading reply reactions:', err));
  }
};

  // Add this function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  // Share functions
  const getCurrentUrl = () => {
    return window.location.href;
  };

  // Helper function to clean markdown symbols from text
  const cleanMarkdownSymbols = (text) => {
    if (!text) return text;
    
    return text
      // Remove leading # symbols (headers)
      .replace(/^#+\s*/gm, '')
      // Remove leading * symbols (bold/italic/lists)
      .replace(/^\*+\s*/gm, '')
      // Remove ** bold markers
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove * italic markers (but preserve single * that aren't markdown)
      .replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '$1')
      // Clean up any remaining leading whitespace
      .replace(/^\s+/gm, '')
      // Remove multiple consecutive spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleNativeShare = async () => {
    // Add a check to allow users to choose between native and custom sharing
    // You might want to add a preference or always show modal for more control
    const useNativeShare = navigator.share && /Mobi|Android/i.test(navigator.userAgent);
    
    if (useNativeShare) {
      try {
        const shareData = getShareData();
        
        // Try sharing with image for mobile devices
        if (navigator.canShare && blogPost?.featuredImage) {
          try {
            // Check if the image is from the same origin or CORS-enabled
            const imageUrl = new URL(blogPost.featuredImage, window.location.origin);
            const response = await fetch(imageUrl.href, {
              method: 'HEAD',
              mode: 'cors'
            });
            
            if (response.ok) {
              const imageResponse = await fetch(imageUrl.href);
              const blob = await imageResponse.blob();
              
              // Get proper file extension from blob type or URL
              const fileExtension = blob.type.split('/')[1] || 'jpg';
              const fileName = `blog-image.${fileExtension}`;
              const file = new File([blob], fileName, { type: blob.type });
              
              const shareDataWithImage = {
                ...shareData,
                files: [file]
              };
              
              if (navigator.canShare(shareDataWithImage)) {
                await navigator.share(shareDataWithImage);
                return;
              }
            }
          } catch (imageError) {
            console.log('Image sharing failed, falling back to text only:', imageError);
          }
        }
        
        // Fallback to text-only sharing
        await navigator.share(shareData);
      } catch (err) {
        console.log('Native sharing failed:', err);
        // Always fall back to modal if native sharing fails
        setShowShareModal(true);
      }
    } else {
      // Always show modal for desktop/non-mobile devices
      setShowShareModal(true);
    }
  };

  // Enhanced share data function with better text formatting
  const getShareData = () => {
    const url = getCurrentUrl();
    
    // Clean title from markdown symbols
    const cleanTitle = blogPost?.title ? cleanMarkdownSymbols(blogPost.title) : 'Check out this blog post';
    
    // Clean excerpt/content from markdown symbols
    const cleanExcerpt = blogPost?.excerpt 
      ? cleanMarkdownSymbols(blogPost.excerpt)
      : blogPost?.content 
        ? cleanMarkdownSymbols(blogPost.content.substring(0, 150)) + '...'
        : 'An insightful read you shouldn\'t miss!';

    // Enhanced caption with cleaned content
    const caption = blogPost
      ? `📖 "${cleanTitle}"

✍️ ${blogPost.author ? `By ${blogPost.author.name}` : 'By Aaditiya Tyagi'}
📅 ${new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}

${blogPost.tags && blogPost.tags.length > 0 
  ? `🏷️ ${blogPost.tags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')}` 
  : ''}

💡 ${cleanExcerpt}

Read the full article here 👇`
      : 'Check out this amazing blog post!';

    return {
      url,
      title: cleanTitle,
      text: caption
    };
  };

  // Fixed social sharing with better error handling
  const handleSocialShare = (platform) => {
    const { url, title, text } = getShareData();
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(text);
    
    // For image sharing, use the direct URL instead of blob
    const imageUrl = blogPost?.featuredImage ? encodeURIComponent(blogPost.featuredImage) : '';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        // Facebook with better formatting
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'twitter':
        // Twitter with hashtags from tags
        const hashtags = blogPost?.tags 
          ? blogPost.tags.map(tag => tag.replace(/\s+/g, '')).join(',')
          : '';
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://telegram.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'pinterest':
        // Pinterest with image support
        if (imageUrl) {
          shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${imageUrl}&description=${encodedTitle}`;
        } else {
          shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
        }
        break;
      default:
        console.error('Unknown platform:', platform);
        return;
    }
    
    // Open in popup window with proper error handling
    try {
      const popup = window.open(
        shareUrl, 
        `share-${platform}`,
        'width=600,height=500,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,status=no'
      );
      
      if (!popup) {
        // Popup blocked, try opening in new tab
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      } else {
        popup.focus();
      }
    } catch (error) {
      console.error(`Error opening ${platform} share:`, error);
      // Fallback to direct navigation
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Enhanced copy link function with rich content
  const handleCopyLink = async () => {
  const { url, text } = getShareData();
  
  try {
    // Try to copy rich content first (for apps that support it)
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px;">
          ${blogPost?.featuredImage ? 
            `<img src="${blogPost.featuredImage}" alt="${blogPost.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px; display: block;">` 
            : ''
          }
          <h3 style="margin: 0 0 8px 0; color: #333;">${blogPost?.title || 'Blog Post'}</h3>
          <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">${text.replace(/\[IMAGE:[^\]]+\]/g, '').trim()}</p>
          <a href="${url}" style="color: #007bff; text-decoration: none;">${url}</a>
        </div>
      `;
      
      const plainText = `${text.replace(/\[IMAGE:[^\]]+\]/g, '').trim()}\n\n${url}`;
      
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      
      const clipboardItem = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      
      await navigator.clipboard.write([clipboardItem]);
    } else {
      // Fallback to plain text
      const plainText = `${text.replace(/\[IMAGE:[^\]]+\]/g, '').trim()}\n\n${url}`;
      await navigator.clipboard.writeText(plainText);
    }
    
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
      setShowShareModal(false);
    }, 2000);
    
  } catch (err) {
    console.error('Clipboard API failed:', err);
    
    // Final fallback for older browsers
    const textArea = document.createElement('textarea');
    const fallbackText = `${text.replace(/\[IMAGE:[^\]]+\]/g, '').trim()}\n\n${url}`;
    textArea.value = fallbackText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
          setShowShareModal(false);
        }, 2000);
      } else {
        throw new Error('Copy command failed');
      }
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
      alert('Could not copy to clipboard. Please copy the URL manually: ' + url);
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

  // Add this new function to provide users with sharing options
  const handleShareClick = () => {
    // Always show modal for better control and consistency
    setShowShareModal(true);
  };

  // Optional: Add a function to detect if native sharing should be preferred
  const shouldUseNativeShare = () => {
    return navigator.share && 
           /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) &&
           !window.matchMedia('(display-mode: standalone)').matches; // Not in PWA mode
  };

  // Format date
  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Less than a month (4 weeks)
    if (diffInSeconds < 2419200) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    // Less than a year
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2419200);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    
    // More than a year
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  };

  const formatBlogDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => {
      const newState = { ...prev, [commentId]: !prev[commentId] };
      
      // If showing replies and not loaded yet, fetch them
      if (newState[commentId] && !commentReplies[commentId]) {
        fetchReplies(commentId);
      }
      
      return newState;
    });
  };

  // Handle reply form change
  const handleReplyFormChange = (e) => {
    const { name, value } = e.target;
    setReplyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle reply form
  const toggleReplyForm = (commentId) => {
    setShowReplyForm(prev => {
      const newState = { ...prev, [commentId]: !prev[commentId] };
      
      // Pre-fill form if user info exists
      if (newState[commentId] && storedUserInfo) {
        setReplyForm(prevForm => ({
          ...prevForm,
          name: storedUserInfo.name,
          email: storedUserInfo.email
        }));
      }
      
      // Clear any previous errors/success messages
      setReplyError(null);
      setReplySuccess(null);
      
      return newState;
    });
  };

  // Handle reply form submit
 // Handle reply form submit
const handleReplySubmit = async (e, commentId) => {
  e.preventDefault();
  setReplyError(null);
  setReplySuccess(null);
  setReplyLoading(commentId);
  
  // Get token for authenticated users
  const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
  
  // For logged-in users, use their info directly
  let submitData = {};
  if (isLoggedIn && loggedInUser) {
    submitData = {
      name: loggedInUser.name,
      email: loggedInUser.email,
      content: replyForm.content.trim()
    };
  } else {
    // For guests, validate form fields
    if (replyForm.name.trim() === '' || 
        replyForm.email.trim() === '' || 
        replyForm.content.trim() === '') {
      setReplyError('All fields are required');
      setReplyLoading(null);
      return;
    }
    submitData = {
      name: replyForm.name.trim(),
      email: replyForm.email.trim(),
      content: replyForm.content.trim()
    };
  }
  
  try {
    await axios.post(
      `https://connectwithaaditiyamg.onrender.com/api/comments/${commentId}/replies`,
      submitData,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      }
    );
    
    // Store user info for future use (only if not logged in)
    if (!isLoggedIn) {
      const userInfo = {
        name: submitData.name,
        email: submitData.email
      };
      localStorage.setItem('blogUserInfo', JSON.stringify(userInfo));
      setStoredUserInfo(userInfo);
    }
    
    // Reset form content only (keep name/email for guests)
    setReplyForm(prev => ({
      ...prev,
      content: ''
    }));
    setReplySuccess('Reply submitted successfully!');
    
    // Refresh replies for this comment
    fetchReplies(commentId);
    
    // Also refresh main comments to update reply count
    if (blogPost && blogPost._id) {
      const userInfoForRefresh = isLoggedIn ? {
        name: loggedInUser.name,
        email: loggedInUser.email
      } : {
        name: submitData.name,
        email: submitData.email
      };
      fetchCommentsWithReactions(blogPost._id, commentPagination.page, userInfoForRefresh);
    }
    
    // Hide reply form after success
    setTimeout(() => {
      setShowReplyForm(prev => ({ ...prev, [commentId]: false }));
      setReplySuccess(null);
    }, 2000);
  } catch (err) {
    console.error('Error submitting reply:', err);
    
    // Check if it's a moderation error (422)
    if (err.response?.status === 422) {
      setModerationError(err.response?.data?.message || 'Your reply was flagged by our moderation system.');
      setShowModerationModal(true);
    } else {
      setReplyError(err.response?.data?.message || 'Failed to submit reply');
    }
  } finally {
    setReplyLoading(null);
  }
};

 const fetchReplies = async (commentId) => {
  setRepliesLoading(prev => ({ ...prev, [commentId]: true }));
  try {
    const response = await axios.get(
      `https://connectwithaaditiyamg.onrender.com/api/comments/${commentId}/replies`
    );
    
    setCommentReplies(prev => ({
      ...prev,
      [commentId]: response.data.replies
    }));
    
    // Load reactions for the replies
    await loadRepliesReactions(response.data.replies);
  } catch (err) {
    console.error('Error fetching replies:', err);
  } finally {
    setRepliesLoading(prev => ({ ...prev, [commentId]: false }));
  }
};

  // Fetch comment reactions
  const fetchCommentReactions = async (commentId) => {
    try {
      const response = await axios.get(
        `https://connectwithaaditiyamg.onrender.com/api/comments/${commentId}/reactions/count`
      );
      
      setCommentReactions(prev => ({
        ...prev,
        [commentId]: response.data
      }));
    } catch (err) {
      console.error('Error fetching comment reactions:', err);
    }
  };

  // Check user's reaction to a comment
  const checkUserCommentReaction = async (commentId, email) => {
    try {
      const response = await axios.get(
        `https://connectwithaaditiyamg.onrender.com/api/comments/${commentId}/reactions/user`,
        { params: { email } }
      );
      
      setUserCommentReactions(prev => ({
        ...prev,
        [commentId]: response.data.hasReacted ? response.data.reactionType : null
      }));
    } catch (err) {
      console.error('Error checking user comment reaction:', err);
    }
  };

  // Handle comment reaction
const handleCommentReaction = async (commentId, type) => {
  // Prevent rapid clicks per comment
  if (commentReactionInProgress[commentId]) {
    console.log('Comment reaction already in progress');
    return;
  }
  
  // If logged in, submit reaction directly
  if (isLoggedIn && loggedInUser) {
    submitCommentReaction(commentId, type, {
      name: loggedInUser.name,
      email: loggedInUser.email
    });
  } else if (storedUserInfo && storedUserInfo.email && storedUserInfo.name) {
    // Use stored info from localStorage
    submitCommentReaction(commentId, type, storedUserInfo);
  } else {
    // Show modal to collect user info
    setReactionType(type);
    setCommentReactionTarget(commentId);
    setShowReactionModal(true);
  }
};

  // Add this new function to handle the actual comment reaction submission:
const submitCommentReaction = async (commentId, type, userInfo) => {
  // Check if already in progress for this specific comment
  if (commentReactionInProgress[commentId]) {
    console.log('Comment reaction blocked - already in progress');
    return;
  }
  
  // Lock this specific comment's reactions
  setCommentReactionInProgress(prev => ({ ...prev, [commentId]: true }));
  setCommentReactionLoading(commentId);
  
  // Get token for authenticated users
  const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
  
  // Determine which user info to use
  let submitData = {};
  if (isLoggedIn && loggedInUser) {
    submitData = {
      name: loggedInUser.name,
      email: loggedInUser.email,
      type
    };
  } else {
    submitData = {
      name: userInfo.name,
      email: userInfo.email,
      type
    };
  }
  
  // Store previous state for rollback
  const previousReaction = userCommentReactions[commentId];
  const previousReactions = { ...commentReactions[commentId] } || { likes: 0, dislikes: 0 };
  
  // Calculate expected new state
  let newReactions = { ...previousReactions };
  let newUserReaction = null;
  
  if (previousReaction === type) {
    // Removing reaction
    newReactions[type] = Math.max(0, newReactions[type] - 1);
    newUserReaction = null;
  } else {
    // Adding or changing reaction
    if (previousReaction) {
      newReactions[previousReaction] = Math.max(0, newReactions[previousReaction] - 1);
    }
    newReactions[type] = newReactions[type] + 1;
    newUserReaction = type;
  }
  
  // Optimistic UI update
  setCommentReactions(prev => ({
    ...prev,
    [commentId]: newReactions
  }));
  setUserCommentReactions(prev => ({
    ...prev,
    [commentId]: newUserReaction
  }));
  
  try {
    const response = await axios.post(
      `https://connectwithaaditiyamg.onrender.com/api/comments/${commentId}/reactions`,
      submitData,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    // Store user info for future use (only if not logged in)
    if (!isLoggedIn) {
      localStorage.setItem('blogUserInfo', JSON.stringify(userInfo));
      setStoredUserInfo(userInfo);
    }
    
    // Update user reaction state with server response
    if (response.data.reactionRemoved) {
      setUserCommentReactions(prev => ({
        ...prev,
        [commentId]: null
      }));
    } else {
      setUserCommentReactions(prev => ({
        ...prev,
        [commentId]: type
      }));
    }
    
    // Refresh comment reaction counts from server
    await fetchCommentReactions(commentId);
    
    // Close modal if open
    setShowReactionModal(false);
    
  } catch (err) {
    console.error('Error submitting comment reaction:', err);
    
    // ROLLBACK optimistic update on error
    setCommentReactions(prev => ({
      ...prev,
      [commentId]: previousReactions
    }));
    setUserCommentReactions(prev => ({
      ...prev,
      [commentId]: previousReaction
    }));
    
    // Show user-friendly error
    const errorMessage = err.response?.data?.message || 
                        err.code === 'ECONNABORTED' ? 'Request timeout. Please try again.' :
                        'Failed to submit reaction. Please try again.';
    alert(errorMessage);
    
  } finally {
    // Always unlock after completion
    setCommentReactionInProgress(prev => ({ ...prev, [commentId]: false }));
    setCommentReactionLoading(null);
  }
};
  // Update your existing fetchComments function to also fetch reactions

   const fetchCommentsWithReactions = async (blogId, page = 1, userInfo = null) => {
  setCommentsLoading(true);
  setCommentDeletability({});
  
  try {
    const response = await axios.get(
      `https://connectwithaaditiyamg.onrender.com/api/blogs/${blogId}/comments`,
      { params: { page, limit: 5 } }
    );
    
    setComments(response.data.comments);
    setVisibleCommentsCount(2);
    setCommentPagination({
      page: response.data.pagination.page,
      pages: response.data.pagination.pages,
      total: response.data.pagination.total
    });
    
    const currentUserInfo = userInfo || 
                           storedUserInfo || 
                           (isLoggedIn && loggedInUser ? { email: loggedInUser.email, name: loggedInUser.name } : null);
    
    // OPTIMIZED: Fetch everything in parallel instead of sequentially
    if (response.data.comments.length > 0) {
      const commentIds = response.data.comments.map(c => c._id);
      
      // Create all promises
      const reactionPromises = commentIds.map(id => fetchCommentReactions(id));
      const userReactionPromises = currentUserInfo?.email 
        ? commentIds.map(id => checkUserCommentReaction(id, currentUserInfo.email))
        : [];
      
      // Execute ALL operations in parallel - don't wait for each one
      Promise.all([
        ...reactionPromises,
        ...userReactionPromises,
        batchVerifyCommentOwnership(response.data.comments, currentUserInfo)
      ]).catch(err => console.error('Error in parallel operations:', err));
      
      // Don't await - let them load in background
    }
  } catch (err) {
    console.error('Error fetching comments:', err);
  } finally {
    setCommentsLoading(false);
  }
};
  // Handle report form change
const handleReportFormChange = (e) => {
  const { name, value } = e.target;
  setReportForm(prev => ({
    ...prev,
    [name]: value
  }));
};

// Handle report form submit
const handleReportSubmit = async (e) => {
  e.preventDefault();
  setReportError(null);
  setReportSuccess(null);
  setReportLoading(true);
  
  if (!blogPost || !blogPost._id) return;
  
  if (reportForm.email.trim() === '' || reportForm.reason.trim() === '') {
    setReportError('Email and reason are required');
    setReportLoading(false);
    return;
  }
  
  if (reportForm.reason.trim().length < 10) {
    setReportError('Reason must be at least 10 characters');
    setReportLoading(false);
    return;
  }
  
  if (reportForm.reason.trim().length > 500) {
    setReportError('Reason must not exceed 500 characters');
    setReportLoading(false);
    return;
  }
  
  try {
    await axios.post(
      `https://connectwithaaditiyamg.onrender.com/api/blogs/${blogPost._id}/report`,
      {
        userEmail: reportForm.email,
        reason: reportForm.reason
      }
    );
    
    setReportSuccess('Thank you for your report. We will review it shortly.');
    
    // Reset form
    setReportForm({ email: '', reason: '' });
    
    // Close modal after 2 seconds
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(null);
    }, 2000);
  } catch (err) {
    console.error('Error submitting report:', err);
    setReportError(err.response?.data?.message || 'Failed to submit report');
  } finally {
    setReportLoading(false);
  }
};
const handleGenerateSummary = async (blog, event) => {
  event.stopPropagation(); // Prevent any parent click handlers
  setSelectedBlog(blog);
  setShowSummaryPopup(true);
  setGeneratedSummary('');
  setSummaryError(null);
  setIsGeneratingSummary(true);

  try {
    const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/blogs/${blog._id}/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate summary');
    }

    const data = await response.json();
    setGeneratedSummary(data.summary);
  } catch (err) {
    setSummaryError(err.message);
    console.error('Error generating summary:', err);
  } finally {
    setIsGeneratingSummary(false);
  }
};
const closeSummaryPopup = () => {
  setShowSummaryPopup(false);
  setSelectedBlog(null);
  setGeneratedSummary('');
  setSummaryError(null);
};
// NEW: Verify comment ownership securely
const verifyCommentOwnership = async (commentId, userEmail) => {
  try {
    const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
    
    const response = await axios.post(
      `https://connectwithaaditiyamg.onrender.com/api/comments/${commentId}/verify-ownership`,
      { email: userEmail },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true
      }
    );
    
    return response.data.canDelete;
  } catch (error) {
    console.error('Error verifying comment ownership:', error);
    return false;
  }
};

// NEW: Batch verify ownership for multiple comments
// NEW: Batch verify ownership for multiple comments
// NEW: Batch verify ownership for multiple comments
const batchVerifyCommentOwnership = async (comments, userInfo = null) => {
  // Priority: passed userInfo > loggedInUser > storedUserInfo
  const userEmail = userInfo?.email || 
                    (isLoggedIn && loggedInUser ? loggedInUser.email : null) || 
                    storedUserInfo?.email;
  
  console.log('🔍 Batch verifying comments for email:', userEmail);
  
  if (!userEmail) {
    console.log('❌ No user email available for verification');
    return; // Don't clear existing state
  }
  
  const verificationPromises = comments.map(async (comment) => {
    const canDelete = await verifyCommentOwnership(comment._id, userEmail);
    console.log(`Comment ${comment._id} deletable:`, canDelete);
    return { commentId: comment._id, canDelete };
  });
  
  const results = await Promise.all(verificationPromises);
  
  const deletabilityMap = {};
  results.forEach(({ commentId, canDelete }) => {
    deletabilityMap[commentId] = canDelete;
  });
  
  console.log('✅ New deletability entries:', deletabilityMap);
  
  // MERGE with existing state instead of replacing
  setCommentDeletability(prev => ({
    ...prev,
    ...deletabilityMap
  }));
};
  // Custom component to render content with inline images and videos
  const renderContentWithMedia = (content) => {
    if (!content) return null;

    // Check if blog post has inline images or videos
    if (
      (blogPost.contentImages && blogPost.contentImages.length > 0) ||
      (blogPost.contentVideos && blogPost.contentVideos.length > 0)
    ) {
      // Create maps for quick lookup
      const imageMap = {};
      const videoMap = {};

      // Map images by imageId
      if (blogPost.contentImages) {
        blogPost.contentImages.forEach(image => {
          if (image.imageId) {
            imageMap[image.imageId] = image;
          }
        });
      }

      // Map videos by embedId
      if (blogPost.contentVideos) {
        blogPost.contentVideos.forEach(video => {
          if (video.embedId) {
            videoMap[video.embedId] = video;
          }
        });
      }

      // Split content by image and video placeholders
      let processedContent = content;
      const parts = [];
      let currentIndex = 0;

      // Find all placeholders (images and videos)
      const placeholders = [];

      // Find image placeholders
      Object.keys(imageMap).forEach(imageId => {
        const placeholder = `[IMAGE:${imageId}]`;
        let searchIndex = 0;
        let foundIndex;

        while ((foundIndex = processedContent.indexOf(placeholder, searchIndex)) !== -1) {
          placeholders.push({
            type: 'image',
            id: imageId,
            placeholder,
            startIndex: foundIndex,
            endIndex: foundIndex + placeholder.length,
            media: imageMap[imageId]
          });
          searchIndex = foundIndex + placeholder.length;
        }
      });

      // Find video placeholders
      Object.keys(videoMap).forEach(embedId => {
        const placeholder = `[VIDEO:${embedId}]`;
        let searchIndex = 0;
        let foundIndex;

        while ((foundIndex = processedContent.indexOf(placeholder, searchIndex)) !== -1) {
          placeholders.push({
            type: 'video',
            id: embedId,
            placeholder,
            startIndex: foundIndex,
            endIndex: foundIndex + placeholder.length,
            media: videoMap[embedId]
          });
          searchIndex = foundIndex + placeholder.length;
        }
      });

      // Sort placeholders by their position in content
      placeholders.sort((a, b) => a.startIndex - b.startIndex);

      // Build parts array with text, images, and videos
      placeholders.forEach((placeholderInfo, index) => {
        // Add text content before this media
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

        // Add the media (image or video)
        parts.push({
          type: placeholderInfo.type,
          media: placeholderInfo.media,
          key: `${placeholderInfo.type}-${placeholderInfo.id}`
        });

        currentIndex = placeholderInfo.endIndex;
      });

      // Add remaining text content after the last media
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
          <div className="blog-post-content" id="articleContent">
           <ReactMarkdown
  components={{
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      console.log('Code component called:', { inline, match, className });
      
      return !inline && match ? (
        <CodeBlock
          language={match[1]}
          value={codeString}
        />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  }}
>
  {content}
</ReactMarkdown>
          </div>
        );
      }

      // Render mixed content
      return (
        <div className="blog-post-content" id="articleContent">
          {parts.map(part => {
            if (part.type === 'text') {
              return (
                <div key={part.key}>
                   <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            return !inline && match ? (
              <CodeBlock language={match[1]} value={codeString} />
            ) : (
              <code className={className} {...props}>{children}</code>
            );
          }
        }}
      >
        {part.content}
      </ReactMarkdown>
                </div>
              );
            }else if (part.type === 'image') {
  return (
    <div 
      key={part.key} 
      className={`blog-image blog-image-${part.media.position || 'center'}`}
    >
      <img 
        src={part.media.url} 
        alt={part.media.alt || ''} 
        loading="lazy"
        className="zoomable-image"
        onClick={() => setLightboxImage(part.media.url)}
      />
      {part.media.caption && (
        <p className="image-caption">{part.media.caption}</p>
      )}
    </div>
  );
}
             else if (part.type === 'video') {
              return (
                <div 
                  key={part.key} 
                  className={`blog-image blog-image-${part.media.position || 'center'}`} // Using same CSS classes as images
                >
                  <div className="video-wrapper">
                    <iframe
                      width="560"
                      height="315"
                      src={
                        part.media.platform === 'youtube'
                          ? `https://www.youtube.com/embed/${part.media.videoId}?rel=0&modestbranding=1${part.media.autoplay ? '&autoplay=1' : ''}${part.media.muted ? '&mute=1' : ''}`
                          : part.media.platform === 'vimeo'
                          ? `https://player.vimeo.com/video/${part.media.videoId}?title=0&byline=0&portrait=0${part.media.autoplay ? '&autoplay=1' : ''}${part.media.muted ? '&muted=1' : ''}`
                          : `https://www.dailymotion.com/embed/video/${part.media.videoId}?ui-highlight=444444&ui-logo=0${part.media.autoplay ? '&autoplay=1' : ''}${part.media.muted ? '&mute=1' : ''}`
                      }
                      title={part.media.title || ''}
                      frameBorder="0"
                      allow={
                        part.media.platform === 'youtube'
                          ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                          : part.media.platform === 'vimeo'
                          ? 'autoplay; fullscreen; picture-in-picture'
                          : 'autoplay; fullscreen'
                      }
                      allowFullScreen
                    ></iframe>
                  </div>
                  {part.media.caption && (
                    <p className="video-caption">{part.media.caption}</p> // Using same caption class as images
                  )}
                </div>
                
              );
            }
            return null;
          })}
        </div>
      );
    }

    // No inline images or videos, render as normal markdown
    return (
      <div className="blog-post-content">
         <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          
          return !inline && match ? (
            <CodeBlock language={match[1]} value={codeString} />
          ) : (
            <code className={className} {...props}>{children}</code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
      </div>
    );
  };
const showDeleteConfirmation = (commentId, email) => {
    setCommentToDelete({ id: commentId, email });
    setShowDeleteModal(true);
  };

// Fetch author profile
const fetchAuthorProfile = async (authorId) => {
  setAuthorLoading(true);
  setShowAuthorModal(true);
  try {
    const response = await axios.get(
      `https://connectwithaaditiyamg.onrender.com/api/admins/${authorId}/public`
    );
    setAuthorData(response.data.admin);
  } catch (err) {
    console.error('Error fetching author profile:', err);
    setAuthorData(null);
  } finally {
    setAuthorLoading(false);
  }
};

// Get social media icon and URL
const getSocialIcon = (platform) => {
  const icons = {
    twitter: 'https://cdn.cdnlogo.com/logos/t/96/twitter-icon.svg',
    linkedin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAYFBMVEUCdLP///8AbK+WuNaivtoAb7HJ2ukAaq9MkMGIsdKeu9jb5/Epe7YAcrIAaK6vy+Hy9/u/0uXT4e0AYau4zeJOir6DrNDo8PY9g7pyosphmsYmf7inxt5XjsAidLP3+/wVij8FAAAEJ0lEQVR4nO2ci3KrIBCGEUWSKhgvMZfG+P5veaSxJ8bsGp3RhXOGf5qJNdR+wQV2F4QFDx2KKrKsvDj0MOzxFh6Fllxybl6PHy6fJ4ZH41Kjo/71PJoqPzwptTiGA6icacUckNIs/4WquBNIRopXD6hMOsPUUcnKQLXCIaaOSrQdVM1tc7yK1wE7nZ2qqK6qzicWO1ZRXVXFrNK2IcbSFYvcq6mIhe5BhR5qnjzUXHmoufpHoYTg1F7ENJTipdpdLtfvktQxnYJS8rw/9VHFrSF0Tqeg9C+SUVspMtvDocS9CF7UXqmocKh7HIzUNtIulNLJmKmj2gmrUDJ8ZwqChMYfRKDU8QBBBXuSG4hAyQhkChIKJgyqbGGo4EJhVTCUOiNMAYlDD0N14SCiwiIU2PaMThSWDkNhdt5BUXQKS2uKpKeCocQFg8rt2ZRiGBSJm4r1U8DIZ3RoKLwqBArrE0h6BHTsu8NVReMmYF6CuEJMGY2bhzp5+vbOlNxp/HTc8+RvHWhyp/HxJqBU+fXKlKdETJPRDE/jp6uXXOlirMlgVMljaLja5HahC7A+hu2KSzONJGkj9zkJDvI0+z+adbEgDzVXJFBqYVPZFkoJYaaHRWrygZJzMa9nQaG6qwEa/TGgwVCktLruq6SPa9tTfKsbpmeMVWjW5bKH9PJFv0OgxPX3nwqeRsk40G6TbPe5I0b9qVHGrNewqNhBJfqJOqWbHLxCN4rW4kNtoVBvKbMfDa8GQ2U/0apgNywbYbB202a8DZRuTtBnT31NBtqbQPEazm4NVE3dwS2gNBpfDxRPZOY3gOL7GUyTQcj6UCUYBwHCl0OsD3X/YONPoaPP6lA3IDRDVGFNcHWoj+3uqbZBmuDqUEuUI8kuq1ABMgrahULmCuxCFXADtAt1ODoIhUxgWIa6gUa1GVRbhDumy1LsIiR/apSUlFBxI+SjwQutatzhI4Rq63JgwYoLdDxMIUvfBuoyMhVxxqiukKVvAhW+3RSJ+TOg/7IFVHJ/vx40T24UQc1vCyjo2wtktgBcOrkBVAutRFaIVeVENQWvG5VwdBsTGTo8dOgMLAwOyetDtcggCxtVAWVU14dKUogJK00EFcM+kvqGoaAufX0oZEJXCbB0QgOFBE4oFFB2fajMRShw4LANhaSePJSH8lAeynUo5iKUkzXloTyUh/JQHspDeSgP5aE8lIfyUB7qP4HaML2oohhQMYRS5wIqg61AEmDpbEnK2qwbBaQWFvlYetESAKvyUHPloebKQ82Vh5orV6Gc3OrJyU2xCnBQtClRMGQJoT2p44EFoWP3T4dmR0H6h+WmZB4XZ0QPrM8Wzx8bQububAgpDNNj68w41Uuf4tpESqc/EcvLJqO83/qzl/z7y/BoUAI6mn9y9PF4k9HAbMeau7Md6x9Q0FFyBTsovgAAAABJRU5ErkJggg==',
    github: 'https://cdn.cdnlogo.com/logos/g/69/github-icon.svg',
    instagram: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8lv-iEOWtRxGDqsOR-Pa1kIiqN298569zVA&s',
    youtube: 'https://cdn.cdnlogo.com/logos/y/23/youtube-icon.svg',
    medium: 'https://cdn.cdnlogo.com/logos/m/66/medium-icon.svg',
    portfolio: 'https://cdn.freebiesupply.com/logos/large/2x/portfolio-logo-svg-vector.svg',
    personalWebsite: 'https://cdn.cdnlogo.com/logos/w/90/world-wide-web.svg'
  };
  return icons[platform] || 'https://cdn.cdnlogo.com/logos/w/90/world-wide-web.svg';
};
// Custom code block component with copy button
// ============================================
// 1. COMPONENT - Add this before return() in BlogPost
// ============================================

const CodeBlock = ({ language, value }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCode(value);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="minimal-code-block">
      <div className="code-top-bar">
        <span className="code-lang-label">{language || 'code'}</span>
        <button
          className="minimal-copy-btn"
          onClick={handleCopy}
          title="Copy code"
        >
          {copiedCode === value ? (
            <Check size={18} strokeWidth={2.5} />
          ) : (
            <Copy size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>
      <pre className="minimal-code-pre">
        <code className="minimal-code-text">{value}</code>
      </pre>
    </div>
  );
};

  return (
    <section className="section blog-post-section">

      {isLoading && (
        <div className="loading">
          <div><Dots/></div>
        </div>
      )}
      
      {error && (
        <div className="error">{error}</div>
      )}
      
      {!isLoading && blogPost && (
        <div className="card blog-post">
           {isSubscriberOnlyBlog() && !canAccessFullContent() ? (
          <div className="subscriber-only-preview">
            {/* Featured Image */}
            {blogPost.featuredImage && (
              <div className="featured-image-container">
                <img 
                  src={blogPost.featuredImage} 
                  alt={blogPost.title}
                  className="blog-post-image subscription-blur"
                />
                <div className="subscription-overlay">
                  <div className="subscription-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <h2>Subscriber Only Content</h2>
                    <p>This article is exclusively available to our subscribers</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Title, Author, Date - Always visible */}
            <h1 className="blog-post-title">{blogPost.title}</h1>
            
            <div className="blog-post-meta">
              <span className="blog-post-date">
                {formatBlogDate(blogPost.publishedAt)}
              </span>
              <span className="meta-divider">• Written by</span>
              <span 
                className="blog-post-author clickable-author"
                onClick={() => blogPost.author?._id && fetchAuthorProfile(blogPost.author._id)}
                style={{ cursor: blogPost.author?._id ? 'pointer' : 'default' }}
              >
                {blogPost.author ? `@${blogPost.author.name}` : 'By Aaditiya Tyagi'}
              </span>
            </div>
            
            {/* Tags */}
            <div className="blog-post-tags">
              <div className="blog-post-meta2">
                <span className="meta-divider2">•</span>
                <span className="blog-post-reads2">
                  {uniqueReaders || 0} {uniqueReaders === 1 ? 'read' : 'reads'}
                </span>
              </div>
              {blogPost.tags && blogPost.tags.map((tag, index) => (
                <span key={index} className="tag"># {tag}</span>
              ))}
            </div>
            
            {/* Summary */}
            <div className="subscriber-preview-summary">
              <p className="summary-text">{blogPost.summary}</p>
            </div>
            
            {/* Call to Action - Subscribe */}
            <div className="subscriber-cta-section">
              <div className="cta-content">
                <h3>Unlock Full Access</h3>
               <h3 
  className="price-free-heading" 
  style={{
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: "700",
    marginTop: "6px"
  }}
>
  ₹0
</h3>


                <p>Subscribe to read this article and access exclusive content from our writers</p>
                <div className="cta-benefits">
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Full article access</span>
                  </div>
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Ad-free reading</span>
                  </div>
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Exclusive member content</span>
                  </div>
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Support great writing</span>
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-primary cta-button"
               onClick={() => {
  const currentUrl = window.location.pathname + window.location.search;
  navigate(`/auth?redirect=${encodeURIComponent(currentUrl)}`);
}}
              >
                Subscribe Now
              </button>
              <button 
                className="btn btn-secondary cta-button-secondary"
                onClick={() => navigate('/blog')}
              >
                Browse Other Articles
              </button>
            </div>
          </div>
        ) : (
          <>
    <h1 className="blog-post-title">{blogPost.title}</h1>
          <div className="blog-post-meta">
  <span className="blog-post-date">
    {formatBlogDate(blogPost.publishedAt)}
  </span>
  <span className="meta-divider">• Written by</span>
  <span 
  className="blog-post-author clickable-author"
  onClick={() => blogPost.author?._id && fetchAuthorProfile(blogPost.author._id)}
  style={{ cursor: blogPost.author?._id ? 'pointer' : 'default' }}
>
  {blogPost.author ? `@${blogPost.author.name}` : 'By Aaditiya Tyagi'}
</span>
</div>
     {/* Display tags exactly as they are in the blog post */}
       <div className="blog-post-tags">
  <div className="blog-post-meta2">
    <span className="meta-divider2">•</span>
    <span className="blog-post-reads2">
      {uniqueReaders || 0} {uniqueReaders === 1 ? 'read' : 'reads'}
    </span>
  </div>
  {blogPost.tags && blogPost.tags.map((tag, index) => (
    <span key={index} className="tag"># {tag}</span>
  ))}
</div>
      
         <div className="blog-controls-minimal">
  <button
    className="generate-summary-btn2 summarybtn"
    onClick={(e) => handleGenerateSummary(blogPost, e)}
  >
    AI Summary
  </button>

  <div className="read-along-controls">
   <button
  className={`read-along-minimal-btn ${isReadingAloud ? 'playing' : ''} ${isPausedReading ? 'paused' : ''}`}
  onClick={() => {
    if (isReadingAloud || isPausedReading) {
      if (isPausedReading) handlePlayReading();
      else handlePauseReading();
    } else {
      handlePlayReading();
    }
  }}
  title={isPausedReading ? 'resume' : isReadingAloud ? 'pause' : 'Voice'}
>
  {isReadingAloud ? (
    <Pause size={18} strokeWidth={2} />
  ) : isPausedReading ? (
    <Play size={18} strokeWidth={2} />
  ) : (
    <Volume2 size={18} strokeWidth={2} />
  )}
</button>

<button 
  className="voice-selector-btn" 
  onClick={() => setShowVoiceSelector(!showVoiceSelector)}
  title="Change voice"
>
  Select Voice <ChevronDown className='dropdown-btn' size={18} strokeWidth={2} />
</button>

{(isReadingAloud || isPausedReading) && (
  <>
    <button className="read-along-stop-btn" onClick={handleStopReading}>
      <Square size={18} strokeWidth={2} />
    </button>
  </>
)}

    {/* Voice Selector Dropdown */}
    {showVoiceSelector &&(
      <div className="voice-selector-dropdown">
        <div className="voice-list">
          {availableVoices
            .filter(v => v.lang.includes('en') || v.lang.includes('hi'))
            .slice(0, 15)
            .map((voice, i) => (
              <div
                key={i}
                className={`voice-option ${selectedVoice?.name === voice.name ? 'selected' : ''}`}
                onClick={() => {
                 setSelectedVoice(voice);   // update voice
  setShowVoiceSelector(false);
  setShouldRestartReading(true);  // <-- new flag
                 
                }}
              >
                <span className="voice-name">{voice.name.replace('Microsoft ', '').replace('Google ', '')}</span>
                <small>{voice.lang}</small>
              </div>
            ))}
        </div>
      </div>
    )}
  </div>
</div>
    {blogPost.featuredImage && (
      <div className="featured-image-container">
        <img src={blogPost.featuredImage} alt={blogPost.title} className="blog-post-image" />
      </div>
    )}
          

          
     

          
          {/* Render content with inline images and videos */}
          {renderContentWithMedia(blogPost.content)}
          
          {/* Reactions section */}
        <div className="blog-reactions">
  <h3>Did you find this article helpful?</h3>
  <div className="reaction-buttons">
    <button
      className={`reaction-btn ${userReaction === 'like' ? 'active' : ''} ${reactionInProgress ? 'disabled' : ''}`}
      onClick={() => handleReactionClick('like')}
      disabled={reactionInProgress}
    >
      {userReaction === 'like' ? <FaThumbsUp /> : <FaRegThumbsUp />}
      <span>{reactions.likes}</span>
    </button>
    <button
      className={`reaction-btn ${userReaction === 'dislike' ? 'active' : ''} ${reactionInProgress ? 'disabled' : ''}`}
      onClick={() => handleReactionClick('dislike')}
      disabled={reactionInProgress}
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
              onClick={handleShareClick}
            >
              <FaShare />
              Share
            </button>
             <button 
    className="rpt-btn btn share-btn"
    onClick={() => {
      // Pre-fill email if user info exists
      if (storedUserInfo && storedUserInfo.email) {
        setReportForm(prev => ({
          ...prev,
          email: storedUserInfo.email
        }));
      }
      setShowReportModal(true);
    }}
  >
    <FaFlag />
    Report
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
    
    {/* Show name/email fields ONLY if NOT logged in */}
    {!isLoggedIn && (
      <>
      <div className="guest-login-prompt">
          <button
            type="button"
            className="login-link-btn"
            onClick={() => navigate('/blog/subscribe')}
            title="Login to comment without entering details each time"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Subscribe to skip this step
          </button>
        </div>
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
        
        {/* Login link for guests */}
        
      </>
    )}
    
    {/* Show logged-in user info */}
    {isLoggedIn && loggedInUser && (
      <div className="logged-in-user-info">
        <div className="user-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Commenting as <strong>{loggedInUser.name}</strong></span>
        </div>
      </div>
    )}
    
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
    
    <button 
      type="submit" 
      className="submit-comment btn btn-primary"
      disabled={commentSubmitting}
    >
      {commentSubmitting ? 'Submitting...' : 'Submit Comment'}
    </button>
  </form>
)}
             <div className="comments-scrollable-container">
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
  {comments
    .sort((a, b) => {
      // Author comments first, then by creation date (oldest first for regular comments)
      if (a.isAuthorComment && !b.isAuthorComment) return -1;
      if (!a.isAuthorComment && b.isAuthorComment) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt); // Changed to ascending (oldest first)
    })
    .slice(0, visibleCommentsCount)
    .map(comment => (
                      <div className={`comment-card ${comment.isAuthorComment ? 'author-comment' : ''}`} key={comment._id}>
  <div className="comment-header">
    <div className="comment-author-info">
      {/* ✅ ADD PROFILE PICTURE */}
      <div className="comment-user-avatar">
        {getUserProfilePicture(comment) ? (
          <img 
            src={getUserProfilePicture(comment)} 
            alt={comment.user.name}
            className="comment-avatar-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="comment-avatar-placeholder"
          style={{ display: getUserProfilePicture(comment) ? 'none' : 'flex' }}
        >
          {getInitials(comment.user.name)}
        </div>
      </div>
      
      {/* ✅ WRAP TEXT IN CONTAINER */}
      <div className="comment-author-text">
        <strong className="comment-author">
          {comment.user.name}
          {comment.isAuthorComment && <span className="author-badge">Author</span>}
        </strong>
        <span className="comment-date">{formatDate(comment.createdAt)}</span>
      </div>
    </div>
                          
                        {/* Show delete button only for non-author comments and if verified ownership */}
{!comment.isAuthorComment && commentDeletability[comment._id] === true && (
  <button
    className="delete-comment-btn"
    onClick={() => showDeleteConfirmation(comment._id, comment.user.email)}
    disabled={deleteCommentLoading === comment._id}
    title="Delete your comment"
  >
    {deleteCommentLoading === comment._id ? '...' : '×'}
  </button>
)}
                         
                        </div>
                        
                        <div className="comment-content">{comment.content}</div>
                        
                        {/* Comment Actions */}
                        <div className="comment-actions">
                          {/* Comment Reactions */}
                          <div className="comment-reactions">
                          <button
  className={`reaction-btn2 ${userCommentReactions[comment._id] === 'like' ? 'active' : ''}`}
  onClick={() => handleCommentReaction(comment._id, 'like')}
  disabled={commentReactionInProgress[comment._id]}
>
  {userCommentReactions[comment._id] === 'like' ? <FaThumbsUp /> : <FaRegThumbsUp />}
  <span>{commentReactions[comment._id]?.likes || 0}</span>
</button>
                            <button
                              className={`reaction-btn2 ${userCommentReactions[comment._id] === 'dislike' ? 'active' : ''}`}
                              onClick={() => handleCommentReaction(comment._id, 'dislike')}
                              disabled={commentReactionLoading === comment._id}
                            >
                              {userCommentReactions[comment._id] === 'dislike' ? <FaThumbsDown /> : <FaRegThumbsDown />}
                              <span>{commentReactions[comment._id]?.dislikes || 0}</span>
                            </button>
                          </div>
                          
                          {/* Reply Button */}
                          <button
                            className="reply-btn"
                            onClick={() => toggleReplyForm(comment._id)}
                          >
                            Reply
                          </button>
                          
                          {/* Show Replies Button */}
                          {comment.repliesCount > 0 && (
                            <button
                              className="show-replies-btn"
                              onClick={() => toggleReplies(comment._id)}
                            >
                              {showReplies[comment._id] ? 'Hide' : 'Show'} {comment.repliesCount} {comment.repliesCount === 1 ? 'Reply' : 'Replies'}
                            </button>
                          )}
                        </div>
                        
                     {showReplyForm[comment._id] && (
  <form className="reply-form" onSubmit={(e) => handleReplySubmit(e, comment._id)}>
    {replyError && <div className="error-message">{replyError}</div>}
    {replySuccess && <div className="success-message">{replySuccess}</div>}
    
    {/* Show name/email fields ONLY if NOT logged in */}
    {!isLoggedIn && (
      <>
       <div className="guest-login-prompt">
          <button
            type="button"
            className="login-link-btn"
            onClick={() => navigate('/userauth')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Subscribe to skip this step
          </button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`reply-name-${comment._id}`}>Name *</label>
            <input
              type="text"
              id={`reply-name-${comment._id}`}
              name="name"
              value={replyForm.name}
              onChange={handleReplyFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor={`reply-email-${comment._id}`}>Email *</label>
            <input
              type="email"
              id={`reply-email-${comment._id}`}
              name="email"
              value={replyForm.email}
              onChange={handleReplyFormChange}
              required
            />
          </div>
        </div>
        
      </>
    )}
    
    {isLoggedIn && loggedInUser && (
      <div className="logged-in-user-info">
        <div className="user-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Replying as <strong>{loggedInUser.name}</strong></span>
        </div>
      </div>
    )}
    
    <div className="form-group">
      <label htmlFor={`reply-content-${comment._id}`}>Reply *</label>
      <textarea
        id={`reply-content-${comment._id}`}
        name="content"
        value={replyForm.content}
        onChange={handleReplyFormChange}
        rows="3"
        required
        maxLength="1000"
      ></textarea>
      <span className="character-count">
        {replyForm.content.length}/1000
      </span>
    </div>
    
    <div className="reply-form-actions">
      <button 
        type="button" 
        className="btn btn-secondary"
        onClick={() => toggleReplyForm(comment._id)}
      >
        Cancel
      </button>
      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={replyLoading === comment._id}
      >
        {replyLoading === comment._id ? 'Submitting...' : 'Submit Reply'}
      </button>
    </div>
  </form>
)}
                        
                        {/* Replies Section */}
                        {showReplies[comment._id] && (
                          <div className="replies-section">
                            {repliesLoading[comment._id] ? (
                              <div className="loading replies-loading">
                                <div className="spinner"></div>
                              </div>
                            ) : commentReplies[comment._id] && commentReplies[comment._id].length > 0 ? (
                              <div className="replies-list">
                                {commentReplies[comment._id]
                                  .sort((a, b) => {
                                    // Author replies first, then by creation date (newest first)
                                    if (a.isAuthorComment && !b.isAuthorComment) return -1;
                                    if (!a.isAuthorComment && b.isAuthorComment) return 1;
                                    return new Date(b.createdAt) - new Date(a.createdAt);
                                  })
                                  .map(reply => (
                                  
                                        <div className={`reply-card ${reply.isAuthorComment ? 'author-reply' : ''}`} key={reply._id}>
  <div className="reply-header">
    <div className="reply-author-info">
      {/* ✅ ADD PROFILE PICTURE FOR REPLIES */}
      <div className="reply-user-avatar">
        {getUserProfilePicture(reply) ? (
          <img 
            src={getUserProfilePicture(reply)} 
            alt={reply.user.name}
            className="reply-avatar-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="reply-avatar-placeholder"
          style={{ display: getUserProfilePicture(reply) ? 'none' : 'flex' }}
        >
          {getInitials(reply.user.name)}
        </div>
      </div>
      
      {/* ✅ WRAP TEXT IN CONTAINER */}
      <div className="reply-author-text">
        <strong className="reply-author">
          {reply.user.name}
          {reply.isAuthorComment && <span className="author-badge1">Author</span>}
        </strong>
        <span className="reply-date">{formatDate(reply.createdAt)}</span>
      </div>
    </div>
                                       {/* Delete button for user's own replies with verified ownership */}
{!reply.isAuthorComment && commentDeletability[reply._id] === true && (
  <button
    className="delete-reply-btn"
    onClick={() => showDeleteConfirmation(reply._id, reply.user.email)}
    disabled={deleteCommentLoading === reply._id}
    title="Delete your reply"
  >
    {deleteCommentLoading === reply._id ? '...' : '×'}
  </button>
)}
                                        
                                      </div>
                                      
                                      <div className="reply-content">{reply.content}</div>
                                      
                                      {/* Reply Reactions */}
                                      <div className="reply-actions">
                                        <div className="reply-reactions">
                                          <button
                                            className={`reaction-btn2 ${userCommentReactions[reply._id] === 'like' ? 'active' : ''}`}
                                            onClick={() => handleCommentReaction(reply._id, 'like')}
                                            disabled={commentReactionLoading === reply._id}
                                          >
                                            {userCommentReactions[reply._id] === 'like' ? <FaThumbsUp /> : <FaRegThumbsUp />}
                                            <span>{commentReactions[reply._id]?.likes || 0}</span>
                                          </button>
                                          <button
                                            className={`reaction-btn2 ${userCommentReactions[reply._id] === 'dislike' ? 'active' : ''}`}
                                            onClick={() => handleCommentReaction(reply._id, 'dislike')}
                                            disabled={commentReactionLoading === reply._id}
                                          >
                                            {userCommentReactions[reply._id] === 'dislike' ? <FaThumbsDown /> : <FaRegThumbsDown />}
                                            <span>{commentReactions[reply._id]?.dislikes || 0}</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="no-replies">No replies yet.</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
{comments.length > visibleCommentsCount && (
  <div className="load-more-container">
    <button 
      className="load-more-btn"
      onClick={() => setVisibleCommentsCount(prev => prev + 2)}
    >
      <ChevronDown size={20} />
      <span>Load More Comments</span>
    </button>
  </div>
)}
                {/* Delete confirmation modal */}
                {showDeleteModal && (
                  <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                      <h3>Delete Comment</h3>
                      <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
                      
                      <div className="modal-actions">
                        <button 
                          onClick={cancelDelete}
                          className="btn btn-secondary"
                          disabled={deleteCommentLoading}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleDeleteComment}
                          className="btn btn-danger"
                          disabled={deleteCommentLoading}
                        >
                          {deleteCommentLoading ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
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
         
      {blogs.length > 0 && (
  <div className="simplified-other-blogs-wrapper">
    <h3 className="checkout-other-blogs-heading">Checkout Other Blogs</h3>
    <div className="minimalist-blogs-grid-container">
      {blogs.slice(0, 4).map((blog) => (
       <div
              key={blog._id}
              className="blog-card-small"
              onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}
            >
          <div className="small-image-wrapper">
                {blog.featuredImage ? (
                  <img src={blog.featuredImage} alt={blog.title} className="small-image" />
                ) : (
                  <div className="small-placeholder">
                    <span className="placeholder-text">AT</span>
                  </div>
                )}
              </div>
         <div className="small-content">
                <div className="small-meta">
                  <span className="small-author">{blog.author?.name || 'Anonymous'}</span>
                  <span className="meta-divider">•</span>
                  <span className="small-date">
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="small-title">{blog.title}</h3>
                <p className="small-summary">{blog.summary}</p>
                <div className="small-footer">
                  <div className="small-tags">
                    {blog.tags && blog.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="small-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
          
        </div>
        
      ))}
    </div>
  </div>
  
)}
</>
        )}
        </div>
      )}
      
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share this article</h3>
            {blogPost?.featuredImage && (
              <div className="share-preview">
                <img 
                  src={blogPost.featuredImage} 
                  alt={blogPost.title}
                  className="share-preview-image"
                />
              </div>
            )}
            <p>Choose how you'd like to share "{blogPost?.title}"</p>
            
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
              
              {/* Add Pinterest for image-focused sharing */}
              {blogPost?.featuredImage && (
                <button 
                  className="share-option-btn pinterest"
                  onClick={() => handleSocialShare('pinterest')}
                >
                  <FaPinterest />
                  Pinterest 
                </button>
              )}
              
              {/* Add Telegram */}
              <button 
                className="share-option-btn telegram"
                onClick={() => handleSocialShare('telegram')}
              >
                <FaTelegramPlane /> 
                Telegram
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
                className="close-button1"
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
      {showSummaryPopup && (
  <div className="summary-popup-overlay">
    <div className="summary-popup">
      <div className="popup-header">
        <h3>AI Generated Summary</h3>
        <button onClick={closeSummaryPopup} className="close-btn">×</button>
      </div>
      <div className="popup-content">
        {selectedBlog && (
          <div className="blog-info">
            <h4>{selectedBlog.title}</h4>
            <p className="blog-date-popup">
              {new Date(selectedBlog.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
        <div className="summary-content">
          {isGeneratingSummary && (
            <div className="generating-summary">
          
<div class="loading2">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>
              <p>Generating AI summary...</p>
            </div>
          )}
          {summaryError && (
            <div className="summary-error">
              <p>Error: {summaryError}</p>
            </div>
          )}
          {generatedSummary && !isGeneratingSummary && (
            <div className="generated-summary">
              <h5>Summary:</h5>
              <p>{generatedSummary}</p>
            </div>
          )}
        </div>
      </div>
       {showInfo && (
    <div className="floating-warning-popup">
      This summary is generated by artificial intelligence and may not accurately represent the original message’s intent or context. It is recommended to review the content carefully, as certain nuances, meanings, or expressions might be misinterpreted, simplified, or omitted during the automated summarization process. Use it with discretion.
    </div>
  )}
    <div className="popup-footer">
    <div
      className="footer-info-icon"
      onClick={() => setShowInfo(!showInfo)}
      onMou={() => setShowInfo(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="info-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
                 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 
                 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 
                 8-8 8zm-.88-5.75h1.75v4.25h-1.75V14.25zm0-6.5h1.75v1.75h-1.75V7.75z"/>
      </svg>
    </div>

    <button onClick={closeSummaryPopup} className="close-popup-btn">
      Close
    </button>
  </div>
    </div>
  </div>
)}
{showReportModal && (
  <div className="report-overlay-bg" onClick={() => setShowReportModal(false)}>
    <div className="report-dialog-box" onClick={(e) => e.stopPropagation()}>
      <h3 className="report-dialog-title">Report This Article</h3>
      <p className="report-dialog-subtitle">Please let us know why you're reporting this content</p>
      
      {reportError && <div className="report-error-msg">{reportError}</div>}
      {reportSuccess && <div className="report-success-msg">{reportSuccess}</div>}
      
      <form onSubmit={handleReportSubmit} className="report-form-container">
        <div className="report-field-group">
          <label htmlFor="report-email" className="report-field-label">Your Email *</label>
          <input
            type="email"
            id="report-email"
            name="email"
            value={reportForm.email}
            onChange={handleReportFormChange}
            required
            disabled={reportLoading}
            className="report-email-input"
          />
        </div>
        
        <div className="report-field-group">
          <label className="report-field-label">Select a reason *</label>
          <div className="report-reason-list">
            <div 
              className={`report-reason-item ${reportForm.reason === 'Spam or misleading content' ? 'report-reason-selected' : ''}`}
              onClick={() => setReportForm(prev => ({ ...prev, reason: 'Spam or misleading content' }))}
            >
              <input 
                type="radio" 
                name="report-reason" 
                value="Spam or misleading content"
                checked={reportForm.reason === 'Spam or misleading content'}
                onChange={() => {}}
                disabled={reportLoading}
                className="report-radio-input"
              />
              <label className="report-radio-label">Spam or misleading content</label>
            </div>
            
            <div 
              className={`report-reason-item ${reportForm.reason === 'Inappropriate or offensive content' ? 'report-reason-selected' : ''}`}
              onClick={() => setReportForm(prev => ({ ...prev, reason: 'Inappropriate or offensive content' }))}
            >
              <input 
                type="radio" 
                name="report-reason" 
                value="Inappropriate or offensive content"
                checked={reportForm.reason === 'Inappropriate or offensive content'}
                onChange={() => {}}
                disabled={reportLoading}
                className="report-radio-input"
              />
              <label className="report-radio-label">Inappropriate or offensive content</label>
            </div>
            
            <div 
              className={`report-reason-item ${reportForm.reason === 'Copyright or plagiarism issue' ? 'report-reason-selected' : ''}`}
              onClick={() => setReportForm(prev => ({ ...prev, reason: 'Copyright or plagiarism issue' }))}
            >
              <input 
                type="radio" 
                name="report-reason" 
                value="Copyright or plagiarism issue"
                checked={reportForm.reason === 'Copyright or plagiarism issue'}
                onChange={() => {}}
                disabled={reportLoading}
                className="report-radio-input"
              />
              <label className="report-radio-label">Copyright or plagiarism issue</label>
            </div>
            
            <div 
              className={`report-reason-item ${reportForm.reason === 'Factually incorrect information' ? 'report-reason-selected' : ''}`}
              onClick={() => setReportForm(prev => ({ ...prev, reason: 'Factually incorrect information' }))}
            >
              <input 
                type="radio" 
                name="report-reason" 
                value="Factually incorrect information"
                checked={reportForm.reason === 'Factually incorrect information'}
                onChange={() => {}}
                disabled={reportLoading}
                className="report-radio-input"
              />
              <label className="report-radio-label">Factually incorrect information</label>
            </div>
            
            <div 
              className={`report-reason-item ${reportForm.reason === 'Hate speech or discrimination' ? 'report-reason-selected' : ''}`}
              onClick={() => setReportForm(prev => ({ ...prev, reason: 'Hate speech or discrimination' }))}
            >
              <input 
                type="radio" 
                name="report-reason" 
                value="Hate speech or discrimination"
                checked={reportForm.reason === 'Hate speech or discrimination'}
                onChange={() => {}}
                disabled={reportLoading}
                className="report-radio-input"
              />
              <label className="report-radio-label">Hate speech or discrimination</label>
            </div>
            
            <div 
              className={`report-reason-item ${(reportForm.reason && !['Spam or misleading content', 'Inappropriate or offensive content', 'Copyright or plagiarism issue', 'Factually incorrect information', 'Hate speech or discrimination'].includes(reportForm.reason)) ? 'report-reason-selected' : ''}`}
              onClick={() => setReportForm(prev => ({ ...prev, reason: 'custom' }))}
            >
              <input 
                type="radio" 
                name="report-reason" 
                value="custom"
                checked={reportForm.reason === 'custom' || (reportForm.reason && !['Spam or misleading content', 'Inappropriate or offensive content', 'Copyright or plagiarism issue', 'Factually incorrect information', 'Hate speech or discrimination'].includes(reportForm.reason))}
                onChange={() => {}}
                disabled={reportLoading}
                className="report-radio-input"
              />
              <label className="report-radio-label">Other (please specify)</label>
            </div>
          </div>
        </div>
        
        {(reportForm.reason === 'custom' || (reportForm.reason && !['Spam or misleading content', 'Inappropriate or offensive content', 'Copyright or plagiarism issue', 'Factually incorrect information', 'Hate speech or discrimination'].includes(reportForm.reason))) && (
          <div className="report-field-group report-custom-textarea">
            <label htmlFor="report-custom-reason" className="report-field-label">Please describe the issue *</label>
            <textarea
              id="report-custom-reason"
              name="customReason"
              value={reportForm.reason === 'custom' ? '' : reportForm.reason}
              onChange={(e) => setReportForm(prev => ({ ...prev, reason: e.target.value }))}
              rows="4"
              required
              minLength="10"
              maxLength="500"
              placeholder="Please describe the issue (10-500 characters)"
              disabled={reportLoading}
              className="report-textarea-input"
            ></textarea>
            <span className="report-char-counter">
              {(reportForm.reason === 'custom' ? 0 : reportForm.reason.length)}/500 (minimum 10 characters)
            </span>
          </div>
        )}
        
        <div className="report-dialog-actions">
          <button 
            type="button" 
            onClick={() => {
              setShowReportModal(false);
              setReportError(null);
              setReportSuccess(null);
              setReportForm({ email: '', reason: '' });
            }}
            className="report-btn report-btn-cancel"
            disabled={reportLoading}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="report-btn report-btn-submit"
            disabled={reportLoading || !reportForm.reason || reportForm.reason === 'custom'}
          >
            {reportLoading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
{showAuthorModal && (
  <div className="author-modal-overlay" onClick={() => setShowAuthorModal(false)}>
    <div className="author-modal-content" onClick={(e) => e.stopPropagation()}>
      <button 
        className="author-modal-close"
        onClick={() => setShowAuthorModal(false)}
      >
        ×
      </button>
      
      {authorLoading ? (
        <div className="author-modal-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      ) : authorData ? (
        <div className="author-profile-content">
          {/* Profile Header */}
          <div className="author-profile-header">
            {authorData.profileImage?.hasImage ? (
              <img 
                src={`https://connectwithaaditiyamg.onrender.com/api/admins/${blogPost.author._id}/image`}
                alt={authorData.name}
                className="author-profile-image1"
              />
            ) : (
              <div className="author-profile-placeholder1">
                {authorData.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="author-profile-info">
              <h2 className="author-profile-name">{authorData.name}</h2>
              {authorData.designation && (
                <p className="author-profile-designation">{authorData.designation}</p>
              )}
              {authorData.location && (
                <p className="author-profile-location">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {authorData.location}
                </p>
              )}
            </div>
          </div>
          
          {/* Bio */}
          {authorData.bio && (
            <div className="author-profile-bio">
              <p>{authorData.bio}</p>
            </div>
          )}
          
          {/* Expertise */}
          {authorData.expertise && authorData.expertise.length > 0 && (
            <div className="author-profile-section">
              <h3 className="author-section-title">Expertise</h3>
              <div className="author-tags">
                {authorData.expertise.map((skill, index) => (
                  <span key={index} className="author-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
          
          {/* Interests */}
          {authorData.interests && authorData.interests.length > 0 && (
            <div className="author-profile-section">
              <h3 className="author-section-title">Interests</h3>
              <div className="author-tags">
                {authorData.interests.map((interest, index) => (
                  <span key={index} className="author-tag">{interest}</span>
                ))}
              </div>
            </div>
          )}
          
          {authorData.socialLinks &&
  Object.entries(authorData.socialLinks).some(([_, url]) => url) && (
    <div className="author-profile-section">
      <h3 className="author-section-title">Connect</h3>
      <div className="author-social-links">
        {Object.entries(authorData.socialLinks).map(([platform, url]) => {
          if (!url) return null;
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="author-social-link"
              title={platform.charAt(0).toUpperCase() + platform.slice(1)}
            >
              <img
                src={getSocialIcon(platform)}
                alt={platform}
                className="author-social-icon"
              />
            </a>
          );
        })}
      </div>
    </div>
  )}
{authorData && (
  <div className="author-profile-section">
    <button
      className="author-blogs-btn"
      onClick={() => {
        setShowAuthorModal(false);
        navigate('/blog', { 
          state: { 
            filterAuthor: {
              id: blogPost.author._id,
              name: authorData.name
            }
          } 
        });
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
      See Other Blogs by {authorData.name}
    </button>
  </div>
)}
       {/* Member Since */}
          {authorData.joinedDate && (
            <div className="author-profile-footer">
              <p className="author-joined-date">
                Joined {new Date(authorData.joinedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="author-modal-error">
          <p>Unable to load author profile</p>
        </div>
      )}
    </div>
  </div>
)} 
{/* Moderation Error Modal */}
{showModerationModal && (
  <div className="moderation-modal-overlay">
    <div className="moderation-modal">
      <div className="moderation-modal-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      
      <h3 className="moderation-modal-title">Content Moderation</h3>
      
      <p className="moderation-modal-message">
        {moderationError}
      </p>
      
      <div className="moderation-guidelines">
        <p className="moderation-guidelines-title">Our Community Guidelines - Your comment must not contain:</p>
        <div className="moderation-rules-grid">
          <ul className="moderation-rules-column">
            <li>Hate speech, discrimination, or prejudice</li>
            <li>Harassment, bullying, or personal attacks</li>
            <li>Profanity or vulgar language</li>
            <li>Spam or promotional content</li>
            <li>Threats, violence, or harmful content</li>
          </ul>
          <ul className="moderation-rules-column">
            <li>Sexual content or inappropriate references</li>
            <li>Misinformation or false statements</li>
            <li>Trolling, baiting, or inflammatory remarks</li>
            <li>Off-topic or irrelevant content</li>
          </ul>
        </div>
        <div className="moderation-positive-note">
          <strong>Remember:</strong> Comments should be respectful, constructive, and relevant to the blog topic.
        </div>
      </div>
      
      <button 
        className="moderation-modal-btn"
        onClick={() => {
          setShowModerationModal(false);
          setModerationError('');
        }}
      >
        I Understand
      </button>
    </div>
  </div>
)}
{/* Floating Reading Overlay */}
{showReadingOverlay && (
  <div className="reading-overlay">
    <div className="reading-indicator">
      <div className="sound-waves">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <div className="reading-text">
        "{currentSentence || 'Starting to read...'}"
      </div>
      <button 
        className="close-overlay-btn"
        onClick={() => {
          handleStopReading();
          setShowReadingOverlay(false);
        }}
      >
        ×
      </button>
    </div>
  </div>
)}
{lightboxImage && (
  <div className="image-lightbox-overlay" onClick={() => setLightboxImage(null)}>
    <button className="lightbox-close-btn" onClick={() => setLightboxImage(null)}>×</button>
    <img src={lightboxImage} alt="Enlarged view" className="lightbox-image" />
  </div>
)}
    </section>
  );
};

export default BlogPost;