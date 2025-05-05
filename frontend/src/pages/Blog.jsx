// src/pages/Blog.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/blogs?status=published&limit=6');
        const data = await response.json();
        setBlogs(data.blogs);
      } catch (err) {
        setError('Failed to fetch blogs');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  return (
    <section className="section">
      <h2 className="section-title">Blogs</h2>

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

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
            className="blog-card"
            onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}
          >
            {blog.featuredImage ? (
              <img src={blog.featuredImage} alt={blog.title} className="blog-image" />
            ) : (
              <div className="blog-placeholder">
                <span>AT</span>
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
    </section>
  );
};

export default Blog;