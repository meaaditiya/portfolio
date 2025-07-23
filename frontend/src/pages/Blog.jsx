import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogSkeletonLoader from './BlogSkeletonLoader';
import Error from './Error.jsx';
import './blog.css';

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Only for initial load with skeleton
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(6); // Initial limit of 6 blogs
  const [hasMore, setHasMore] = useState(true); // Track if more blogs are available
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Track load more state
  
  // Summary popup states
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Function to extract domain from URL
  const getImageSource = (imageUrl) => {
    if (!imageUrl) return null;
    try {
      const url = new URL(imageUrl);
      return url.hostname.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  };

  // Fetch blogs from API (initial load only)
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsInitialLoading(true);
      try {
        const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/blogs?status=published&limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const data = await response.json();
        setBlogs(data.blogs);
        // Check if there are more blogs to load
        setHasMore(data.blogs.length === limit);
      } catch (err) {
        setError('Failed to fetch blogs');
        console.error(err);
      } finally {
        setIsInitialLoading(false);
      }
    };
        
    // Only fetch on initial mount
    if (limit === 6) {
      fetchBlogs();
    }
  }, []); // Empty dependency array for initial load only

  // Handle Load More button click
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const newLimit = limit + 2;
    
    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/blogs?status=published&limit=${newLimit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch more blogs');
      }
      const data = await response.json();
      setBlogs(data.blogs);
      setLimit(newLimit);
      setHasMore(data.blogs.length === newLimit);
    } catch (err) {
      setError('Failed to load more blogs');
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle Generate Summary button click
  const handleGenerateSummary = async (blog, event) => {
    event.stopPropagation(); // Prevent blog card navigation
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

  // Close summary popup
  const closeSummaryPopup = () => {
    setShowSummaryPopup(false);
    setSelectedBlog(null);
    setGeneratedSummary('');
    setSummaryError(null);
  };

  // Render Error component if any error occurred
  if (error) {
    return <Error />;
  }

  // Show skeleton loader ONLY on initial load
  if (isInitialLoading) {
    return (
      <section className="section">
        <h2 className="section-title">Blogs</h2>
        <BlogSkeletonLoader count={6} />
      </section>
    );
  }

  return (
    <section className="section">
      <h2 className="section-title">Blogs</h2>

      {blogs.length === 0 && (
        <div className="empty-state">
          <p>No blog posts available at the moment.</p>
        </div>
      )}

      <div className="grid">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="blog-card1"
            onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}
          >
            {blog.featuredImage ? (
              <div className="blog-image-container">
                <img src={blog.featuredImage} alt={blog.title} className="blog-image" />
                <div className="image-source">
                  Photo: {getImageSource(blog.featuredImage)}
                </div>
              </div>
            ) : (
              <div className="blog-placeholder">
                <div className="placeholder-title">AT</div>
                <div className="placeholder-text">
                  Photo: Default<br />
                  Placeholder Image
                </div>
              </div>
            )}
            <div className="blog-content">
              <h3 className="blog-title">{blog.title}</h3>
              <p className="blog-date">
                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="blog-summary">{blog.summary}</p>
              <div className="blog-tags">
                {blog.tags && blog.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            <button
  className="generate-summary-btn"
  onClick={(e) => handleGenerateSummary(blog, e)}
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
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button 
            className="load-more-button" 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Simple spinner for Load More (not skeleton loader) */}
      {isLoadingMore && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {/* Summary Popup */}
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

export default Blog;