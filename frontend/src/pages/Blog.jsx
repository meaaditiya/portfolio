import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BlogSkeletonLoader from './BlogSkeletonLoader';
import Error from './Error.jsx';
import '../pagesCSS/blog.css';

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [availableTags, setAvailableTags] = useState([]);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const location = useLocation();
  
  // Vector search states
  const [showVectorSearch, setShowVectorSearch] = useState(false);
  const [vectorSearchQuery, setVectorSearchQuery] = useState('');
  const [isVectorSearchActive, setIsVectorSearchActive] = useState(false);
const [isVectorLoading, setIsVectorLoading] = useState(false);

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

  useEffect(() => {
    if (isVectorSearchActive) return;
    
    let result = [...blogs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(query) ||
        blog.summary.toLowerCase().includes(query) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    if (selectedAuthor) {
      result = result.filter(blog => 
        blog.author && blog.author._id === selectedAuthor.id
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter(blog => 
        blog.tags && blog.tags.some(tag => selectedTags.includes(tag))
      );
    }

    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
        break;
      case 'mostViewed':
        result.sort((a, b) => (b.totalReads || 0) - (a.totalReads || 0));
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
  }, [blogs, searchQuery, selectedTags, sortOption, selectedAuthor, isVectorSearchActive]);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsInitialLoading(true);
      try {
        const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/blogs?status=published&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data = await response.json();
        setBlogs(data.blogs);
        setHasMore(data.blogs.length === limit);
      } catch (err) {
        setError('Failed to fetch blogs');
      } finally {
        setIsInitialLoading(false);
      }
    };
    if (limit === 10) fetchBlogs();
  }, []);

  useEffect(() => {
    if (location.state?.filterAuthor) {
      setSelectedAuthor(location.state.filterAuthor);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const newLimit = limit + 2;
    try {
      const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/blogs?status=published&limit=${newLimit}`);
      if (!response.ok) throw new Error('Failed to fetch more blogs');
      const data = await response.json();
      setBlogs(data.blogs);
      setLimit(newLimit);
      setHasMore(data.blogs.length === newLimit);
    } catch (err) {
      setError('Failed to load more blogs');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSortOption('newest');
    setSelectedAuthor(null);
    clearVectorSearch();
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || sortOption !== 'newest' || selectedAuthor || isVectorSearchActive;

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
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate summary');
      }
      const data = await response.json();
      setGeneratedSummary(data.summary);
    } catch (err) {
      setSummaryError(err.message);
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

  const handleVectorSearch = async (e) => {
  e.preventDefault();
  if (!vectorSearchQuery.trim()) return;

  setIsVectorLoading(true); // START BAR

  try {
    const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: vectorSearchQuery.trim(),
        limit: 10,
        minScore: 0.3,
        includeUnpublished: false,
        hybridSearch: true,
        generateSuggestions: false
      })
    });

    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();
    setFilteredBlogs(data.results);
    setIsVectorSearchActive(true);
    setShowVectorSearch(false);
  } catch (error) {
    setFilteredBlogs([]);
  } finally {
    setIsVectorLoading(false); // STOP BAR
  }
};


  const clearVectorSearch = () => {
    setVectorSearchQuery('');
    setIsVectorSearchActive(false);
    setFilteredBlogs(blogs);
  };

  if (error) return <Error />;

  if (isInitialLoading) {
    return (
      <section className="section">
        <h2 className="section-title title2">Recent blog posts</h2>
        <BlogSkeletonLoader count={10} />
      </section>
    );
  }

  return (
    <section className="section">
      <div className="blog-header-new">
        <div className="blog-header-content">
          <h2 className="section-title-new">Recent blog posts</h2>
          
          <div className="header-buttons">
            {/* Vector Search Button */}
            <button 
             title="advanced search"
              className="vector-search-btn"
              onClick={() => setShowVectorSearch(!showVectorSearch)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>

            {/* Write Blog Button */}
            <button 
            title="write your own blog now"
              className="write-blog-btn"
              onClick={() => navigate('/blogsubmission')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                <path d="M2 2l7.586 7.586"></path>
                <circle cx="11" cy="11" r="2"></circle>
              </svg>
            </button>

            {/* Filter Button */}
            <button 
            title="apply filters"
              className="filter-toggle-btn"
              onClick={() => setShowFilterPopup(!showFilterPopup)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              {hasActiveFilters && <span className="filter-badge"></span>}
            </button>
          </div>
        </div>
      </div>

      {/* Vector Search Strip */}
      {showVectorSearch && (
        <div className="vector-search-strip">
          <form className="vector-strip-form" onSubmit={handleVectorSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={vectorSearchQuery}
              onChange={(e) => setVectorSearchQuery(e.target.value)}
              className="vector-strip-input"
              autoFocus
            />
            <button type="submit" className="vector-strip-btn" disabled={!vectorSearchQuery.trim()}>
              Search
            </button>
            <button type="button" className="vector-strip-close" onClick={() => setShowVectorSearch(false)}>
              ×
            </button>
          </form>
        </div>
      )}
    {isVectorLoading && (
  <div className="vector-progress-bar">
    <div className="vector-progress-fill"></div>
  </div>
)}

      {/* Active Vector Search Indicator */}
      {isVectorSearchActive && (
        <div className="vector-active-strip">
          <span>search results for: "{vectorSearchQuery}"</span>
          <button onClick={clearVectorSearch}>Clear</button>
        </div>
      )}

      {/* Filter Popup */}
      {showFilterPopup && (
        <div className="filter-popup-overlay" onClick={() => setShowFilterPopup(false)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Filter & Sort</h3>
              <button onClick={() => setShowFilterPopup(false)} className="close-btn">×</button>
            </div>
            
            <div className="filter-popup-content">
              <div className="filter-group">
                <label>Search</label>
                <input
                  type="text"
                  className="filter-search-input"
                  placeholder="Search by title or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isVectorSearchActive}
                />
              </div>

              {selectedAuthor && (
                <div className="filter-group">
                  <label>Author</label>
                  <div className="selected-author-filter">
                    <span className="author-filter-name">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {selectedAuthor.name}
                    </span>
                    <button className="remove-author-filter" onClick={() => setSelectedAuthor(null)}>×</button>
                  </div>
                </div>
              )}

              <div className="filter-group">
                <label>Sort By</label>
                <select
                  className="filter-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  disabled={isVectorSearchActive}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mostViewed">Most Viewed</option>
                  <option value="mostLiked">Most Liked</option>
                  <option value="mostCommented">Most Commented</option>
                </select>
              </div>

              {availableTags.length > 0 && (
                <div className="filter-group">
                  <label>Tags</label>
                  <div className="filter-tags">
                    {availableTags.map((tag, index) => (
                      <button
                        key={index}
                        className={`filter-tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => !isVectorSearchActive && toggleTag(tag)}
                        disabled={isVectorSearchActive}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="filter-footer">
                <span className="filter-results">{filteredBlogs.length} of {blogs.length} blogs</span>
                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={clearFilters}>Clear Filters</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredBlogs.length === 0 && (
        <div className="empty-state-new">
          <p>No blog posts found.</p>
          {isVectorSearchActive && <button className="clear-search-btn" onClick={clearVectorSearch}>Clear Search</button>}
        </div>
      )}

      <div className="blog-grid-new">
        {filteredBlogs.length > 0 && (
          <div className="blog-card-featured" onClick={() => navigate(`/blog/${filteredBlogs[0].slug || filteredBlogs[0]._id}`)}>
            <div className="featured-image-wrapper">
              {filteredBlogs[0].featuredImage ? (
                <img src={filteredBlogs[0].featuredImage} alt={filteredBlogs[0].title} className="featured-image" />
              ) : (
                <div className="featured-placeholder"><div className="placeholder-title">AT</div></div>
              )}
            </div>
            <div className="featured-content">
              <div className="featured-meta">
                <span className="featured-author">{filteredBlogs[0].author?.name || 'Anonymous'}</span>
                <span className="meta-divider">•</span>
                <span className="featured-date">
                  {new Date(filteredBlogs[0].publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h3 className="featured-title">{filteredBlogs[0].title}</h3>
              <p className="featured-summary">{filteredBlogs[0].summary}</p>
              <div className="featured-footer">
                <div className="featured-tags">
                  {filteredBlogs[0].tags?.slice(0, 3).map((tag, index) => (
                    <span key={index} className="featured-tag">{tag}</span>
                  ))}
                </div>
                <button className="generate-summary-btn-new" onClick={(e) => handleGenerateSummary(filteredBlogs[0], e)}>AI Summary</button>
              </div>
            </div>
          </div>
        )}

        <div className="blog-cards-grid">
          {filteredBlogs.slice(1).map((blog) => (
            <div key={blog._id} className="blog-card-small" onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}>
              <div className="small-image-wrapper">
                {blog.featuredImage ? (
                  <img src={blog.featuredImage} alt={blog.title} className="small-image" />
                ) : (
                  <div className="small-placeholder"><span className="placeholder-text">AT</span></div>
                )}
              </div>
              <div className="small-content">
                <div className="small-meta">
                  <span className="small-author">{blog.author?.name || 'Anonymous'}</span>
                  <span className="meta-divider">•</span>
                  <span className="small-date">
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="small-title">{blog.title}</h3>
                <p className="small-summary">{blog.summary}</p>
                <div className="small-footer">
                  <div className="small-tags">
                    {blog.tags?.slice(0, 2).map((tag, index) => (
                      <span key={index} className="small-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && !searchQuery && selectedTags.length === 0 && !isVectorSearchActive && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={handleLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {isLoadingMore && (
        <div className="loading"><div className="spinner"></div></div>
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
                    {new Date(selectedBlog.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
              <div className="summary-content">
                {isGeneratingSummary && (
                  <div className="generating-summary">
                    <div className="loading2"><span></span><span></span><span></span><span></span><span></span></div>
                    <p>Generating AI summary...</p>
                  </div>
                )}
                {summaryError && <div className="summary-error"><p>Error: {summaryError}</p></div>}
                {generatedSummary && !isGeneratingSummary && (
                  <div className="generated-summary"><h5>Summary:</h5><p>{generatedSummary}</p></div>
                )}
              </div>
            </div>
            <>
              {showInfo && (
                <div className="floating-warning-popup">
                  This summary is generated by artificial intelligence and may not accurately represent the original message's intent or context.
                </div>
              )}
              <div className="popup-footer">
                <div className="footer-info-icon" onClick={() => setShowInfo(!showInfo)} onMouseLeave={() => setShowInfo(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.88-5.75h1.75v4.25h-1.75V14.25zm0-6.5h1.75v1.75h-1.75V7.75z"/>
                  </svg>
                </div>
                <button onClick={closeSummaryPopup} className="close-popup-btn">Close</button>
              </div>
            </>
          </div>
        </div>
      )}
    </section>
  );
};

export default Blog;