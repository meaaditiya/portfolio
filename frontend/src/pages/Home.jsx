import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, ArrowUpRight, Code, Database, Globe, FileText, ExternalLink } from 'lucide-react';
import About from './About';
import Projects from './Projects';
import Contact from './Contact';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [quote, setQuote] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(null);
  const roles = ["Full-Stack Developer", "React Specialist", "Node.js Expert", "UI/UX Enthusiast"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);

    const roleInterval = setInterval(() => {
      setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length);
    }, 9000);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Fetch profile image with cache-busting
    const fetchProfileImage = async () => {
      try {
        setIsImageLoading(true);
        setImageError(null);
        const response = await fetch(`https://connectwithaaditiyamg.onrender.com/api/profile-image/active?t=${Date.now()}`);

        if (response.ok) {
          const blob = await response.blob();
          const newImageUrl = URL.createObjectURL(blob);
          // Set the new URL and revoke the previous one after setting
          setProfileImage((prevImage) => {
            if (prevImage) {
              URL.revokeObjectURL(prevImage);
            }
            return newImageUrl;
          });
        } else {
          setProfileImage(null);
          setImageError('No active profile image found');
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
        setProfileImage(null);
        setImageError('Failed to load profile image');
      } finally {
        setIsImageLoading(false);
      }
    };

    // Fetch quote
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/quote');
        if (response.ok) {
          const data = await response.json();
          setQuote(data.quote);
        } else {
          setQuote(null);
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
      }
    };

    fetchProfileImage();
    fetchQuote();

    window.addEventListener('mousemove', handleMouseMove);

    // Poll for image updates every 60 seconds
    const imageRefreshInterval = setInterval(fetchProfileImage, 600000);

    return () => {
      clearTimeout(timer);
      clearInterval(roleInterval);
      clearInterval(imageRefreshInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, []);

  const navigateToPage = (path) => {
    navigate(path);
  };

  const handleBlogRedirect = () => {
    window.open('/blog', '_blank');
  };

  return (
    <div className="portfolio-container">
      {/* Cursor Follower - Desktop Only */}
      <div
        className="cursor-follower"
        style={{
          left: mousePosition.x - 10,
          top: mousePosition.y - 10,
        }}
      />

      {/* Main Content */}
      <main className="portfolio-main">
        {/* Hero Section */}
        <section className="hero-section">
          <video
            className="hero-video"
            autoPlay
            loop
            muted
            playsInline
            src="/bg2.mp4"
          />
          <div className="hero-content">
            <div className={`hero-text ${isLoaded ? 'content-visible' : ''}`}>
              <div className="hero-left">
                <div className="hero-greeting">
                  <span className="greeting-label">Hello, I'm</span>
                  <h1 className="hero-name">Aaditiya Tyagi</h1>

                  <div className="role-rotator">
                    <span className="role-prefix">—</span>
                    <span className="role-text">{roles[currentRoleIndex]}</span>
                  </div>

                  <p className="hero-description">
                    Crafting digital experiences through clean code and thoughtful design.
                    I specialize in building scalable web applications that solve real-world
                    problems with modern technologies and best practices.
                  </p>

                  <div className="hero-actions">
                    <button
                      onClick={() => navigateToPage('/projects')}
                      className="primary-cta"
                    >
                      View Projects <ArrowUpRight size={16} />
                    </button>
                    <button
                      onClick={() => navigateToPage('/contact')}
                      className="primary-cta"
                    >
                      Get in Touch
                    </button>
                  </div>
                </div>
              </div>

              <div className="hero-right">
                <div className="profile-container">
                  <div className="profile-avatar">
                    {isImageLoading || imageError ? (
                      <div className="image-placeholder">AT</div>
                    ) : profileImage ? (
                      <img
                        src={profileImage}
                        alt="Aaditiya Tyagi"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%',
                        }}
                        onError={() => {
                          setImageError('Failed to load image');
                          setProfileImage(null);
                        }}
                      />
                    ) : (
                      <div className="image-placeholder">AT</div>
                    )}
                  </div>
                  <div className="profile-glow"></div>
                </div>

                <div className="quote-section">
                  {quote && (
                    <div className="quote-container">
                      <p className="quote-text">"{quote.content}"</p>
                      <p className="quote-author">— {quote.author}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="social-links">
              <a
                href="https://github.com/aaditiyatyagi"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <Github size={18} />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/aaditiya-tyagi-babb26290/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </a>
              <a href="mailto:contact@aaditiyatyagi.com" className="social-link">
                <Mail size={18} />
                <span>Email</span>
              </a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="content-section about-section">
          <div className="section-container">
            <div className="section-content"  style={{ cursor: 'pointer' }}>
              <About />
            </div>
            <button
              onClick={() => navigateToPage('/about')}
              className="section-nav-btn"
            >
              Read More About Me <ArrowUpRight size={16} />
            </button>
          </div>
        </section>

        {/* Projects Section */}
        <section className="content-section projects-section">
          <div className="section-container">
            <div className="section-content" style={{ cursor: 'pointer' }}>
              <Projects />
            </div>
            <button
              onClick={() => navigateToPage('/projects')}
              className="section-nav-btn"
            >
              View All Projects <ArrowUpRight size={16} />
            </button>
          </div>
        </section>

        {/* Blog Section */}
        <section className="content-section blog-section">
          <div className="section-container">
            <div className="section-header">
              <div className="section-info">
                <h2 className="section-title">Writing</h2>
                <p className="section-subtitle">Thoughts on development and technology</p>
              </div>
              <button
                onClick={handleBlogRedirect}
                className="section-nav-btn"
              >
                Visit Blog <ExternalLink size={16} />
              </button>
            </div>
            <div
              className="blog-intro"
              onClick={handleBlogRedirect}
              style={{ cursor: 'pointer' }}
            >
              <p className="blog-description">
                Discover insights, tutorials, and reflections on coding and innovation.
              </p>
            </div>
            <div
              className="featured-topics"
              onClick={handleBlogRedirect}
              style={{ cursor: 'pointer' }}
            >
              <h3 className="topics-title">Featured Topics</h3>
              <div className="topics-list">
                <span className="topic-item">React Development</span>
                <span className="topic-item">Node.js Best Practices</span>
                <span className="topic-item">UI/UX Design Trends</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="content-section contact-section">
          <div className="section-container">
            <div className="section-content" style={{ cursor: 'pointer' }}>
              <Contact />
            </div>
            <button
              onClick={() => navigateToPage('/contact')}
              className="section-nav-btn"
            >
              Get in Touch <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;