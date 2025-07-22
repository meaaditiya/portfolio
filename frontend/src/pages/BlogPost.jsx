import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown, FaShare, FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaCopy, FaTelegramPlane, FaPinterest } from 'react-icons/fa';
import axios from 'axios';
import './blogPost.css';
import Dots from './DotsLoader';

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

  //summary State
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Fetch blog post details
  useEffect(() => {
    const fetchBlogDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/blogs/${slug}`);
        const data = await response.json();
        
        setBlogPost(data);
        
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
        
        // Also fetch reactions if blog post is found
        if (data._id) {
          fetchReactions(data._id);
          
          // Pass the parsed user info to fetchCommentsWithReactions
          await fetchCommentsWithReactions(data._id, 1, parsedInfo);
          
          // Check if user has already reacted to the blog post
          if (parsedInfo && parsedInfo.email) {
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
    
    // Optimistic update - update UI immediately
    const previousReaction = userReaction;
    const previousReactions = { ...reactions };
    
    // Update reaction counts optimistically
    let newReactions = { ...reactions };
    
    if (previousReaction === type) {
      // User is removing their reaction
      newReactions[type] = Math.max(0, newReactions[type] - 1);
      setUserReaction(null);
    } else {
      // User is adding a new reaction or changing reaction
      if (previousReaction) {
        // Remove old reaction
        newReactions[previousReaction] = Math.max(0, newReactions[previousReaction] - 1);
      }
      // Add new reaction
      newReactions[type] = newReactions[type] + 1;
      setUserReaction(type);
    }
    
    setReactions(newReactions);
    
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
      
      // Update with actual server response
      if (response.data.reactionRemoved) {
        setUserReaction(null);
      } else {
        setUserReaction(type);
      }
      
      // Refresh reaction counts from server to ensure accuracy
      fetchReactions(blogPost._id);
      
      // Close modal if open
      setShowReactionModal(false);
    } catch (err) {
      // Revert optimistic update on error
      setReactions(previousReactions);
      setUserReaction(previousReaction);
      
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
      const userInfo = {
        name: commentForm.name,
        email: commentForm.email
      };
      localStorage.setItem('blogUserInfo', JSON.stringify(userInfo));
      setStoredUserInfo(userInfo); // Update stored user info state
      
      // Reset form and show success message
      setCommentForm(prev => ({
        ...prev,
        content: ''
      }));
      setCommentSuccess('Comment submitted successfully! It will appear after review.');
      
      // Refresh comments with updated user info
      fetchCommentsWithReactions(blogPost._id, 1, userInfo);
      
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

  // Add this function to handle comment deletion
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    setDeleteCommentLoading(commentToDelete.id);
    
    try {
      await axios.delete(
        `https://connectwithaaditiyamg.onrender.com/api/comments/${commentToDelete.id}/user`,
        { 
          data: { email: commentToDelete.email },
          headers: { 'Content-Type': 'application/json' }
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
            ));
          
          // Also refresh the parent comment to get accurate reply count from server
          fetchReplies(parentCommentId);
        }
      } else {
        // This is a main comment, refresh the main comments list
        if (blogPost && blogPost._id) {
          fetchCommentsWithReactions(blogPost._id, commentPagination.page);
        }
      }
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setDeleteCommentLoading(null);
    }
  };

  const loadRepliesReactions = (replies) => {
    if (replies && replies.length > 0) {
      replies.forEach(reply => {
        fetchCommentReactions(reply._id);
        
        // Check user reactions if user info exists
        // Get fresh user info from localStorage in case it was just set
        const currentStoredInfo = localStorage.getItem('blogUserInfo');
        if (currentStoredInfo) {
          const parsedInfo = JSON.parse(currentStoredInfo);
          if (parsedInfo && parsedInfo.email) {
            checkUserCommentReaction(reply._id, parsedInfo.email);
          }
        }
      });
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
  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    setReplyError(null);
    setReplySuccess(null);
    setReplyLoading(commentId);
    
    if (replyForm.name.trim() === '' || 
        replyForm.email.trim() === '' || 
        replyForm.content.trim() === '') {
      setReplyError('All fields are required');
      setReplyLoading(null);
      return;
    }
    
    try {
      await axios.post(
        `https://connectwithaaditiyamg.onrender.com/api/comments/${commentId}/replies`,
        replyForm
      );
      
      // Store user info for future use
      const userInfo = {
        name: replyForm.name,
        email: replyForm.email
      };
      localStorage.setItem('blogUserInfo', JSON.stringify(userInfo));
      setStoredUserInfo(userInfo); // Update stored user info state
      
      // Reset form and show success message
      setReplyForm(prev => ({
        ...prev,
        content: ''
      }));
      setReplySuccess('Reply submitted successfully!');
      
      // Refresh replies for this comment
      fetchReplies(commentId);
      
      // Also refresh main comments to update reply count
      if (blogPost && blogPost._id) {
        fetchCommentsWithReactions(blogPost._id, commentPagination.page, userInfo);
      }
      
      // Hide reply form after success
      setTimeout(() => {
        setShowReplyForm(prev => ({ ...prev, [commentId]: false }));
        setReplySuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error submitting reply:', err);
      setReplyError(err.response?.data?.message || 'Failed to submit reply');
    } finally {
      setReplyLoading(null);
    }
  };

  // Toggle replies visibility
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
      loadRepliesReactions(response.data.replies);
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
    // If user info is already stored, submit reaction directly
    if (storedUserInfo && storedUserInfo.email && storedUserInfo.name) {
      submitCommentReaction(commentId, type, storedUserInfo);
    } else {
      // Otherwise show modal to collect user info
      setReactionType(type);
      setCommentReactionTarget(commentId); // You'll need to add this state
      setShowReactionModal(true);
    }
  };

  // Add this new function to handle the actual comment reaction submission:
  const submitCommentReaction = async (commentId, type, userInfo) => {
    setCommentReactionLoading(commentId);
    
    // Optimistic update - update UI immediately
    const previousReaction = userCommentReactions[commentId];
    const previousReactions = { ...commentReactions[commentId] } || { likes: 0, dislikes: 0 };
    
    // Update comment reaction counts optimistically
    let newReactions = { ...previousReactions };
    
    if (previousReaction === type) {
      // User is removing their reaction
      newReactions[type] = Math.max(0, newReactions[type] - 1);
      setUserCommentReactions(prev => ({
        ...prev,
        [commentId]: null
      }));
    } else {
      // User is adding a new reaction or changing reaction
      if (previousReaction) {
        // Remove old reaction
        newReactions[previousReaction] = Math.max(0, newReactions[previousReaction] - 1);
      }
      // Add new reaction
      newReactions[type] = newReactions[type] + 1;
      setUserCommentReactions(prev => ({
        ...prev,
        [commentId]: type
      }));
    }
    
    setCommentReactions(prev => ({
      ...prev,
      [commentId]: newReactions
    }));
    
    try {
      const response = await axios.post(
        `https://connectwithaaditiyamg.onrender.com/api/comments/${commentId}/reactions`,
        {
          name: userInfo.name,
          email: userInfo.email,
          type
        }
      );
      
      // Store user info for future use
      localStorage.setItem('blogUserInfo', JSON.stringify(userInfo));
      setStoredUserInfo(userInfo);
      
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
      
      // Refresh comment reaction counts from server to ensure accuracy
      fetchCommentReactions(commentId);
      
      // Close modal if open
      setShowReactionModal(false);
    } catch (err) {
      // Revert optimistic update on error
      setCommentReactions(prev => ({
        ...prev,
        [commentId]: previousReactions
      }));
      setUserCommentReactions(prev => ({
        ...prev,
        [commentId]: previousReaction
      }));
      
      console.error('Error submitting comment reaction:', err);
      alert(err.response?.data?.message || 'Failed to submit reaction');
    } finally {
      setCommentReactionLoading(null);
    }
  };

  // Update your existing fetchComments function to also fetch reactions
  const fetchCommentsWithReactions = async (blogId, page = 1, userInfo = null) => {
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
      
      // Use the passed userInfo or fall back to storedUserInfo
      const currentUserInfo = userInfo || storedUserInfo;
      
      // Fetch reactions for each comment
      if (response.data.comments.length > 0) {
        response.data.comments.forEach(comment => {
          fetchCommentReactions(comment._id);
          
          // Check user reactions if user info exists
          if (currentUserInfo && currentUserInfo.email) {
            checkUserCommentReaction(comment._id, currentUserInfo.email);
          }
        });
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
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
                  className={`blog-image blog-image-${part.media.position || 'center'}`}
                >
                  <img 
                    src={part.media.url} 
                    alt={part.media.alt || ''} 
                    loading="lazy" 
                  />
                  {part.media.caption && (
                    <p className="image-caption">{part.media.caption}</p>
                  )}
                </div>
              );
            } else if (part.type === 'video') {
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
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };
const showDeleteConfirmation = (commentId, email) => {
    setCommentToDelete({ id: commentId, email });
    setShowDeleteModal(true);
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
          <div><Dots/></div>
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
              {formatBlogDate(blogPost.publishedAt)}
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
          <div>
            <button
  className="generate-summary-btn summarybtn"
  onClick={(e) => handleGenerateSummary(blogPost, e)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.8"
    stroke="url(#starGradient)"
    style={{ width: '18px', height: '18px', verticalAlign: 'middle', marginRight: '8px' }}
  >
    <defs>
      <linearGradient id="starGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00C4CC" />
        <stop offset="100%" stopColor="#0072FF" />
      </linearGradient>
    </defs>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2.5l2.12 6.51h6.86l-5.55 4.03 2.12 6.51L12 15.52l-5.55 4.03 2.12-6.51L3 9.01h6.86L12 2.5z"
    />
  </svg>
  Generate Summary
</button>
          </div>
          
          {/* Render content with inline images and videos */}
          {renderContentWithMedia(blogPost.content)}
          
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
              onClick={handleShareClick}
            >
              <FaShare />
              Share
            </button></div>
           
          
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
                  {comments
                    .sort((a, b) => {
                      // Author comments first, then by creation date (newest first)
                      if (a.isAuthorComment && !b.isAuthorComment) return -1;
                      if (!a.isAuthorComment && b.isAuthorComment) return 1;
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    })
                    .map(comment => (
                      <div className={`comment-card ${comment.isAuthorComment ? 'author-comment' : ''}`} key={comment._id}>
                        <div className="comment-header">
                          <div className="comment-author-info">
                            <strong className="comment-author">
                              {comment.user.name}
                              {comment.isAuthorComment && <span className="author-badge">Author</span>}
                            </strong>
                            <span className="comment-date">{formatDate(comment.createdAt)}</span>
                          </div>
                          
                          {/* Show delete button only for non-author comments and if user email matches */}
                          {!comment.isAuthorComment && storedUserInfo && storedUserInfo.email === comment.user.email && (
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
                              disabled={commentReactionLoading === comment._id}
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
                        
                        {/* Reply Form */}
                        {showReplyForm[comment._id] && (
                          <form className="reply-form" onSubmit={(e) => handleReplySubmit(e, comment._id)}>
                            {replyError && <div className="error-message">{replyError}</div>}
                            {replySuccess && <div className="success-message">{replySuccess}</div>}
                            
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
                                    <div 
                                      className={`reply-card ${reply.isAuthorComment ? 'author-reply' : ''}`} 
                                      key={reply._id}
                                    >
                                      <div className="reply-header">
                                        <div className="reply-author-info">
                                          <strong className="reply-author">
                                            {reply.user.name}
                                            {reply.isAuthorComment && <span className="author-badge1">Author</span>}
                                          </strong>
                                          <span className="reply-date">{formatDate(reply.createdAt)}</span>
                                        </div>
                                        
                                        {/* Delete button for user's own replies */}
                                        {!reply.isAuthorComment && storedUserInfo && storedUserInfo.email === reply.user.email && (
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
              <div className="spinner"></div>
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
      <div className="popup-footer">
        <button onClick={closeSummaryPopup} className="close-popup-btn">
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </section>
  );
};

export default BlogPost;