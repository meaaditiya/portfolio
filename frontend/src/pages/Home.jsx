import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, ArrowUpRight, Code, Database, Globe, FileText, ExternalLink, X, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import About from './About';
import Projects from './Projects';
import Contact from './Contact';
import profileImage from '../images/aadiprofile.png';
import weatherBackground from '../images/home.png';
import '../pagesCSS/Home.css';
import '../pagesCSS/AnnouncementOverlay.css';


const Home = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [quote, setQuote] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementOverlay, setShowAnnouncementOverlay] = useState(false);
  const [announcementImages, setAnnouncementImages] = useState({});
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [hasAnnouncements, setHasAnnouncements] = useState(false);
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

     const fetchAnnouncements = async () => {
      try {
        const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/announcement/active');
        if (response.ok) {
          const data = await response.json();
          console.log('Announcements data:', data);
          
          if (data.announcements && data.announcements.length > 0) {
            // Sort announcements by priority (ascending: 1, 2, 3...)
            const sortedAnnouncements = [...data.announcements].sort((a, b) => {
              const priorityA = a.priority || 999;
              const priorityB = b.priority || 999;
              return priorityA - priorityB;
            });
            
            setAnnouncements(sortedAnnouncements);
            setHasAnnouncements(true);
            
            // Create direct image URLs instead of blobs
            const imageMap = {};
            sortedAnnouncements.forEach(announcement => {
              if (announcement.hasImage) {
                imageMap[announcement._id] = `https://connectwithaaditiyamg.onrender.com/api/announcement/${announcement._id}/image`;
                console.log(`Image URL set for ${announcement._id}:`, imageMap[announcement._id]);
              }
            });
            
            console.log('Final image map:', imageMap);
            setAnnouncementImages(imageMap);
            setShowAnnouncementOverlay(true);
            setCurrentAnnouncementIndex(0);
            
            // Auto-hide after 30 seconds
            setTimeout(() => {
              setShowAnnouncementOverlay(false);
            }, 30000);
          }
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    fetchQuote();
    fetchAnnouncements();

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timer);
      clearInterval(roleInterval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const navigateToPage = (path) => {
    navigate(path);
  };

  const handleBlogRedirect = () => {
    window.open('/blog', '_blank');
  };

  const handleCloseAnnouncement = () => {
    setShowAnnouncementOverlay(false);
    // Cleanup blob URLs
    Object.values(announcementImages).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
  };

  const handleOpenAnnouncement = () => {
    setShowAnnouncementOverlay(true);
    setCurrentAnnouncementIndex(0);
  };

  const handleNextAnnouncement = () => {
    setCurrentAnnouncementIndex((prev) => 
      prev < announcements.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrevAnnouncement = () => {
    setCurrentAnnouncementIndex((prev) => 
      prev > 0 ? prev - 1 : prev
    );
  };

  const currentAnnouncement = announcements[currentAnnouncementIndex];

  return (
    <div className="portfolio-container">
      {/* Announcement Label - Shows when there are announcements */}
      {hasAnnouncements && !showAnnouncementOverlay && (
        <button 
          className="announcement_label_trigger"
          onClick={handleOpenAnnouncement}
          aria-label="View announcements"
        >
          <Bell size={16} className="announcement_label_icon" />
          <span className="announcement_label_text">NEW</span>
          <span className="announcement_label_pulse"></span>
        </button>
      )}

      {/* Announcement Overlay */}
      {showAnnouncementOverlay && announcements.length > 0 && currentAnnouncement && (
        <div className="announcement_overlay_wrapper_unique_2024">
          <div className="announcement_overlay_backdrop_unique_2024" onClick={handleCloseAnnouncement}></div>
          <div className="announcement_overlay_content_unique_2024">
            <button 
              className="announcement_overlay_close_btn_unique_2024"
              onClick={handleCloseAnnouncement}
              aria-label="Close announcement"
            >
              <X size={20} />
            </button>
            
            <div className="announcement_overlay_container_unique_2024">
              <div className="announcement_card_unique_2024">
                <h2 className="announcement_title_unique_2024">{currentAnnouncement.title}</h2>
                
                {currentAnnouncement.caption && (
                  <p className="announcement_caption_unique_2024">{currentAnnouncement.caption}</p>
                )}
                
                {currentAnnouncement.hasImage && announcementImages[currentAnnouncement._id] && (
                  <div className="announcement_image_wrapper_unique_2024">
                    <img 
                      src={announcementImages[currentAnnouncement._id]}
                      alt={currentAnnouncement.title}
                      className="announcement_image_unique_2024"
                    />
                  </div>
                )}
                
                {currentAnnouncement.link && (
                  <a 
                    href={currentAnnouncement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="announcement_link_unique_2024"
                  >
                    Visit <ArrowUpRight size={16} />
                  </a>
                )}
                
                {currentAnnouncement.hasDocument && (
                  <a 
                    href={`https://connectwithaaditiyamg.onrender.com/api/announcement/${currentAnnouncement._id}/document`}
                    download
                    className="announcement_document_link_unique_2024"
                  >
                    <FileText size={16} />
                    Download Document
                  </a>
                )}
              </div>
            </div>

            {/* Slider Controls */}
            {announcements.length > 1 && (
              <div className="announcement_slider_controls_unique_2024">
                <button
                  className="announcement_slider_btn_unique_2024"
                  onClick={handlePrevAnnouncement}
                  disabled={currentAnnouncementIndex === 0}
                  aria-label="Previous announcement"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="announcement_slider_dots_unique_2024">
                  {announcements.map((_, index) => (
                    <button
                      key={index}
                      className={`announcement_slider_dot_unique_2024 ${
                        index === currentAnnouncementIndex ? 'active' : ''
                      }`}
                      onClick={() => setCurrentAnnouncementIndex(index)}
                      aria-label={`Go to announcement ${index + 1}`}
                    />
                  ))}
                </div>
                
                <button
                  className="announcement_slider_btn_unique_2024"
                  onClick={handleNextAnnouncement}
                  disabled={currentAnnouncementIndex === announcements.length - 1}
                  aria-label="Next announcement"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
        {/* Hero Section with Weather Background */}
        <section className="hero-section">
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
                      Get in Touch <ArrowUpRight size={16}/>
                    </button>
                  </div>
                </div>
              </div>

              <div className="hero-right">
                <div className="profile-container">
                  <div className="profile-avatar">
                    <img
                      src={profileImage}
                      alt="Aaditiya Tyagi"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                    />
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
                href="https://github.com/meaaditiya"
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
              <a href="aaditiyatyagi123@gmail.com" className="social-link">
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