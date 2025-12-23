// ============================================
// AuthorProfileModal.jsx
// ============================================
import React from 'react';
import '../pagesCSS/AuthorProfileModal.css';
const AuthorProfileModal = ({ 
  show, 
  onClose, 
  authorData, 
  loading, 
  blogPost,
  onNavigateToBlog // Pass navigate function from parent
}) => {
  if (!show) return null;

  // Get social media icon URL
  const getSocialIcon = (platform) => {
    const icons = {
        linkedin:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0bGEl9v47XieEtHyj0TqTr1tOXJmib-KHtw&s',
      twitter: 'https://cdn.cdnlogo.com/logos/t/96/twitter-icon.svg',
      github: 'https://cdn.cdnlogo.com/logos/g/69/github-icon.svg',
      instagram: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8lv-iEOWtRxGDqsOR-Pa1kIiqN298569zVA&s',
      youtube: 'https://cdn.cdnlogo.com/logos/y/23/youtube-icon.svg',
      medium: 'https://cdn.cdnlogo.com/logos/m/66/medium-icon.svg',
      portfolio: 'https://cdn.freebiesupply.com/logos/large/2x/portfolio-logo-svg-vector.svg',
      personalWebsite: 'https://cdn.cdnlogo.com/logos/w/90/world-wide-web.svg'
    };
    return icons[platform] || 'https://cdn.cdnlogo.com/logos/w/90/world-wide-web.svg';
  };

  // Format platform name for display
  const formatPlatformName = (platform) => {
    const names = {
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      instagram: 'Instagram',
      youtube: 'YouTube',
      medium: 'Medium',
      portfolio: 'Portfolio',
      personalWebsite: 'Website'
    };
    return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const handleViewMoreBlogs = () => {
    if (onNavigateToBlog && authorData && blogPost?.author) {
      onClose();
      onNavigateToBlog(authorData.name, blogPost.author._id);
    }
  };

  return (
    <div className="author-modal-overlay" onClick={onClose}>
      <div className="author-modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          className="author-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        {loading ? (
          <div className="author-modal-loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : authorData ? (
          <div className="author-profile-content">
            {/* Profile Header */}
            <div className="author-profile-header">
              {authorData.profileImage?.url ? (
                <img 
                  src={authorData.profileImage.url}
                  alt={authorData.name}
                  className="author-profile-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="author-profile-placeholder"
                style={{ display: authorData.profileImage?.url ? 'none' : 'flex' }}
              >
                {authorData.name.charAt(0).toUpperCase()}
              </div>
              
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
            
            {/* Bio Section */}
            {authorData.bio && (
              <div className="author-profile-bio">
                <p>{authorData.bio}</p>
              </div>
            )}
            
            {/* Expertise Section */}
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
            
            {/* Interests Section */}
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
            
            {/* Social Links Section */}
            {authorData.socialLinks &&
              Object.entries(authorData.socialLinks).some(([_, url]) => url) && (
                <div className="author-profile-section">
                  <h3 className="author-section-title">Connect</h3>
                  <div className="author-social-links">
                    {Object.entries(authorData.socialLinks).map(([platform, url]) => {
                      if (!url) return null;
                      
                      const iconUrl = getSocialIcon(platform);
                      
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="author-social-link"
                          title={formatPlatformName(platform)}
                        >
                          {iconUrl ? (
                            <img
                              src={iconUrl}
                              alt={formatPlatformName(platform)}
                              className="author-social-icon"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="author-social-placeholder"
                            style={{ display: iconUrl ? 'none' : 'flex' }}
                          >
                            {formatPlatformName(platform).charAt(0)}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            
            {/* View More Blogs Button */}
            {authorData && blogPost?.author && (
              <div className="author-profile-section">
                <button
                  className="author-blogs-btn"
                  onClick={handleViewMoreBlogs}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  See Other Blogs by {authorData.name}
                </button>
              </div>
            )}
            
            {/* Member Since Footer */}
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
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <p>Unable to load author profile</p>
            <button className="retry-btn" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorProfileModal;