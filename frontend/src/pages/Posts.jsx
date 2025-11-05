import React, { useState, useEffect, useRef } from 'react';
import { Heart, ArrowLeft, MessageCircle, X, Send, Trash2, User, ChevronLeft, ChevronRight, Globe, Twitter, Facebook, Linkedin, Share2, Copy, Check, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../pagesCSS/Posts.css';


import Community from './Community.jsx';
import SkeletonLoader from './PostSkeleton.jsx';
import Error from './Error.jsx';

const Posts = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedSocialEmbed, setSelectedSocialEmbed] = useState(null);

  // Video states
  const [videoStates, setVideoStates] = useState({});
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const videoRefs = useRef({});
  const modalVideoRef = useRef(null);

  // Reply states
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replies, setReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [commentReactions, setCommentReactions] = useState({});
  const [deleteModal, setDeleteModal] = useState({ show: false, commentId: null, isReply: false, deleting: false });
const [showFullCaption, setShowFullCaption] = useState(false);

  const activeTab = location.pathname.includes('/social') ? 'social' : 
                    location.pathname.includes('/community') ? 'community' : 'posts';

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: Globe },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin }
  ];

  useEffect(() => {
    if (postId && activeTab === 'posts') {
      fetchSinglePost(postId);
    }
  }, [postId, activeTab]);

  useEffect(() => {
    if (activeTab === 'posts' && !postId) {
      fetchPosts();
    }
  }, [currentPage, activeTab, postId]);

  useEffect(() => {
    if (activeTab === 'social') {
      fetchSocialEmbeds();
    }
  }, [activeTab, selectedPlatform, socialCurrentPage]);

  // Remaining social embed loading code stays the same
  useEffect(() => {
    const loadEmbedScript = (src, id) => {
      if (document.getElementById(id)) return;
      
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    };

    loadEmbedScript('https://platform.twitter.com/widgets.js', 'twitter-embed');
    loadEmbedScript('https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0', 'facebook-jssdk');
    loadEmbedScript('https://platform.linkedin.com/in.js', 'linkedin-embed');
    
    const checkLinkedIn = () => {
      if (window.IN && window.IN.parse) {
        window.IN.parse();
      } else {
        setTimeout(checkLinkedIn, 100);
      }
    };
    
    setTimeout(checkLinkedIn, 1000);
  }, []);

  useEffect(() => {
    if (activeTab === 'social' && socialEmbeds.length > 0) {
      setTimeout(() => {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
        if (window.FB && window.FB.XFBML) {
          window.FB.XFBML.parse();
        }
        if (window.IN && window.IN.parse) {
          window.IN.parse();
        }
      }, 100);
    }
  }, [socialEmbeds, activeTab]);

  const fetchSinglePost = async (id) => {
    try {
      setPostLoading(true);
      const detailResponse = await fetch(`https://connectwithaaditiyamg.onrender.com/api/image-posts/${id}`);
      
      if (!detailResponse.ok) {
        throw new Error('Post not found');
      }
      
      const detailData = await detailResponse.json();
      
      const reactionResponse = await fetch(
        `https://connectwithaaditiyamg.onrender.com/api/image-posts/${id}/has-reacted?email=${encodeURIComponent(userInfo.email)}`
      );
      const reactionData = await reactionResponse.json();
      
      const post = {
        ...detailData.post,
        comments: detailData.comments,
        hasReacted: reactionData.hasReacted,
      };
      
      setSelectedPost(post);
      
      if (post.comments) {
        await fetchCommentReactions(post.comments);
      }
      
      // Initialize video state for modal
      if (post.mediaType === 'video') {
        setVideoStates(prev => ({
          ...prev,
          [post.id]: { playing: false, muted: false, currentTime: 0, duration: 0 }
        }));
        
        // Auto-play video when modal opens
        setTimeout(() => {
          if (modalVideoRef.current) {
            modalVideoRef.current.play().catch(err => {
              console.log('Auto-play prevented:', err);
            });
            setVideoStates(prev => ({
              ...prev,
              [post.id]: { ...prev[post.id], playing: true }
            }));
          }
        }, 100);
      }
      
      document.body.style.overflow = 'hidden';
      setPostLoading(false);
    } catch (err) {
      setError('Failed to fetch post. Please try again later.');
      setPostLoading(false);
      console.error('Error fetching post:', err);
      navigate('/posts');
    }
  };

  const fetchCommentReactions = async (comments) => {
    const reactions = {};
    for (const comment of comments) {
      try {
        const response = await fetch(
          `https://connectwithaaditiyamg.onrender.com/api/image-posts/comments/${comment._id}/user-reaction?email=${encodeURIComponent(userInfo.email)}`
        );
        const data = await response.json();
        reactions[comment._id] = data;
      } catch (err) {
        console.error('Error fetching comment reaction:', err);
      }
    }
    setCommentReactions(reactions);
  };

  const fetchReplies = async (commentId) => {
    if (replies[commentId]) {
      return;
    }
    
    try {
      setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
      const response = await fetch(
        `https://connectwithaaditiyamg.onrender.com/api/image-posts/comments/${commentId}/replies`
      );
      const data = await response.json();
      
      setReplies(prev => ({ ...prev, [commentId]: data.replies }));
      await fetchCommentReactions(data.replies);
      
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    } catch (err) {
      console.error('Error fetching replies:', err);
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const toggleReplies = async (commentId) => {
    if (!expandedReplies[commentId]) {
      await fetchReplies(commentId);
    }
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

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
      
      // Initialize video states
      postsWithDetails.forEach(post => {
        if (post.mediaType === 'video') {
          setVideoStates(prev => ({
            ...prev,
            [post.id]: { playing: false, muted: true, currentTime: 0, duration: 0 }
          }));
        }
      });
      
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
// Video control functions - REPLACE EXISTING ONES
const toggleVideoPlayPause = (postId, e) => {
  if (e) e.stopPropagation();
  
  // Check if we're in modal view or grid view
  const video = selectedPost?.id === postId ? modalVideoRef.current : videoRefs.current[postId];
  if (!video) return;
  
  if (video.paused) {
    video.play().catch(err => console.log('Play error:', err));
    setVideoStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], playing: true }
    }));
  } else {
    video.pause();
    setVideoStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], playing: false }
    }));
  }
};

