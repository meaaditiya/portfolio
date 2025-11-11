import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pagesCSS/UserBlogSubmission.css';

const UserBlogSubmission = () => {
  const navigate = useNavigate();
 const API_URL = 'https://connectwithaaditiyamg.onrender.com';

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

  // Image form states
  const [showImageForm, setShowImageForm] = useState(false);
  const [newImageData, setNewImageData] = useState({
    url: '',
    alt: '',
    caption: '',
    position: 'center'
  });

  // Video form states
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [newVideoData, setNewVideoData] = useState({
    url: '',
    videoId: '',
    platform: 'youtube',
    title: '',
    caption: '',
    position: 'center'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setblogFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageInputChange = (e) => {
    const { name, value } = e.target;
    setNewImageData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoInputChange = (e) => {
    const { name, value } = e.target;
    setNewVideoData(prev => ({ ...prev, [name]: value }));
  };

  const addImageToContent = () => {
    if (!newImageData.url.trim()) {
      alert('Image URL is required');
      return;
    }

    const newImg = {
      ...newImageData,
      imageId: `img-${Date.now()}`
    };

    setblogFormData(prev => ({
      ...prev,
      contentImages: [...prev.contentImages, newImg]
    }));

    // Reset form
    setNewImageData({ url: '', alt: '', caption: '', position: 'center' });
    setShowImageForm(false);
  };

  const removeImageFromContent = (id) => {
    setblogFormData(prev => ({
      ...prev,
      contentImages: prev.contentImages.filter(img => img.imageId !== id)
    }));
  };

  const addVideoToContent = () => {
    if (!newVideoData.url.trim() || !newVideoData.videoId.trim()) {
      alert('Video URL and Video ID are required');
      return;
    }

    const newVid = {
      ...newVideoData,
      autoplay: false,
      muted: false,
      embedId: `vid-${Date.now()}`
    };

    setblogFormData(prev => ({
      ...prev,
      contentVideos: [...prev.contentVideos, newVid]
    }));

    // Reset form
    setNewVideoData({
      url: '',
      videoId: '',
      platform: 'youtube',
      title: '',
      caption: '',
      position: 'center'
    });
    setShowVideoForm(false);
  };

  const removeVideoFromContent = (id) => {
    setblogFormData(prev => ({
      ...prev,
      contentVideos: prev.contentVideos.filter(vid => vid.embedId !== id)
    }));
  };

  const submitBlogForm = async (e) => {
    e.preventDefault();
    setSubmissionLoading(true);

    try {
      const tagsArray = blogFormData.tags.split(',').map(t => t.trim()).filter(t => t);
      const response = await fetch(`${API_URL}/api/blog-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...blogFormData, tags: tagsArray })
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
        alert(data.message || 'Failed to submit');
      }
    } catch (error) {
      alert('Error submitting blog');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const checkSubmissionStatus = async () => {
    if (!statusCheckId.trim()) {
      alert('Enter submission ID');
      return;
    }
    setStatusLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/blog-submissions/status/${statusCheckId.trim()}`);
      const data = await response.json();
      if (response.ok) {
        setStatusData(data);
      } else {
        alert('Submission not found');
        setStatusData(null);
      }
    } catch (error) {
      alert('Error checking status');
      setStatusData(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(generatedSubmissionId);
    alert('Copied!');
  };

  return (
    <div className="usersubmit-wrapper">
      <div className="usersubmit-container">
        <button onClick={() => navigate('/blog')} className="usersubmit-backbtn">
          ← Back to Blogs
        </button>

        {/* Status Check Section - At Top */}
        <div className="usersubmit-statussection">
          <h2 className="usersubmit-title">Check Status</h2>
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

            <input
              type="text"
              name="summary"
              value={blogFormData.summary}
              onChange={handleInputChange}
              placeholder="Summary (max 200 chars)"
              maxLength="200"
              className="usersubmit-input"
            />

            <textarea
              name="content"
              value={blogFormData.content}
              onChange={handleInputChange}
              placeholder="Blog Content (Markdown supported) *"
              required
              rows="8"
              className="usersubmit-textarea"
            />

            <input
              type="text"
              name="tags"
              value={blogFormData.tags}
              onChange={handleInputChange}
              placeholder="Tags (comma separated)"
              className="usersubmit-input"
            />

            <input
              type="url"
              name="featuredImage"
              value={blogFormData.featuredImage}
              onChange={handleInputChange}
              placeholder="Featured Image URL *"
              required
              className="usersubmit-input"
            />

            {/* Add Image/Video Buttons */}
            <div className="usersubmit-mediasection">
              <button
                type="button"
                onClick={() => setShowImageForm(!showImageForm)}
                className="usersubmit-btn-small"
              >
                {showImageForm ? '− Cancel Image' : '+ Add Image'}
              </button>
              <button
                type="button"
                onClick={() => setShowVideoForm(!showVideoForm)}
                className="usersubmit-btn-small"
              >
                {showVideoForm ? '− Cancel Video' : '+ Add Video'}
              </button>
            </div>

            {/* Image Form */}
            {showImageForm && (
              <div className="usersubmit-addform">
                <h4 className="usersubmit-formtitle">Add Image</h4>
                <input
                  type="url"
                  name="url"
                  value={newImageData.url}
                  onChange={handleImageInputChange}
                  placeholder="Image URL *"
                  className="usersubmit-input"
                />
                <input
                  type="text"
                  name="alt"
                  value={newImageData.alt}
                  onChange={handleImageInputChange}
                  placeholder="Alt text (optional)"
                  className="usersubmit-input"
                />
                <input
                  type="text"
                  name="caption"
                  value={newImageData.caption}
                  onChange={handleImageInputChange}
                  placeholder="Caption (optional)"
                  className="usersubmit-input"
                />
                <select
                  name="position"
                  value={newImageData.position}
                  onChange={handleImageInputChange}
                  className="usersubmit-input"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="full-width">Full Width</option>
                </select>
                <button
                  type="button"
                  onClick={addImageToContent}
                  className="usersubmit-btn-small"
                >
                  Add Image
                </button>
              </div>
            )}

            {/* Video Form */}
            {showVideoForm && (
              <div className="usersubmit-addform">
                <h4 className="usersubmit-formtitle">Add Video</h4>
                <input
                  type="url"
                  name="url"
                  value={newVideoData.url}
                  onChange={handleVideoInputChange}
                  placeholder="Video URL *"
                  className="usersubmit-input"
                />
                <input
                  type="text"
                  name="videoId"
                  value={newVideoData.videoId}
                  onChange={handleVideoInputChange}
                  placeholder="Video ID *"
                  className="usersubmit-input"
                />
                <select
                  name="platform"
                  value={newVideoData.platform}
                  onChange={handleVideoInputChange}
                  className="usersubmit-input"
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="dailymotion">Dailymotion</option>
                </select>
                <input
                  type="text"
                  name="title"
                  value={newVideoData.title}
                  onChange={handleVideoInputChange}
                  placeholder="Title (optional)"
                  className="usersubmit-input"
                />
                <input
                  type="text"
                  name="caption"
                  value={newVideoData.caption}
                  onChange={handleVideoInputChange}
                  placeholder="Caption (optional)"
                  className="usersubmit-input"
                />
                <select
                  name="position"
                  value={newVideoData.position}
                  onChange={handleVideoInputChange}
                  className="usersubmit-input"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="full-width">Full Width</option>
                </select>
                <button
                  type="button"
                  onClick={addVideoToContent}
                  className="usersubmit-btn-small"
                >
                  Add Video
                </button>
              </div>
            )}

            {/* Display Added Images */}
            {blogFormData.contentImages.length > 0 && (
              <div className="usersubmit-medialist">
                <h4 className="usersubmit-formtitle">Added Images ({blogFormData.contentImages.length})</h4>
                {blogFormData.contentImages.map((img) => (
                  <div key={img.imageId} className="usersubmit-mediaitem">
                    <img src={img.url} alt={img.alt} className="usersubmit-mediaimg" />
                    <div className="usersubmit-mediadetails">
                      <p>{img.alt || 'No alt text'}</p>
                      <span>{img.position}</span>
                    </div>
                    <button type="button" onClick={() => removeImageFromContent(img.imageId)} className="usersubmit-removebtn">×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Display Added Videos */}
            {blogFormData.contentVideos.length > 0 && (
              <div className="usersubmit-medialist">
                <h4 className="usersubmit-formtitle">Added Videos ({blogFormData.contentVideos.length})</h4>
                {blogFormData.contentVideos.map((vid) => (
                  <div key={vid.embedId} className="usersubmit-mediaitem">
                    <div className="usersubmit-mediadetails">
                      <p><strong>{vid.platform}</strong>: {vid.videoId}</p>
                      <span>{vid.title || 'No title'}</span>
                    </div>
                    <button type="button" onClick={() => removeVideoFromContent(vid.embedId)} className="usersubmit-removebtn">×</button>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={submissionLoading} className="usersubmit-submitbtn">
              {submissionLoading ? 'Submitting...' : 'Submit Blog'}
            </button>
          </form>
        </div>
      </div>

      {/* Success Overlay */}
      {successOverlay && (
        <div className="usersubmit-overlay" onClick={() => setSuccessOverlay(false)}>
          <div className="usersubmit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="usersubmit-successicon">✓</div>
            <h3>Submitted!</h3>
            <p className="usersubmit-modalid">{generatedSubmissionId}</p>
            <button onClick={copyIdToClipboard} className="usersubmit-btn-small">Copy ID</button>
            <button onClick={() => setSuccessOverlay(false)} className="usersubmit-btn-small">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBlogSubmission;