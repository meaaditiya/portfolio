// src/pages/BlogPost.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch blog post details
  useEffect(() => {
    const fetchBlogDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/blogs/${slug}`);
        const data = await response.json();
        setBlogPost(data);
      } catch (err) {
        setError('Failed to fetch blog details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogDetails();
  }, [slug]);

  return (
    <section className="section">
      <button
        className="back-button"
        onClick={() => navigate('/blog')}
      >
        <FaArrowLeft className="back-icon" />
        Back to all posts
      </button>

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="error">{error}</div>
      )}

      {!isLoading && blogPost && (
        <div className="card blog-post">
          {blogPost.featuredImage && (
            <img src={blogPost.featuredImage} alt={blogPost.title} className="blog-post-image" />
          )}
          <h1 className="blog-post-title">{blogPost.title}</h1>
          <div className="blog-post-meta">
            <span className="blog-post-date">
              {new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="meta-divider">•</span>
            <span className="blog-post-author">
              {blogPost.author ? `By ${blogPost.author.name}` : 'By Aaditiya Tyagi'}
            </span>
          </div>
          <div className="blog-post-tags">
            {blogPost.tags && blogPost.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          ></div>
        </div>
      )}
    </section>
  );
};

export default BlogPost;