const toggleVideoMute = (postId, e) => {
  if (e) e.stopPropagation();
  
  // Check if we're in modal view or grid view
  const video = selectedPost?.id === postId ? modalVideoRef.current : videoRefs.current[postId];
  if (!video) return;
  
  video.muted = !video.muted;
  setVideoStates(prev => ({
    ...prev,
    [postId]: { ...prev[postId], muted: video.muted }
  }));
};

const handleVideoTimeUpdate = (postId) => {
  // Check if we're in modal view or grid view
  const video = selectedPost?.id === postId ? modalVideoRef.current : videoRefs.current[postId];
  if (!video) return;
  
  setVideoStates(prev => ({
    ...prev,
    [postId]: { 
      ...prev[postId], 
      currentTime: video.currentTime,
      duration: video.duration 
    }
  }));
};

const handleVideoEnded = (postId) => {
  setVideoStates(prev => ({
    ...prev,
    [postId]: { ...prev[postId], playing: false }
  }));
};
const handleVideoSeek = (postId, e) => {
  e.stopPropagation();
  const video = selectedPost?.id === postId ? modalVideoRef.current : videoRefs.current[postId];
  if (!video) return;
  
  const progressBar = e.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percentage = clickX / rect.width;
  const newTime = percentage * video.duration;
  
  video.currentTime = newTime;
  setVideoStates(prev => ({
    ...prev,
    [postId]: { ...prev[postId], currentTime: newTime }
  }));
};

  const formatVideoDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Remaining social embed functions stay the same
  const extractPostId = (url, platform) => {
    try {
      switch (platform) {
        case 'twitter':
          const twitterMatch = url.match(/twitter\.com\/[^/]+\/status\/(\d+)/i) || 
                              url.match(/x\.com\/[^/]+\/status\/(\d+)/i);
          return twitterMatch ? twitterMatch[1] : null;
        
        case 'facebook':
          return url;
        
        case 'linkedin':
          return url;
        
        default:
          return null;
      }
    } catch (e) {
      console.error('Error extracting post ID:', e);
      return null;
    }
  };

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
      localStorage.setItem('userName', userInfo.name);
      localStorage.setItem('userEmail', userInfo.email);
      setShowUserForm(false);
    } else {
      alert('Please provide both name and email.');
    }
  };

  const handleUserFormClose = () => {
    setShowUserForm(false);
    navigate('/');
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentChange = (e) => {
    setCommentInput(e.target.value);
  };

  const handleReplyChange = (e) => {
    setReplyInput(e.target.value);
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
      
      await fetchCommentReactions(detailData.comments);
      
    } catch (err) {
      alert('Failed to post comment. Please try again.');
      console.error('Error posting comment:', err);
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyInput.trim() || !userInfo.name || !userInfo.email || !selectedPost) {
      alert('Please provide your name, email, and a reply.');
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
          content: replyInput,
          parentCommentId: parentCommentId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to post reply');
      
      setReplyInput('');
      setReplyingTo(null);
      
      setReplies(prev => ({ ...prev, [parentCommentId]: undefined }));
      await fetchReplies(parentCommentId);
      
      setSelectedPost(prev => ({
        ...prev,
        comments: prev.comments.map(c => 
          c._id === parentCommentId 
            ? { ...c, replyCount: (c.replyCount || 0) + 1 }
            : c
        )
      }));
      
    } catch (err) {
      alert('Failed to post reply. Please try again.');
      console.error('Error posting reply:', err);
    }
  };

  const handleCommentReaction = async (commentId, reactionType) => {
    if (!userInfo.email) {
      alert('Please provide your email to react to comments.');
      return;
    }
    
    try {
      const endpoint = reactionType === 'like' 
        ? `https://connectwithaaditiyamg.onrender.com/api/image-posts/comments/${commentId}/like`
        : `https://connectwithaaditiyamg.onrender.com/api/image-posts/comments/${commentId}/dislike`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to react to comment');
      const data = await response.json();
      
      setCommentReactions(prev => ({
        ...prev,
        [commentId]: {
          userLiked: data.userLiked,
          userDisliked: data.userDisliked,
          likeCount: data.likeCount,
          dislikeCount: data.dislikeCount,
        }
      }));
      
    } catch (err) {
      alert('Failed to react to comment. Please try again.');
      console.error('Error reacting to comment:', err);
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

  const handleDeleteComment = async (commentId, isReply = false) => {
    if (!userInfo.email) {
      alert('Please provide your email to delete your comment.');
      return;
    }
    
    setDeleteModal({ show: true, commentId, isReply });
  };

  const confirmDeleteComment = async () => {
    const { commentId, isReply } = deleteModal;
    
    setDeleteModal(prev => ({ ...prev, deleting: true }));
    
    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/image-posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userInfo.email }),
      });
      
      if (!response.ok) throw new Error('Failed to delete comment');
      
      setDeleteModal({ show: false, commentId: null, isReply: false, deleting: false });
      
      if (isReply) {
        const parentCommentId = selectedPost.comments.find(c => 
          replies[c._id]?.some(r => r._id === commentId)
        )?._id;
        
        if (parentCommentId) {
          setReplies(prev => ({ ...prev, [parentCommentId]: undefined }));
          await fetchReplies(parentCommentId);
          
          setSelectedPost(prev => ({
            ...prev,
            comments: prev.comments.map(c => 
              c._id === parentCommentId 
                ? { ...c, replyCount: Math.max(0, (c.replyCount || 0) - 1) }
                : c
            )
          }));
        }
      } else {
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
        
        setReplies({});
        setExpandedReplies({});
        
        await fetchCommentReactions(detailData.comments);
      }
      
    } catch (err) {
      alert('Failed to delete comment. You can only delete your own comments.');
      console.error('Error deleting comment:', err);
      setDeleteModal({ show: false, commentId: null, isReply: false, deleting: false });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const openPostModal = (post) => {
    navigate(`/posts/${post.id}`);
  };
  const navigateToNextPost = () => {
  const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
  if (currentIndex < posts.length - 1) {
    const nextPost = posts[currentIndex + 1];
    navigate(`/posts/${nextPost.id}`);
  }
};

const navigateToPreviousPost = () => {
  const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
  if (currentIndex > 0) {
    const prevPost = posts[currentIndex - 1];
    navigate(`/posts/${prevPost.id}`);
  }
};

  const openCommentsModal = (e) => {
    e.stopPropagation();
    setShowComments(true);
  };

  const openSocialEmbedModal = (embed) => {
    setSelectedSocialEmbed(embed);
    document.body.style.overflow = 'hidden';
    
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
    // Pause any playing videos
    Object.keys(videoRefs.current).forEach(postId => {
      const video = videoRefs.current[postId];
      if (video && !video.paused) {
        video.pause();
      }
    });
    
    setSelectedPost(null);
    setSelectedSocialEmbed(null);
    setShowComments(false);
    setShowShareModal(false);
    setCopySuccess(false);
    setReplyingTo(null);
    setReplyInput('');
    setExpandedReplies({});
    document.body.style.overflow = '';
    
    if (postId) {
      navigate('/posts');
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'posts') {
      navigate('/posts');
    } else if (tab === 'social') {
      navigate('/social');
    } else if (tab === 'community') {
      navigate('/community');
    }
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    setSocialCurrentPage(1);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
    setShowComments(false);
  };

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/posts/${selectedPost.id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const textArea = document.createElement('textarea');
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSocialShare = (platform) => {
    const postUrl = `${window.location.origin}/posts/${selectedPost.id}`;
    const text = selectedPost.caption || 'Check out this post!';
    
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModals();
    } else if (selectedPost && e.key === 'ArrowRight') {
      navigateToNextPost();
    } else if (selectedPost && e.key === 'ArrowLeft') {
      navigateToPreviousPost();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [postId, selectedPost, posts]);

  const renderComment = (comment, isReply = false) => {
    const reaction = commentReactions[comment._id] || {};
    
    return (
      <div key={comment._id} className={`pst-comment ${isReply ? 'pst-comment-reply' : ''}`}>
        <div className="pst-comment-icon">
          <User className="pst-icon-sm" />
        </div>
        <div className="pst-comment-content">
          <div className="pst-comment-header">
            <span className="pst-comment-name">{comment.user.name}</span>
            {comment.isAuthorComment && (
              <span className="pst-author-badge">Author</span>
            )}
            <span className="pst-comment-date">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="pst-comment-text">{comment.content}</p>
          
          <div className="pst-comment-actions">
            <button
              className={`pst-comment-reaction-btn ${reaction.userLiked ? 'pst-reaction-active' : ''}`}
              onClick={() => handleCommentReaction(comment._id, 'like')}
            >
              <ThumbsUp className="pst-icon-xs" />
              <span>{reaction.likeCount || 0}</span>
            </button>
            
            <button
              className={`pst-comment-reaction-btn ${reaction.userDisliked ? 'pst-reaction-active' : ''}`}
              onClick={() => handleCommentReaction(comment._id, 'dislike')}
            >
              <ThumbsDown className="pst-icon-xs" />
              <span>{reaction.dislikeCount || 0}</span>
            </button>
            
            {!isReply && (
              <button
                className="pst-comment-reply-btn"
                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              >
                <MessageCircle className="pst-icon-xs" />
                <span>Reply</span>
              </button>
            )}
            
            {comment.user.email === userInfo.email && (
              <button
                className="pst-delete-comment"
                onClick={() => handleDeleteComment(comment._id, isReply)}
              >
                <Trash2 className="pst-icon-xs" />
                <span>Delete</span>
              </button>
            )}
          </div>
          
          {replyingTo === comment._id && (
            <div className="pst-reply-form">
              <textarea
                placeholder={`Reply to ${comment.user.name}...`}
                value={replyInput}
                onChange={handleReplyChange}
                className="pst-textarea pst-reply-textarea"
                rows="2"
              />
              <div className="pst-reply-form-actions">
                <button
                  className="pst-cancel-reply-btn"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyInput('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="pst-submit-reply-btn"
                  onClick={() => handleReplySubmit(comment._id)}
                  disabled={!replyInput.trim()}
                >
                  <Send className="pst-icon-xs" />
                  Reply
                </button>
              </div>
            </div>
          )}
          
          {!isReply && comment.replyCount > 0 && (
            <button
              className="pst-show-replies-btn"
              onClick={() => toggleReplies(comment._id)}
            >
              {expandedReplies[comment._id] ? (
                <>
                  <ChevronUp className="pst-icon-xs" />
                  <span>Hide {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="pst-icon-xs" />
                  <span>Show {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}</span>
                </>
              )}
            </button>
          )}
          
          {expandedReplies[comment._id] && (
            <div className="pst-replies-container">
              {loadingReplies[comment._id] ? (
                <div className="pst-replies-loading">Loading replies...</div>
              ) : replies[comment._id]?.length > 0 ? (
                replies[comment._id].map(reply => renderComment(reply, true))
              ) : (
                <div className="pst-no-replies">No replies yet</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPostsContent = () => {
    if (loading && posts.length === 0) {
      return (
        <div className="pst-container">
          <div className="pst-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonLoader key={index} type="post" />
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="pst-container">
          <div className="pst-error">
            <div className="pst-error-icon">⚠️</div>
            <p className="pst-error-text">{error}</p>
            <button 
              onClick={fetchPosts}
              className="pst-retry-button"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="pst-container">
          <div className="pst-empty">
            <div className="pst-empty-icon">📷</div>
            <p className="pst-empty-text">No posts yet.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="pst-container">
        <div className="pst-grid">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="pst-post"
              onClick={() => openPostModal(post)}
              onMouseEnter={() => setHoveredVideo(post.id)}
              onMouseLeave={() => setHoveredVideo(null)}
            >
              <div className="pst-post-card">
                <div className="pst-post-image">
 {post.mediaType === 'video' ? (
  <div className="pst-video-container">
    <video
      ref={el => videoRefs.current[post.id] = el}
      src={post.media}
      poster={post.thumbnail || ''}  // 👈 show thumbnail if available
      className="pst-video"
      loop
      muted
      playsInline
      onLoadedMetadata={(e) => {
        setVideoStates(prev => ({
          ...prev,
          [post.id]: { 
            ...prev[post.id], 
            duration: e.target.duration 
          }
        }));
      }}
      onPlay={() => {
        setVideoStates(prev => ({
          ...prev,
          [post.id]: { ...prev[post.id], playing: true }
        }));
      }}
      onPause={() => {
        setVideoStates(prev => ({
          ...prev,
          [post.id]: { ...prev[post.id], playing: false }
        }));
      }}
      onTimeUpdate={() => handleVideoTimeUpdate(post.id)}
      onEnded={() => handleVideoEnded(post.id)}
    />

    {hoveredVideo === post.id && (
      <div className="pst-video-overlay-controls">
        <button
          className="pst-video-play-btn"
          onClick={(e) => toggleVideoPlayPause(post.id, e)}
        >
          {videoStates[post.id]?.playing ? (
            <Pause className="pst-icon-md" />
          ) : (
            <Play className="pst-icon-md" />
          )}
        </button>
      </div>
    )}

    <div className="pst-video-duration-badge">
      video post : {formatVideoDuration(post.videoDuration)}
    </div>
  </div>
) : (
 


                    <>
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
                          src={post.media} 
                          alt={post.caption || 'Post image'} 
                          className="pst-image"
                          onLoad={() => handleImageLoad(post.id)}
                          onError={() => handleImageError(post.id)}
                        />
                      )}
                    </>
                  )}
                  <div className="pst-post-overlay">
                    <div className="pst-post-stats">
                      {post.mediaType === 'video' && (
    <div className="pst-video-duration-badge">
      video post : {formatVideoDuration(post.videoDuration)}
    </div>
)}
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
      </div>
    );
  };

  const renderSocialContent = () => {
    // Social content rendering remains the same as original
    if (socialLoading) {
      return (
        <div className="pst-container">
          <div className="pst-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonLoader key={index} type="social" />
            ))}
          </div>
        </div>
      );
    }

    if (socialEmbeds.length === 0) {
      return (
        <div className="pst-container">
          <div className="pst-empty">
            <div className="pst-empty-icon">🌐</div>
            <p className="pst-empty-text">No social media posts available.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="pst-container">
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
                    <p className="pst-modal-date1">
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
      </div>
    );
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="pst-main">
      {showUserForm && (
        <div className="pst-user-modal">
          <div className="pst-user-form">
            <button 
              className="pst-close-button pst-user-close-button"
              onClick={handleUserFormClose}
              style={{ position: 'absolute', top: '1rem', right: '1rem' }}
            >
              <X className="pst-icon" />
            </button>
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
          <button
            className={`pst-tab-button ${activeTab === 'community' ? 'pst-tab-active' : ''}`}
            onClick={() => handleTabChange('community')}
          >
            <User className="pst-icon-sm" />
            <span>Community</span>
          </button>
        </div>
      </div>

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

      {activeTab === 'posts' && renderPostsContent()}
      {activeTab === 'social' && renderSocialContent()}
      {activeTab === 'community' && <Community />}

      {postLoading && (
        <div className="pst-post-modal">
          <div className="pst-loading-container">
            <div className="pst-loading-spinner"></div>
            <p className="pst-loading-text">Loading post...</p>
          </div>
        </div>
      )}

      {selectedPost && !postLoading && (
        <div className="pst-post-modal" onClick={closeModals}>
          <div className="pst-post-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="pst-close-button"
              onClick={closeModals}
            >
              <X className="pst-icon" />
            </button>
              <p className="pst-close-button2">
  {selectedPost.caption.split(" ").length > 8 ? (
    <>
      {showFullCaption
        ? selectedPost.caption
        : selectedPost.caption.split(" ").slice(0, 8).join(" ") + "... "}
      <span
        style={{
          color: "#0095f6",
          cursor: "pointer",
          fontWeight: "500",
          display: "inline",   // ensures it stays in the same line
        }}
        onClick={() => setShowFullCaption(!showFullCaption)}
      >
        {showFullCaption ? "See less" : "See more"}
      </span>
    </>
  ) : (
    selectedPost.caption
  )}
</p>

                
              
            <div className="pst-modal-image">
{selectedPost.mediaType === 'video' ? (
  <div className="pst-modal-video-container">
    <video
      ref={modalVideoRef}
      src={selectedPost.media}
      className="pst-modal-video"
      loop
      playsInline
      onLoadedMetadata={(e) => {
        setVideoStates(prev => ({
          ...prev,
          [selectedPost.id]: { 
            ...prev[selectedPost.id], 
            duration: e.target.duration 
          }
        }));
      }}
      onPlay={() => {
        setVideoStates(prev => ({
          ...prev,
          [selectedPost.id]: { ...prev[selectedPost.id], playing: true }
        }));
      }}
      onPause={() => {
        setVideoStates(prev => ({
          ...prev,
          [selectedPost.id]: { ...prev[selectedPost.id], playing: false }
        }));
      }}
      onTimeUpdate={() => handleVideoTimeUpdate(selectedPost.id)}
      onEnded={() => handleVideoEnded(selectedPost.id)}
      onClick={(e) => {
        e.stopPropagation();
        toggleVideoPlayPause(selectedPost.id);
      }}
    />
    <div className="pst-modal-video-controls">
      <button
        className="pst-modal-video-play-btn"
        onClick={(e) => toggleVideoPlayPause(selectedPost.id, e)}
      >
        {videoStates[selectedPost.id]?.playing ? (
          <Pause className="pst-icon-md" />
        ) : (
          <Play className="pst-icon-md" />
        )}
      </button>
      
   <div className="pst-modal-video-progress" onClick={(e) => handleVideoSeek(selectedPost.id, e)}>
  <div 
    className="pst-modal-video-progress-bar"
    style={{ 
      width: `${((videoStates[selectedPost.id]?.currentTime || 0) / (videoStates[selectedPost.id]?.duration || 1)) * 100}%` 
    }}
  />
</div>
      
      <div className="pst-modal-video-time">
        {formatVideoDuration(videoStates[selectedPost.id]?.currentTime || 0)} / {formatVideoDuration(videoStates[selectedPost.id]?.duration || 0)}
      </div>
      
      <button
        className="pst-modal-video-mute-btn"
        onClick={(e) => toggleVideoMute(selectedPost.id, e)}
      >
        {videoStates[selectedPost.id]?.muted ? (
          <VolumeX className="pst-icon-sm" />
        ) : (
          <Volume2 className="pst-icon-sm" />
        )}
      </button>
    </div>
  </div>
              ) : imageLoadStates[selectedPost.id] === 'error' ? (
                <div className="pst-modal-image-error">
                  <div className="pst-modal-image-error-icon">🖼️</div>
                  <p className="pst-modal-image-error-text">Image unavailable</p>
                </div>
              ) : (
                <img
                  src={selectedPost.media}
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
                  <p className="pst-modal-date specific-date">
                    {formatDate(selectedPost.createdAt)}
                  </p>
                </div>
               <div className="pst-modal-actions">
  <button className={`pst-like-button ${selectedPost.hasReacted ? 'pst-liked' : ''}`}
    onClick={(e) => handleReaction(selectedPost.id, e)}>
    <Heart className={`pst-icon-sm ${selectedPost.hasReacted ? 'pst-icon-filled' : ''}`} />
    <span className="pst-stat-count">{selectedPost.reactionCount || 0}</span>
  </button>
  <button className="pst-comment-button" onClick={openCommentsModal}>
    <MessageCircle className="pst-icon-sm" />
    <span className="pst-stat-count">{selectedPost.commentCount || 0}</span>
  </button>
  <button className="pst-share-button" onClick={handleShareClick}>
    <Share2 className="pst-icon-sm" />
    <span className="pst-stat-count">Share</span>
  </button>
  
  {/* ADD THIS DIV HERE: */}
  <div className="pst-nav-buttons">
    <button
      className="pst-nav-button pst-nav-prev"
      onClick={(e) => {
        e.stopPropagation();
        navigateToPreviousPost();
      }}
      disabled={posts.findIndex(p => p.id === selectedPost.id) === 0}
    >
      <ChevronLeft className="pst-icon-sm" />
    </button>
    <button
      className="pst-nav-button pst-nav-next"
      onClick={(e) => {
        e.stopPropagation();
        navigateToNextPost();
      }}
      disabled={posts.findIndex(p => p.id === selectedPost.id) === posts.length - 1}
    >
      <ChevronRight className="pst-icon-sm" />
    </button>
  </div>
</div>
              </div>
              {showShareModal && (
                <div className="pst-share-panel">
                  <div className="pst-share-header">
                    <h3 className="pst-share-title">Share this post</h3>
                    <button 
                      className="pst-share-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShareModal(false);
                        setCopySuccess(false);
                      }}
                    >
                      <ArrowLeft className="pst-icon-sm" />
                    </button>
                  </div>
                  
                  <div className="pst-share-content">
                    <div className="pst-share-link-section">
                      <label className="pst-share-label">Post Link</label>
                      <div className="pst-share-link-container">
                        <input 
                          type="text" 
                          value={`${window.location.origin}/posts/${selectedPost.id}`}
                          readOnly
                          className="pst-share-link-input"
                        />
                        <button 
                          className="pst-copy-button"
                          onClick={handleCopyLink}
                        >
                          {copySuccess ? (
                            <>
                              <Check className="pst-icon-sm" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="pst-icon-sm" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pst-share-social-section">
                      <label className="pst-share-label">Share on Social Media</label>
                      <div className="pst-share-social-buttons">
                        <button 
                          className="pst-share-social-btn pst-share-twitter"
                          onClick={() => handleSocialShare('twitter')}
                        >
                          <Twitter className="pst-icon-sm" />
                          <span>Twitter</span>
                        </button>
                        <button 
                          className="pst-share-social-btn pst-share-facebook"
                          onClick={() => handleSocialShare('facebook')}
                        >
                          <Facebook className="pst-icon-sm" />
                          <span>Facebook</span>
                        </button>
                        <button 
                          className="pst-share-social-btn pst-share-linkedin"
                          onClick={() => handleSocialShare('linkedin')}
                        >
                          <Linkedin className="pst-icon-sm" />
                          <span>LinkedIn</span>
                        </button>
                        <button 
                          className="pst-share-social-btn pst-share-whatsapp"
                          onClick={() => handleSocialShare('whatsapp')}
                        >
                          <MessageCircle className="pst-icon-sm" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {showComments && (
                <div className="pst-share-panel">
                  <div className="pst-share-header">
                  <h3 className="pst-share-title">Comments</h3>
                  <button 
                    className="pst-share-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowComments(false);
                    }}
                  >
                    <ArrowLeft className="pst-icon-sm" />
                  </button>
                  </div>
                  
                  <div className="pst-comments-list">
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((comment) => renderComment(comment))
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

      {/* Social embed modal remains the same */}
      {selectedSocialEmbed && (
        <div className="pst-post-modal" onClick={closeModals}>
          <div className="pst-social-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="pst-close-button2"
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
              <p className="pst-modal-date1">{formatDate(selectedSocialEmbed.createdAt)}</p>
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
      
      {deleteModal.show && (
        <div className="pst-delete-modal" onClick={() => setDeleteModal({ show: false, commentId: null, isReply: false })}>
          <div className="pst-delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pst-delete-modal-header">
              <h3 className="pst-delete-modal-title">Delete Comment</h3>
              <button 
                className="pst-delete-modal-close"
                onClick={() => setDeleteModal({ show: false, commentId: null, isReply: false })}
              >
                <X className="pst-icon-sm" />
              </button>
            </div>
            <div className="pst-delete-modal-body">
              <p className="pst-delete-modal-text">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              {!deleteModal.isReply && (
                <p className="pst-delete-modal-warning">
                  All replies to this comment will also be deleted.
                </p>
              )}
            </div>
            <div className="pst-delete-modal-actions">
              <button 
                className="pst-delete-modal-cancel"
                onClick={() => setDeleteModal({ show: false, commentId: null, isReply: false })}
              >
                Cancel
              </button>
              <button 
                className="pst-delete-modal-confirm"
                onClick={confirmDeleteComment}
                disabled={deleteModal.deleting}
              >
                {deleteModal.deleting ? (
                  <>
                    <div className="pst-delete-spinner"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="pst-icon-xs" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;