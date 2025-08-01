
import React from 'react';
import '../pagesCSS/PostSkeleton.css';

const SkeletonLoader = ({ type = 'post' }) => {
  return (
    <div className={`pst-post ${type === 'social' ? 'pst-social-embed' : ''}`}>
        
      <div className="pst-post-card pst-skeleton">
        {type === 'post' ? (
          <>
            <div className="pst-post-image pst-skeleton">
              <div className="pst-image-loading">
                
              </div>
            </div>
            <div className="pst-post-caption">
              <div className="pst-caption-text pst-skeleton"></div>
              <div className="pst-modal-date pst-skeleton"></div>
            </div>
          </>
        ) : (
          <>
            <div className="pst-social-header">
              <div className="pst-platform-badge pst-skeleton"></div>
            </div>
            <div className="pst-social-content">
              <div className="pst-social-title pst-skeleton"></div>
              <div className="pst-social-description pst-skeleton"></div>
              <div className="pst-modal-date pst-skeleton"></div>
              <div className="pst-social-preview pst-skeleton"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SkeletonLoader;
