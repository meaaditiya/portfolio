import React from 'react';
import '../pagesCSS/BlogSkeletonLoader.css';

const BlogSkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="blog-card1 skeleton-card">
          {/* Image/Placeholder Skeleton */}
          <div className="blog-image-container skeleton-image-container">
            <div className="skeleton-image"></div>
          </div>
          
          {/* Content Skeleton */}
          <div className="blog-content skeleton-content">
            {/* Title Skeleton */}
            <div className="skeleton-title">
              <div className="skeleton-line skeleton-line-title"></div>
              <div className="skeleton-line skeleton-line-title-short"></div>
            </div>
            
            {/* Date Skeleton */}
            <div className="skeleton-date">
              <div className="skeleton-line skeleton-line-date"></div>
            </div>
            
            {/* Summary Skeleton */}
            <div className="skeleton-summary">
              <div className="skeleton-line skeleton-line-summary"></div>
              <div className="skeleton-line skeleton-line-summary"></div>
            </div>
            
            {/* Tags Skeleton */}
            <div className="skeleton-tags">
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag skeleton-tag-small"></div>
            </div>
            
            {/* Generate Summary Button Skeleton */}
            <div className="skeleton-generate-btn"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogSkeletonLoader;