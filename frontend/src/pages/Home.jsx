import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, ArrowRight,ArrowUpRight, Code, Database, Globe, FileText, ExternalLink, X, ChevronLeft, ChevronRight, Bell,Radio,Video,Clock,Users } from 'lucide-react';
import About from './About';
import Projects from './Projects';
import Contact from './Contact';
import profileImage from '../images/aadiprofile.png';
import profileImage2 from '../images/livestream.png';
import blogImage from '../images/blogimage.jpeg';
import weatherBackground from '../images/home.png';
import '../pagesCSS/Home.css';
import '../pagesCSS/AnnouncementOverlay.css';
import '../pagesCSS/homepage.css';
import DOMPurify from 'dompurify';

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
const [firstBlog, setFirstBlog] = useState(null);
const [isBlogLoading, setIsBlogLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);

    const roleInterval = setInterval(() => {
      setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length);
    }, 1000);

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

  const fetchAnnouncements = async (isManualOpen = false) => {
  try {
    const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/announcement/active');
    if (response.ok) {
      const data = await response.json();
      console.log('Announcements data:', data);
      
      if (data.announcements && data.announcements.length > 0) {
        // Sort announcements by priority
        const sortedAnnouncements = [...data.announcements].sort((a, b) => {
          const priorityA = a.priority || 999;
          const priorityB = b.priority || 999;
          return priorityA - priorityB;
        });
        
        // Store announcements WITH renderedCaption
        setAnnouncements(sortedAnnouncements);
        setHasAnnouncements(true);
        
        // Create direct image URLs
        const imageMap = {};
        sortedAnnouncements.forEach(announcement => {
          if (announcement.hasImage) {
            imageMap[announcement._id] = `https://connectwithaaditiyamg.onrender.com/api/announcement/${announcement._id}/image`;
            console.log(`Image URL set for ${announcement._id}:`, imageMap[announcement._id]);
          }
        });
        
        console.log('Final image map:', imageMap);
        setAnnouncementImages(imageMap);
        
        // Only auto-show if NOT manually opened AND not blocked by snooze
        if (!isManualOpen && !isAutoPopupBlocked()) {
          setShowAnnouncementOverlay(true);
          setCurrentAnnouncementIndex(0);
          
          // Auto-hide after 30 seconds
          setTimeout(() => {
            setShowAnnouncementOverlay(false);
          }, 30000);
        } else if (isManualOpen) {
          // Manual open - always show
          setShowAnnouncementOverlay(true);
          setCurrentAnnouncementIndex(0);
        } else {
          console.log('Auto-popup blocked by snooze');
        }
      }
    }
  } catch (error) {
    console.error('Error fetching announcements:', error);
  }
};
    // Fetch first blog
const fetchFirstBlog = async () => {
  try {
    const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/blogs?status=published&limit=1');
    if (response.ok) {
      const data = await response.json();
      if (data.blogs && data.blogs.length > 0) {
        setFirstBlog(data.blogs[0]);
      }
    }
  } catch (error) {
    console.error('Error fetching first blog:', error);
  } finally {
    setIsBlogLoading(false);
  }
};

fetchQuote();
fetchAnnouncements();
fetchFirstBlog(); // Add this line
    

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


const isAnnouncementSnoozed = (announcementId) => {
  const snoozeData = sessionStorage.getItem(`announcement_snooze_${announcementId}`);
  if (!snoozeData) return false;
  
  const snoozeUntil = parseInt(snoozeData, 10);
  const now = Date.now();
  
  if (now < snoozeUntil) {
    return true;
  } else {
    localStorage.removeItem(`announcement_snooze_${announcementId}`);
    return false;
  }
};

const isAutoPopupBlocked = () => {
  const blockData = sessionStorage.getItem('announcement_auto_popup_blocked');
  if (!blockData) return false;
  
  const blockUntil = parseInt(blockData, 10);
  const now = Date.now();
  
  if (now < blockUntil) {
    return true;
  } else {
    sessionStorage.removeItem('announcement_auto_popup_blocked');
    return false;
  }
};
  const handleOpenAnnouncement = () => {
    setShowAnnouncementOverlay(true);
    setCurrentAnnouncementIndex(0);
  };

const handleSnoozeAnnouncement = () => {
  if (currentAnnouncement) {
    const oneHourFromNow = Date.now() + (60 * 60 * 1000);
    sessionStorage.setItem('announcement_auto_popup_blocked', oneHourFromNow.toString());
    setShowAnnouncementOverlay(false);
    console.log('Auto-popup snoozed for 1 hour - can still open manually via bell button');
  }
};

// Bell button handler - always shows announcements
const handleBellButtonClick = () => {
  if (announcements.length > 0) {
    setShowAnnouncementOverlay(true);
    setCurrentAnnouncementIndex(0);
  } else {
    fetchAnnouncements(true); // Manual open
  }
};

// Close handler
const handleCloseAnnouncement = () => {
  setShowAnnouncementOverlay(false);
};

// Navigation handlers
const handlePrevAnnouncement = () => {
  setCurrentAnnouncementIndex(prev => Math.max(0, prev - 1));
};

const handleNextAnnouncement = () => {
  setCurrentAnnouncementIndex(prev => Math.min(announcements.length - 1, prev + 1));
};
  const currentAnnouncement = announcements[currentAnnouncementIndex];

  return (
    <div className="portfolio-container">
      {/* Announcement Label - Shows when there are announcements */}
    {hasAnnouncements && (
      <button 
        className="announcement_label_trigger" 
        onClick={handleBellButtonClick}
        aria-label="View announcements"
      >
        <div className="announcement_label_pulse"></div>
        <Bell className="announcement_label_icon" size={16} />
        <span className="announcement_label_text">News</span>
      </button>
    )}

    {/* Announcement Overlay */}
    {showAnnouncementOverlay && announcements.length > 0 && currentAnnouncement && (
      <div className="announcement_overlay_wrapper_unique_2024">
        <div 
          className="announcement_overlay_backdrop_unique_2024" 
          onClick={handleCloseAnnouncement}
        ></div>
        
        <div className="announcement_overlay_content_unique_2024">
          
          
          {/* Close Button */}
          <button 
            className="announcement_overlay_close_btn_unique_2024"
            onClick={handleCloseAnnouncement}
            aria-label="Close announcement"
          >
            <X size={20} />
          </button>
          
          {/* Content Container */}
      <div className="announcement_overlay_container_unique_2024">
  <div className="announcement_card_unique_2024">
    {/* Title with dynamic color */}
    <h2 
      className="announcement_title_unique_2024"
      style={{ 
        color: currentAnnouncement.titleColor || '#1a1a1a' 
      }}
    >
      {currentAnnouncement.title}
    </h2>
    
    {/* Caption - Render as HTML if markdown, otherwise plain text */}
    {currentAnnouncement.renderedCaption ? (
      <div 
        className="announcement_caption_unique_2024 announcement_caption_markdown"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(currentAnnouncement.renderedCaption, {
            ALLOWED_TAGS: [
              'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
              'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'ul', 'ol', 'li',
              'blockquote', 'pre', 'code',
              'a', 'span', 'div',
              'table', 'thead', 'tbody', 'tr', 'th', 'td',
              'mark', 'small', 'sub', 'sup'
            ],
            ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel', 'color', 'bgcolor']
          })
        }}
      />
    ) : currentAnnouncement.caption ? (
      <p className="announcement_caption_unique_2024">
        {currentAnnouncement.caption}
      </p>
    ) : null}
    
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
              {/* Snooze Button */}
          <button 
            className="announcement_overlay_snooze_btn_unique_2024"
            onClick={handleSnoozeAnnouncement}
            aria-label="Snooze announcements for 1 hour"
            title="Snooze for 1 hour"
          >
            <Clock size={20} />
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
          <section className="aaditiya-hero-stage">
      <div className="aaditiya-hero-orchestration">
        <div className={`aaditiya-narrative-flow ${isLoaded ? 'aaditiya-reveal-animate' : ''}`}>
          <div className="aaditiya-introduction-panel">
            <div className="aaditiya-greeting-composition">
              <span className="aaditiya-salutation-tag">Hello, I'm</span>
              <h1 className="aaditiya-identity-signature">Aaditiya Tyagi</h1>

              <div className="aaditiya-profession-carousel">
                <span className="aaditiya-role-delimiter">—</span>
                <span className="aaditiya-role-display">{roles[currentRoleIndex]}</span>
              </div>

              <p className="aaditiya-mission-statement">
                Crafting digital experiences through clean code and thoughtful design.
                I specialize in building scalable web applications that solve real-world
                problems with modern technologies and best practices.
              </p>

              <div className="aaditiya-action-cluster">
                <button
                  onClick={() => navigateToPage('/projects')}
                  className="aaditiya-primary-catalyst"
                >
                  Projects <ArrowUpRight size={16} />
                </button>
                <button
                  onClick={() => navigateToPage('/contact')}
                  className="aaditiya-primary-catalyst"
                >
                  Contact<ArrowUpRight size={16}/>
                </button>
              </div>
            </div>
          </div>

          <div className="aaditiya-showcase-panel">
        <div className="aaditiya-portrait-enclosure">
          <div className="aaditiya-portrait-frame">
            <img
              src={profileImage}
              alt="Aaditiya Tyagi"
              className="aaditiya-portrait-image"
            />
            {/* Decorative Corner Elements */}
            <div className="aaditiya-corner-accent aaditiya-corner-top-left"></div>
            <div className="aaditiya-corner-accent aaditiya-corner-top-right"></div>
            <div className="aaditiya-corner-accent aaditiya-corner-bottom-left"></div>
            <div className="aaditiya-corner-accent aaditiya-corner-bottom-right"></div>
          </div>
          <div className="aaditiya-luminous-aura"></div>
        </div>

            <div className="aaditiya-wisdom-block">
              <div className="aaditiya-wisdom-wrapper">
                <p className="aaditiya-wisdom-inscription">
                  "{quote?.content || 'A project is like a piece of art for the developer, crafted with passion and love.'}"
                </p>
                <p className="aaditiya-wisdom-attribution">
                  — {quote?.author || "Etched by my soul's ink"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="aaditiya-connection-matrix">
          <a
            href="https://github.com/meaaditiya"
            target="_blank"
            rel="noopener noreferrer"
            className="aaditiya-connection-node"
          >
            <Github size={18} />
            <span>GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/aaditiya-tyagi-babb26290/"
            target="_blank"
            rel="noopener noreferrer"
            className="aaditiya-connection-node"
          >
            <Linkedin size={18} />
            <span>LinkedIn</span>
          </a>
          <a href="mailto:aaditiyatyagi123@gmail.com" className="aaditiya-connection-node">
            <Mail size={18} />
            <span>Email</span>
          </a>
        </div>
      </div>
    </section>
        {/* About Section */}
        <section className="newabout-section content-section about-section">
          <div className="section-container">
            <div className="section-content"  style={{ cursor: 'pointer' }}>
              <About />
            </div>
          
          </div>
        </section>

        {/* Projects Section */}
        <section className="content-section projects-section">
          <div className="section-container">
            <div className="section-content" style={{ cursor: 'pointer' }}>
              <Projects />
            </div>
       
          </div>
        </section>

   {/* Blog Section */}
<section className="content-section contact-section">
    <h1 className="pos-blog tyagi-hero-title">
                 Writings and 
              <span className="tyagi-hero-gradient"> Blogs</span>
            </h1>
  <div className="section-container">
    <div className="minimal-blog-layout">
      {/* Left - Image */}
      <div className="minimal-blog-image">
        {(isBlogLoading || !firstBlog) ? (
          <img 
            src={blogImage}
            alt="Blog placeholder"
            className="minimal-blog-img"
          />
        ) : firstBlog.featuredImage ? (
          <img 
            src={firstBlog.featuredImage} 
            alt={firstBlog.title}
            className="minimal-blog-img"
          />
        ) : (
          <img 
            src={blogImage}
            alt="Blog placeholder"
            className="minimal-blog-img"
          />
        )}
      </div>

      {/* Right - Content */}
      <div className="minimal-blog-content">
        <p className="minimal-blog-label">Writing with Passion</p>
        
        {(isBlogLoading || !firstBlog) ? (
          <>
            <h3 className="minimal-blog-title">Explore My Thoughts</h3>
            
            <p className="minimal-blog-excerpt">
              Welcome to my blog section where I share insights, experiences, and knowledge about web development, coding practices, and technology trends. Stay tuned for exciting content coming soon!
            </p>
            
            <div className="minimal-blog-actions">
              <button 
                onClick={handleBlogRedirect}
                className="minimal-all-btn"
              >
                Visit Blog
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="minimal-blog-title">{firstBlog.title}</h3>
            
            <p className="minimal-blog-excerpt">
              {firstBlog.summary}
            </p>
            
            <div className="minimal-blog-actions">
              <button 
                onClick={() => navigate(`/blog/${firstBlog.slug || firstBlog._id}`)}
                className="minimal-read-btn"
              >
                Read Article
              </button>
              
              <button 
                onClick={handleBlogRedirect}
                className="minimal-all-btn"
              >
                All Blogs
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
</section>
<section className="stream-section content-section">
    <div className="tyagi-hero">
        <div className="tyagi-hero-overlay"></div>
        <div className="tyagi-hero-content">
          <div className="tyagi-hero-text">
            <div className="tyagi-hero-badge">
              <Radio size={16} />
              <span>LIVE STREAMING</span>
            </div>
            <h1 className="tyagi-hero-title">
              Connect Through
              <span className="tyagi-hero-gradient"> Live Streams</span>
            </h1>
            <p className="tyagi-hero-description">
              Join our community for live sessions, workshops, and interactive discussions. 
              Experience real-time engagement with content that matters.
            </p>
            <div className="tyagi-hero-stats">
              <div className="tyagi-stat-item">
                <Users size={20} />
                <div>
                  <div className="tyagi-stat-number">100+</div>
                  <div className="tyagi-stat-label">Active Viewers</div>
                </div>
              </div>
              <div className="tyagi-stat-divider"></div>
              <div className="tyagi-stat-item">
                <Video size={20} />
                <div>
                  <div className="tyagi-stat-number">10+</div>
                  <div className="tyagi-stat-label">Streams Hosted</div>
                </div>
              </div>
              <div className="tyagi-stat-divider"></div>
              <div className="tyagi-stat-item">
                <Clock size={20} />
                <div>
                  <div className="tyagi-stat-number">10+</div>
                  <div className="tyagi-stat-label">Hours of Content</div>
                </div>
              </div>
              <button 
  onClick={() => navigate('/stream')}
  style={{
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'opacity 0.2s'
  }}
  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
  onMouseLeave={(e) => e.target.style.opacity = '1'}
>
  Go <ArrowRight size={14} />
</button>
            </div>
          </div>
          <div className="tyagi-hero-image">
            <div className="tyagi-hero-image-wrapper">
              <img 
                src={profileImage2}
                alt="Live streaming" 
                className="tyagi-hero-img"
              />
              <div className="tyagi-hero-image-glow"></div>
            </div>
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
          
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;