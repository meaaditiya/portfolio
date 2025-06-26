import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './blog.css';

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(6); // Initial limit of 6 blogs
  const [hasMore, setHasMore] = useState(true); // Track if more blogs are available

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

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };
        
    fetchBlogs();
  }, [limit]); // Re-run when limit changes

  // Handle Load More button click
  const handleLoadMore = () => {
    setLimit((prevLimit) => prevLimit + 2); // Increase limit by 2
  };

  return (
    <section className="section">
      <h2 className="section-title">Blogs</h2>

      {error && (
        <div className="error">{error}</div>
      )}

      {!isLoading && !error && blogs.length === 0 && (
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
            </div>
          </div>
        ))}
      </div>

      {hasMore && !isLoading && !error && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}
    </section>
  );
};

export default Blog;