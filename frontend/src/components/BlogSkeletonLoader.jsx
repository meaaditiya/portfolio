import React from 'react';
import '../pagesCSS/BlogSkeletonLoader.css';

const BlogSkeletonLoader = ({ count = 6 }) => {
  return (
    <>
      <div className="blog-grid-new">
        {/* Featured Large Card Skeleton (First Item) */}
        <div className="blog-card-featured skeleton-card">
          {/* Image Skeleton */}
          <div className="featured-image-wrapper skeleton-image-wrapper">
            <div className="skeleton-image"></div>
          </div>
          
          {/* Content Skeleton */}
          <div className="featured-content skeleton-content">
            {/* Meta Skeleton */}
            <div className="skeleton-meta">
              <div className="skeleton-line skeleton-author"></div>
              <div className="skeleton-line skeleton-divider"></div>
              <div className="skeleton-line skeleton-date"></div>
            </div>
            
            {/* Title Skeleton */}
            <div className="skeleton-title-wrapper">
              <div className="skeleton-line skeleton-featured-title"></div>
              <div className="skeleton-line skeleton-featured-title-short"></div>
            </div>
            
            {/* Summary Skeleton */}
            <div className="skeleton-summary">
              <div className="skeleton-line skeleton-summary-line"></div>
              <div className="skeleton-line skeleton-summary-line"></div>
              <div className="skeleton-line skeleton-summary-line-short"></div>
            </div>
            
            {/* Footer Skeleton */}
            <div className="skeleton-footer">
              <div className="skeleton-tags-wrapper">
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag skeleton-tag-small"></div>
              </div>
              <div className="skeleton-ai-btn"></div>
            </div>
          </div>
        </div>

        {/* Small Cards Grid Skeleton (Remaining Items) */}
        <div className="blog-cards-grid">
          {Array.from({ length: count - 1 }).map((_, index) => (
            <div key={index} className="blog-card-small skeleton-card">
              {/* Image Skeleton */}
              <div className="small-image-wrapper skeleton-small-image-wrapper">
                <div className="skeleton-image"></div>
              </div>
              
              {/* Content Skeleton */}
              <div className="small-content skeleton-small-content">
                {/* Meta Skeleton */}
                <div className="skeleton-meta">
                  <div className="skeleton-line skeleton-small-author"></div>
                  <div className="skeleton-line skeleton-divider"></div>
                  <div className="skeleton-line skeleton-small-date"></div>
                </div>
                
                {/* Title Skeleton */}
                <div className="skeleton-small-title-wrapper">
                  <div className="skeleton-line skeleton-small-title"></div>
                  <div className="skeleton-line skeleton-small-title-short"></div>
                </div>
                
                {/* Summary Skeleton */}
                <div className="skeleton-small-summary">
                  <div className="skeleton-line skeleton-small-summary-line"></div>
                  <div className="skeleton-line skeleton-small-summary-line-short"></div>
                </div>
                
                {/* Tags Skeleton */}
                <div className="skeleton-small-tags">
                  <div className="skeleton-small-tag"></div>
                  <div className="skeleton-small-tag"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogSkeletonLoader;