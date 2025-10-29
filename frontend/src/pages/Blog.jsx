import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogSkeletonLoader from './BlogSkeletonLoader';
import Error from './Error.jsx';
import '../pagesCSS/blog.css';

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(6);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [availableTags, setAvailableTags] = useState([]);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  
  // Summary popup states
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
 
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

  // Extract all unique tags from blogs
  useEffect(() => {
    if (blogs.length > 0) {
      const tags = new Set();
      blogs.forEach(blog => {
        if (blog.tags) {
          blog.tags.forEach(tag => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags));
    }
  }, [blogs]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...blogs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(query) ||
        blog.summary.toLowerCase().includes(query) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter(blog => 
        blog.tags && blog.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Sorting
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
        break;
      case 'mostViewed':
        result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'mostLiked':
        result.sort((a, b) => (b.reactionCounts?.likes || 0) - (a.reactionCounts?.likes || 0));
        break;
      case 'mostCommented':
        result.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
        break;
      default:
        break;
    }

    setFilteredBlogs(result);
  }, [blogs, searchQuery, selectedTags, sortOption]);

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
        setHasMore(data.blogs.length === limit);
      } catch (err) {
        setError('Failed to fetch blogs');
        console.error(err);
      } finally {
        setIsInitialLoading(false);
      }
    };
        
    if (limit === 6) {
      fetchBlogs();
    }
  }, []);

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

  // Handle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSortOption('newest');
  };

  // Check if filters are active
  const hasActiveFilters = searchQuery || selectedTags.length > 0 || sortOption !== 'newest';

  // Handle Generate Summary button click
  const handleGenerateSummary = async (blog, event) => {
    event.stopPropagation();
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
      <div className="blog-header">
        <h2 className="section-title">Blogs</h2>
        
        {/* Filter Button */}
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilterPopup(!showFilterPopup)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filter
          {hasActiveFilters && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Filter Popup */}
      {showFilterPopup && (
        <div className="filter-popup-overlay" onClick={() => setShowFilterPopup(false)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Filter & Sort</h3>
              <button onClick={() => setShowFilterPopup(false)} className="close-btn">×</button>
            </div>
            
            <div className="filter-popup-content">
              {/* Search */}
              <div className="filter-group">
                <label>Search</label>
                <input
                  type="text"
                  className="filter-search-input"
                  placeholder="Search by title or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sort */}
              <div className="filter-group">
                <label>Sort By</label>
                <select
                  className="filter-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mostViewed">Most Viewed</option>
                  <option value="mostLiked">Most Liked</option>
                  <option value="mostCommented">Most Commented</option>
                </select>
              </div>

              {/* Tags */}
              {availableTags.length > 0 && (
                <div className="filter-group">
                  <label>Tags</label>
                  <div className="filter-tags">
                    {availableTags.map((tag, index) => (
                      <button
                        key={index}
                        className={`filter-tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results & Actions */}
              <div className="filter-footer">
                <span className="filter-results">
                  {filteredBlogs.length} of {blogs.length} blogs
                </span>
                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredBlogs.length === 0 && (
        <div className="empty-state">
          <p>No blog posts match your filters.</p>
        </div>
      )}

      <div className="grid">
        {filteredBlogs.map((blog) => (
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
                AI Summary
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !searchQuery && selectedTags.length === 0 && (
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

            <>
              {showInfo && (
                <div className="floating-warning-popup">
                  This summary is generated by artificial intelligence and may not accurately represent the original message's intent or context. It is recommended to review the content carefully, as certain nuances, meanings, or expressions might be misinterpreted, simplified, or omitted during the automated summarization process. Use it with discretion.
                </div>
              )}

              <div className="popup-footer">
                <div
                  className="footer-info-icon"
                  onClick={() => setShowInfo(!showInfo)}
                  onMouseLeave={() => setShowInfo(false)}
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
            </>
          </div>
        </div>
      )}
    </section>
  );
};

export default Blog;