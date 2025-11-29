import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pagesCSS/UserBlogSubmission.css';

const UserBlogSubmission = () => {
  const navigate = useNavigate();
  const API_URL = 'https://connectwithaaditiyamg2.onrender.com';

  const [blogFormData, setblogFormData] = useState({
    userName: '',
    userEmail: '',
    title: '',
    content: '',
    summary: '',
    tags: '',
    featuredImage: '',
    contentImages: [],
    contentVideos: []
  });

  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(false);
  const [generatedSubmissionId, setGeneratedSubmissionId] = useState('');
  const [statusCheckId, setStatusCheckId] = useState('');
  const [statusData, setStatusData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationError, setModerationError] = useState('');

  // Image modal state
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    url: '',
    alt: '',
    caption: '',
    position: 'center'
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Video modal state
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    url: '',
    title: '',
    caption: '',
    position: 'center',
    autoplay: false,
    muted: false
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Insert text at cursor position
  const insertTextAtCursor = (text) => {
    const textarea = document.getElementById('content');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = blogFormData.content.substring(0, start) + text + blogFormData.content.substring(end);
    
    setblogFormData(prev => ({
      ...prev,
      content: newContent
    }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Format text in editor
  const formatText = (e, formatting) => {
    e.preventDefault();
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = blogFormData.content.substring(start, end);
    let formattedText = '';
    
    switch(formatting) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'heading':
        formattedText = `# ${selectedText}`;
        break;
      case 'subheading':
        formattedText = `## ${selectedText}`;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          formattedText = `[${selectedText || 'link text'}](${url})`;
        } else {
          return;
        }
        break;
      case 'image':
        setImageModal(prev => ({ ...prev, isOpen: true }));
        return;
      case 'video':
        setVideoModal(prev => ({ ...prev, isOpen: true }));
        return;
      default:
        return;
    }
    
    const newContent = blogFormData.content.substring(0, start) + formattedText + blogFormData.content.substring(end);
    setblogFormData(prev => ({
      ...prev,
      content: newContent
    }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  // Handle image modal input changes
  const handleImageModalChange = (e) => {
    const { name, value } = e.target;
    setImageModal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle video modal input changes
  const handleVideoModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVideoModal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Extract video information from URL
  const extractVideoInfo = (url) => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return { platform: 'youtube', videoId: youtubeMatch[1], url: url };
    }
    
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return { platform: 'vimeo', videoId: vimeoMatch[1], url: url };
    }
    
    const dailymotionRegex = /(?:dailymotion\.com\/video\/)([a-zA-Z0-9]+)/;
    const dailymotionMatch = url.match(dailymotionRegex);
    
    if (dailymotionMatch) {
      return { platform: 'dailymotion', videoId: dailymotionMatch[1], url: url };
    }
    
    return null;
  };

  // Handle image addition
  const handleAddImage = async () => {
    if (!imageModal.url.trim()) {
      setError('Please enter an image URL');
      return;
    }
    
    try {
      new URL(imageModal.url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }
    
    try {
      setUploadingImage(true);
      setError('');
      
      const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const embedCode = `[IMAGE:${imageId}]`;
      
      const newImage = {
        url: imageModal.url,
        alt: imageModal.alt,
        caption: imageModal.caption,
        position: imageModal.position,
        imageId: imageId
      };
      
      insertTextAtCursor(embedCode);
      
      setblogFormData(prev => ({
        ...prev,
        contentImages: [...prev.contentImages, newImage]
      }));
      
      setImageModal({
        isOpen: false,
        url: '',
        alt: '',
        caption: '',
        position: 'center'
      });
      
    } catch (err) {
      console.error('Error adding image:', err);
      setError('Failed to add image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle video addition
  const handleAddVideo = async () => {
    if (!videoModal.url.trim()) {
      setError('Please enter a video URL');
      return;
    }
    
    try {
      new URL(videoModal.url);
      const videoInfo = extractVideoInfo(videoModal.url);
      if (!videoInfo) {
        setError('Invalid video URL. Currently supported: YouTube, Vimeo, Dailymotion');
        return;
      }
    } catch {
      setError('Please enter a valid URL');
      return;
    }
    
    try {
      setUploadingVideo(true);
      setError('');
      
      const embedId = 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const embedCode = `[VIDEO:${embedId}]`;
      
      const videoInfo = extractVideoInfo(videoModal.url);
      const newVideo = {
        url: videoModal.url,
        title: videoModal.title,
        caption: videoModal.caption,
        position: videoModal.position,
        autoplay: videoModal.autoplay,
        muted: videoModal.muted,
        embedId: embedId,
        videoId: videoInfo.videoId,
        platform: videoInfo.platform
      };
      
      insertTextAtCursor(embedCode);
      
      setblogFormData(prev => ({
        ...prev,
        contentVideos: [...prev.contentVideos, newVideo]
      }));
      
      setVideoModal({
        isOpen: false,
        url: '',
        title: '',
        caption: '',
        position: 'center',
        autoplay: false,
        muted: false
      });
      
    } catch (err) {
      console.error('Error adding video:', err);
      setError('Failed to add video. Please try again.');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Cleanup unused images
  const cleanupContentImages = (content, contentImages) => {
    if (!content || !Array.isArray(contentImages) || contentImages.length === 0) {
      return contentImages;
    }
    
    return contentImages.filter(image => {
      if (!image || !image.imageId) {
        return false;
      }
      
      const placeholder = `[IMAGE:${image.imageId}]`;
      return content.includes(placeholder);
    });
  };

  // Cleanup unused videos
  const cleanupContentVideos = (content, contentVideos) => {
    if (!content || !Array.isArray(contentVideos) || contentVideos.length === 0) {
      return contentVideos;
    }
    
    return contentVideos.filter(video => {
      if (!video || !video.embedId) {
        return false;
      }
      
      const placeholder = `[VIDEO:${video.embedId}]`;
      return content.includes(placeholder);
    });
  };

  // Generate image preview list
  const generateImagePreview = (contentImages, content) => {
    if (!Array.isArray(contentImages) || contentImages.length === 0) {
      return [];
    }
    
    return contentImages.filter(image => {
      if (!image || !image.imageId || !content) {
        return false;
      }
      
      const placeholder = `[IMAGE:${image.imageId}]`;
      return content.includes(placeholder);
    });
  };

  // Generate video preview list
  const generateVideoPreview = (contentVideos, content) => {
    if (!Array.isArray(contentVideos) || contentVideos.length === 0) {
      return [];
    }
    
    return contentVideos.filter(video => {
      if (!video || !video.embedId || !content) {
        return false;
      }
      
      const placeholder = `[VIDEO:${video.embedId}]`;
      return content.includes(placeholder);
    });
  };

  // Remove image from content
  const removeImageFromContent = (imageId) => {
    const placeholder = `[IMAGE:${imageId}]`;
    const newContent = blogFormData.content.replace(new RegExp(escapeRegExp(placeholder), 'g'), '');
    
    const updatedImages = cleanupContentImages(newContent, blogFormData.contentImages);
    
    setblogFormData(prev => ({
      ...prev,
      content: newContent,
      contentImages: updatedImages
    }));
  };

  // Remove video from content
  const removeVideoFromContent = (embedId) => {
    const placeholder = `[VIDEO:${embedId}]`;
    const newContent = blogFormData.content.replace(new RegExp(escapeRegExp(placeholder), 'g'), '');
    
    const updatedVideos = cleanupContentVideos(newContent, blogFormData.contentVideos);
    
    setblogFormData(prev => ({
      ...prev,
      content: newContent,
      contentVideos: updatedVideos
    }));
  };

  // Helper function to escape regex
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'content') {
      const updatedImages = cleanupContentImages(value, blogFormData.contentImages);
      const updatedVideos = cleanupContentVideos(value, blogFormData.contentVideos);
      setblogFormData(prev => ({
        ...prev,
        [name]: value,
        contentImages: updatedImages,
        contentVideos: updatedVideos
      }));
    } else {
      setblogFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitBlogForm = async (e) => {
    e.preventDefault();
    setSubmissionLoading(true);
    setError('');

    try {
      const tagsArray = blogFormData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      const cleanedImages = cleanupContentImages(blogFormData.content, blogFormData.contentImages);
      const cleanedVideos = cleanupContentVideos(blogFormData.content, blogFormData.contentVideos);
      
      const response = await fetch(`${API_URL}/api/blog-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...blogFormData, 
          tags: tagsArray,
          contentImages: cleanedImages,
          contentVideos: cleanedVideos
        })
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedSubmissionId(data.blogSubmissionId);
        setSuccessOverlay(true);
        setblogFormData({
          userName: '', userEmail: '', title: '', content: '', summary: '',
          tags: '', featuredImage: '', contentImages: [], contentVideos: []
        });
      } else {
        if (data.code && data.code.includes('POLICY_VIOLATION')) {
          setModerationError(data.message);
          setShowModerationModal(true);
        } else {
          setError(data.message || 'Failed to submit');
        }
      }
    } catch (error) {
      setError('Error submitting blog. Please try again.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const checkSubmissionStatus = async () => {
    if (!statusCheckId.trim()) {
      setError('Enter submission ID');
      return;
    }
    setStatusLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/blog-submissions/status/${statusCheckId.trim()}`);
      const data = await response.json();
      if (response.ok) {
        setStatusData(data);
      } else {
        setError('Submission not found');
        setStatusData(null);
      }
    } catch (error) {
      setError('Error checking status. Please try again.');
      setStatusData(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(generatedSubmissionId);
    alert('Copied!');
  };

  const ContentImagesSection = ({ contentImages, content }) => {
    const activeImages = generateImagePreview(contentImages, content);
    
    if (!activeImages || activeImages.length === 0) {
      return null;
    }
    
    return (
      <div className="form-group">
        <label>Content Images ({activeImages.length})</label>
        <div className="content-images-list">
          {activeImages.map((image, index) => (
            <div key={image.imageId || index} className="content-image-item">
              <img 
                src={image.url} 
                alt={image.alt} 
                className="content-image-thumb"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/50x50?text=Error';
                }}
              />
              <div className="content-image-info">
                <span className="image-id">[IMAGE:{image.imageId}]</span>
                <span className="image-position">{image.position}</span>
                {image.caption && <span className="image-caption">{image.caption}</span>}
              </div>
              <button
                type="button"
                className="btn btn-small btn-delete"
                onClick={() => removeImageFromContent(image.imageId)}
                title="Remove this image from content"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="helper-text">
          Only images referenced in your content are shown above. 
          Remove the [IMAGE:id] placeholder from your content to remove an image.
        </div>
      </div>
    );
  };

  const ContentVideosSection = ({ contentVideos, content }) => {
    const activeVideos = generateVideoPreview(contentVideos, content);
    
    if (!activeVideos || activeVideos.length === 0) {
      return null;
    }
    
    return (
      <div className="form-group">
        <label>Content Videos ({activeVideos.length})</label>
        <div className="content-videos-list">
          {activeVideos.map((video, index) => (
            <div key={video.embedId || index} className="content-video-item">
              <div className="content-video-thumb">
                {video.platform === 'youtube' && (
                  <img
                    src={`https://img.youtube.com/vi/${video.videoId}/default.jpg`}
                    alt={video.title || 'Video thumbnail'}
                    className="content-video-thumb-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/50x50?text=Video';
                    }}
                  />
                )}
                {video.platform === 'vimeo' && (
                  <div className="video-thumb-placeholder">Vimeo Video</div>
                )}
                {video.platform === 'dailymotion' && (
                  <div className="video-thumb-placeholder">Dailymotion Video</div>
                )}
              </div>
              <div className="content-video-info">
                <span className="video-id">[VIDEO:{video.embedId}]</span>
                <span className="video-position">{video.position}</span>
                {video.title && <span className="video-title">{video.title}</span>}
                {video.caption && <span className="video-caption">{video.caption}</span>}
                <span className="video-options">
                  {video.autoplay ? 'Autoplay: On' : 'Autoplay: Off'}, {video.muted ? 'Muted: On' : 'Muted: Off'}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-small btn-delete"
                onClick={() => removeVideoFromContent(video.embedId)}
                title="Remove this video from content"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="helper-text">
          Only videos referenced in your content are shown above. 
          Remove the [VIDEO:embedId] placeholder from your content to remove a video.
        </div>
      </div>
    );
  };

  return (
    <div className="usersubmit-wrapper">
      <div className="usersubmit-container">
        <button onClick={() => navigate('/blog')} className="usersubmit-backbtn">
          ← Back to Blogs
        </button>

        {/* Status Check Section */}
        <div className="usersubmit-statussection">
          <h2 className="usersubmit-title">Check Submission Status</h2>
          <div className="usersubmit-statusform">
            <input
              type="text"
              value={statusCheckId}
              onChange={(e) => setStatusCheckId(e.target.value)}
              placeholder="Enter Submission ID"
              className="usersubmit-input-small"
            />
            <button onClick={checkSubmissionStatus} disabled={statusLoading} className="usersubmit-btn-small">
              {statusLoading ? 'Checking...' : 'Check'}
            </button>
          </div>

          {statusData && (
            <div className="usersubmit-statusresult">
              <p><strong>ID:</strong> {statusData.blogSubmissionId}</p>
              <p><strong>Title:</strong> {statusData.title}</p>
              <p><strong>Status:</strong> <span className={`usersubmit-badge-${statusData.status}`}>{statusData.status}</span></p>
              {statusData.rejectionReason && (
                <p className="usersubmit-rejection"><strong>Reason:</strong> {statusData.rejectionReason}</p>
              )}
              {statusData.changesSuggested && (
                <p className="usersubmit-changes"><strong>Changes:</strong> {statusData.changesSuggested}</p>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {imageModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add Image to Content</h3>
                <button 
                  className="modal-close"
                  onClick={() => setImageModal(prev => ({ ...prev, isOpen: false }))}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="imageUrl">Image URL *</label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="url"
                    value={imageModal.url}
                    onChange={handleImageModalChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imageAlt">Alt Text</label>
                  <input
                    type="text"
                    id="imageAlt"
                    name="alt"
                    value={imageModal.alt}
                    onChange={handleImageModalChange}
                    placeholder="Description of the image"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imageCaption">Caption</label>
                  <input
                    type="text"
                    id="imageCaption"
                    name="caption"
                    value={imageModal.caption}
                    onChange={handleImageModalChange}
                    placeholder="Image caption (optional)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imagePosition">Position</label>
                  <select
                    id="imagePosition"
                    name="position"
                    value={imageModal.position}
                    onChange={handleImageModalChange}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="full-width">Full Width</option>
                  </select>
                </div>
                {imageModal.url && (
                  <div className="image-preview">
                    <p>Preview:</p>
                    <img
                      src={imageModal.url}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setImageModal(prev => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddImage}
                  disabled={uploadingImage || !imageModal.url.trim()}
                >
                  {uploadingImage && <span className="spinner"></span>}
                  Add Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Modal */}
        {videoModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add Video to Content</h3>
                <button 
                  className="modal-close"
                  onClick={() => setVideoModal(prev => ({ ...prev, isOpen: false }))}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="videoUrl">Video URL * (YouTube, Vimeo, Dailymotion)</label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="url"
                    value={videoModal.url}
                    onChange={handleVideoModalChange}
                    placeholder="https://youtube.com/watch?v=videoId"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="videoTitle">Video Title</label>
                  <input
                    type="text"
                    id="videoTitle"
                    name="title"
                    value={videoModal.title}
                    onChange={handleVideoModalChange}
                    placeholder="Video title (optional)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="videoCaption">Caption</label>
                  <input
                    type="text"
                    id="videoCaption"
                    name="caption"
                    value={videoModal.caption}
                    onChange={handleVideoModalChange}
                    placeholder="Video caption (optional)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="videoPosition">Position</label>
                  <select
                    id="videoPosition"
                    name="position"
                    value={videoModal.position}
                    onChange={handleVideoModalChange}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="full-width">Full Width</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="autoplay"
                      checked={videoModal.autoplay}
                      onChange={handleVideoModalChange}
                    />
                    Autoplay
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="muted"
                      checked={videoModal.muted}
                      onChange={handleVideoModalChange}
                    />
                    Muted
                  </label>
                </div>
                {videoModal.url && extractVideoInfo(videoModal.url) && (
                  <div className="video-preview">
                    <p>Preview:</p>
                    <div className="video-preview-wrapper">
                      {extractVideoInfo(videoModal.url).platform === 'youtube' && (
                        <img
                          src={`https://img.youtube.com/vi/${extractVideoInfo(videoModal.url).videoId}/default.jpg`}
                          alt="Video preview"
                          style={{ maxWidth: '100%', maxHeight: '200px' }}
                        />
                      )}
                      {extractVideoInfo(videoModal.url).platform === 'vimeo' && (
                        <div className="video-thumb-placeholder">Vimeo Video Preview</div>
                      )}
                      {extractVideoInfo(videoModal.url).platform === 'dailymotion' && (
                        <div className="video-thumb-placeholder">Dailymotion Video Preview</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setVideoModal(prev => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddVideo}
                  disabled={uploadingVideo || !videoModal.url.trim()}
                >
                  {uploadingVideo && <span className="spinner"></span>}
                  Add Video
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Form */}
        <div className="usersubmit-formsection">
          <h2 className="usersubmit-title">Submit Your Blog</h2>
          
          <form onSubmit={submitBlogForm} className="usersubmit-form">
            <div className="usersubmit-row">
              <input
                type="text"
                name="userName"
                value={blogFormData.userName}
                onChange={handleInputChange}
                placeholder="Your Name *"
                required
                className="usersubmit-input"
              />
              <input
                type="email"
                name="userEmail"
                value={blogFormData.userEmail}
                onChange={handleInputChange}
                placeholder="Your Email *"
                required
                className="usersubmit-input"
              />
            </div>

            <input
              type="text"
              name="title"
              value={blogFormData.title}
              onChange={handleInputChange}
              placeholder="Blog Title *"
              required
              className="usersubmit-input"
            />

            <div className="form-group">
              <label htmlFor="summary">Summary (max 200 characters) *</label>
              <textarea
                id="summary"
                name="summary"
                value={blogFormData.summary}
                onChange={handleInputChange}
                required
                maxLength={200}
                rows={3}
                placeholder="Brief summary of the blog post"
                className="usersubmit-textarea"
              ></textarea>
              <span className="character-count">{blogFormData.summary.length}/200 characters</span>
            </div>

            <div className="form-group">
              <label htmlFor="content">Content *</label>
              <div className="editor-toolbar">
                <button 
                  type="button" 
                  onClick={(e) => formatText(e, 'heading')}
                  className="toolbar-btn"
                  title="Heading"
                >
                  <strong>H1</strong>
                </button>
                <button 
                  type="button" 
                  onClick={(e) => formatText(e, 'subheading')}
                  className="toolbar-btn"
                  title="Subheading"
                >
                  <strong>H2</strong>
                </button>
                <button 
                  type="button" 
                  onClick={(e) => formatText(e, 'bold')}
                  className="toolbar-btn"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button 
                  type="button" 
                  onClick={(e) => formatText(e, 'italic')}
                  className="toolbar-btn"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button 
                  type="button" 
                  onClick={(e) => formatText(e, 'list')}
                  className="toolbar-btn"
                  title="List"
                >
                  <span>• List</span>
                </button>
                <button 
                  type="button" 
                  onClick={(e) => formatText(e, 'link')}
                  className="toolbar-btn"
                  title="Insert Link"
                >
                  <span>🔗 Link</span>
                </button>
                <button 
                  type="button" 
                  onClick={(e) => formatText(e, 'image')}
                  className="toolbar-btn"
                  title="Insert Image"
                >
                  <span>🖼️ Image</span>
                </button>
                <button 
                  type="button" 
                  onClick={(e) => formatText(e, 'video')}
                  className="toolbar-btn"
                  title="Insert Video"
                >
                  <span>🎥 Video</span>
                </button>
              </div>
              <textarea
                id="content"
                name="content"
                value={blogFormData.content}
                onChange={handleInputChange}
                required
                rows={15}
                placeholder="Write your blog content here... Use the toolbar to format your text or use Markdown directly. Click the Image or Video button to embed images or videos within your content."
                className="usersubmit-textarea"
              ></textarea>
              <span className="helper-text">
                Markdown is supported. You can use **bold**, *italic*, # headings, etc. 
                Use [IMAGE:imageId] or [VIDEO:embedId] placeholders to embed images or videos within content.
              </span>
            </div>

            <input
              type="url"
              name="featuredImage"
              value={blogFormData.featuredImage}
              onChange={handleInputChange}
              placeholder="Featured Image URL *"
              required
              className="usersubmit-input"
            />
            {blogFormData.featuredImage && (
              <div className="image-preview">
                <p>Featured Image Preview:</p>
                <img
                  src={blogFormData.featuredImage}
                  alt="Featured"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/640x360?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}

            <input
              type="text"
              name="tags"
              value={blogFormData.tags}
              onChange={handleInputChange}
              placeholder="Tags (comma separated)"
              className="usersubmit-input"
            />
            <span className="helper-text">Separate tags with commas</span>

            {/* Content Images Summary */}
            {blogFormData.contentImages && blogFormData.contentImages.length > 0 && (
              <ContentImagesSection 
                contentImages={blogFormData.contentImages} 
                content={blogFormData.content} 
              />
            )}

            {/* Content Videos Summary */}
            {blogFormData.contentVideos && blogFormData.contentVideos.length > 0 && (
              <ContentVideosSection 
                contentVideos={blogFormData.contentVideos} 
                content={blogFormData.content} 
              />
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/blog')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submissionLoading}
                className={`btn btn-primary ${submissionLoading ? 'btn-loading' : ''}`}
              >
                {submissionLoading && <span className="spinner"></span>}
                Submit Blog for Review
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Overlay */}
      {successOverlay && (
        <div className="usersubmit-overlay" onClick={() => setSuccessOverlay(false)}>
          <div className="usersubmit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="usersubmit-successicon">✓</div>
            <h3>Submitted Successfully!</h3>
            <p>Your blog submission has been received and is under review.</p>
            <p className="usersubmit-modalid">Submission ID: <strong>{generatedSubmissionId}</strong></p>
            <button onClick={copyIdToClipboard} className="usersubmit-btn-small">
              Copy Submission ID
            </button>
            <button onClick={() => setSuccessOverlay(false)} className="usersubmit-btn-small">
              Close
            </button>
            <p className="helper-text">Save your submission ID to check the status of your blog.</p>
          </div>
        </div>
      )}
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
                <p className="moderation-guidelines-title">Our Community Guidelines - Your content must not contain:</p>
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
                  <strong>Remember:</strong> Content should be respectful, constructive, and relevant to the blog topic.
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
    </div>
  );
};

export default UserBlogSubmission;