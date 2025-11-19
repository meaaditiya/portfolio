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
import { marked } from 'marked';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'isomorphic-dompurify';
;
import { useVisitor } from '../context/VisitorContext';
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
const { liveCount, visitorStats, isConnected } = useVisitor();
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

  // Helper function to render announcement content with inline images and videos
// Add this helper function with your other functions (before the return statement)
// Helper component for rendering markdown text consistently
const RenderMarkdownText = ({ content, captionFormat }) => {
  if (captionFormat === 'markdown') {
    const htmlContent = marked(content);
    
    return (
      <div
        className="announcement_caption_markdown"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(htmlContent, {
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
    );
  }
  return <p>{content}</p>;
};

// Main render function
const renderAnnouncementContent = (announcement) => {
  if (!announcement) return null;

  const content = announcement.caption;
  const captionFormat = announcement.captionFormat || 'markdown';

  // Check if announcement has inline images or videos
  const hasInlineMedia = 
    (announcement.captionImages && announcement.captionImages.length > 0) ||
    (announcement.captionVideos && announcement.captionVideos.length > 0);

  if (hasInlineMedia) {
    // Create maps for quick lookup
    const imageMap = {};
    const videoMap = {};

    // Map images by imageId
    if (announcement.captionImages) {
      announcement.captionImages.forEach(image => {
        if (image.imageId) {
          imageMap[image.imageId] = image;
        }
      });
    }

    // Map videos by embedId
    if (announcement.captionVideos) {
      announcement.captionVideos.forEach(video => {
        if (video.embedId) {
          videoMap[video.embedId] = video;
        }
      });
    }

    // Split content by image and video placeholders
    const parts = [];
    let currentIndex = 0;
    const placeholders = [];

    // Find image placeholders
    Object.keys(imageMap).forEach(imageId => {
      const placeholder = `[IMAGE:${imageId}]`;
      let searchIndex = 0;
      let foundIndex;

      while ((foundIndex = content.indexOf(placeholder, searchIndex)) !== -1) {
        placeholders.push({
          type: 'image',
          id: imageId,
          placeholder,
          startIndex: foundIndex,
          endIndex: foundIndex + placeholder.length,
          media: imageMap[imageId]
        });
        searchIndex = foundIndex + placeholder.length;
      }
    });

    // Find video placeholders
    Object.keys(videoMap).forEach(embedId => {
      const placeholder = `[VIDEO:${embedId}]`;
      let searchIndex = 0;
      let foundIndex;

      while ((foundIndex = content.indexOf(placeholder, searchIndex)) !== -1) {
        placeholders.push({
          type: 'video',
          id: embedId,
          placeholder,
          startIndex: foundIndex,
          endIndex: foundIndex + placeholder.length,
          media: videoMap[embedId]
        });
        searchIndex = foundIndex + placeholder.length;
      }
    });

    // Sort placeholders by position
    placeholders.sort((a, b) => a.startIndex - b.startIndex);

    // Build parts array
    placeholders.forEach((placeholderInfo, index) => {
      // Add text before this media
      if (placeholderInfo.startIndex > currentIndex) {
        const textContent = content.substring(currentIndex, placeholderInfo.startIndex);
        if (textContent.trim()) {
          parts.push({
            type: 'text',
            content: textContent.trim(),
            key: `text-${index}`
          });
        }
      }

      // Add the media
      parts.push({
        type: placeholderInfo.type,
        media: placeholderInfo.media,
        key: `${placeholderInfo.type}-${placeholderInfo.id}`
      });

      currentIndex = placeholderInfo.endIndex;
    });

    // Add remaining text
    if (currentIndex < content.length) {
      const remainingContent = content.substring(currentIndex);
      if (remainingContent.trim()) {
        parts.push({
          type: 'text',
          content: remainingContent.trim(),
          key: `text-final`
        });
      }
    }

    // If no placeholders found, render normally using renderedCaption
    if (parts.length === 0) {
      if (captionFormat === 'markdown' && announcement.renderedCaption) {
        return (
          <div 
            className="announcement_caption_unique_2024 announcement_caption_markdown"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(announcement.renderedCaption, {
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
        );
      }
      return <p className="announcement_caption_unique_2024">{content}</p>;
    }

    // Render mixed content - use renderedCaption for text parts if available
    return (
      <div className="announcement_caption_unique_2024 announcement_content_with_media">
        {parts.map(part => {
          if (part.type === 'text') {
            // Use backend-rendered caption if available, otherwise render client-side
            if (captionFormat === 'markdown' && announcement.renderedCaption) {
              // Extract and render the portion of renderedCaption for this text segment
              const htmlContent = marked(part.content);
              return (
                <div 
                  key={part.key}
                  className="announcement_caption_markdown"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(htmlContent, {
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
              );
            }
            return <p key={part.key}>{part.content}</p>;
          }
          
          if (part.type === 'image') {
            return (
              <div 
                key={part.key} 
                className={`announcement_inline_image announcement_image_${part.media.position || 'center'}`}
              >
                <img 
                  src={part.media.url} 
                  alt={part.media.alt || ''} 
                  loading="lazy" 
                />
                {part.media.caption && (
                  <p className="announcement_image_caption">{part.media.caption}</p>
                )}
              </div>
            );
          } 
          
          if (part.type === 'video') {
            return (
              <div 
                key={part.key} 
                className={`announcement_inline_video announcement_video_${part.media.position || 'center'}`}
              >
                <div className="announcement_video_wrapper">
                  <iframe
                    width="560"
                    height="315"
                    src={
                      part.media.platform === 'youtube'
                        ? `https://www.youtube.com/embed/${part.media.videoId}?rel=0&modestbranding=1${part.media.autoplay ? '&autoplay=1' : ''}${part.media.muted ? '&mute=1' : ''}`
                        : part.media.platform === 'vimeo'
                        ? `https://player.vimeo.com/video/${part.media.videoId}?title=0&byline=0&portrait=0${part.media.autoplay ? '&autoplay=1' : ''}${part.media.muted ? '&muted=1' : ''}`
                        : `https://www.dailymotion.com/embed/video/${part.media.videoId}?ui-highlight=444444&ui-logo=0${part.media.autoplay ? '&autoplay=1' : ''}${part.media.muted ? '&mute=1' : ''}`
                    }
                    title={part.media.title || ''}
                    frameBorder="0"
                    allow={
                      part.media.platform === 'youtube'
                        ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                        : part.media.platform === 'vimeo'
                        ? 'autoplay; fullscreen; picture-in-picture'
                        : 'autoplay; fullscreen'
                    }
                    allowFullScreen
                  ></iframe>
                </div>
                {part.media.caption && (
                  <p className="announcement_video_caption">{part.media.caption}</p>
                )}
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  }

  // No inline media - use pre-rendered caption from backend
  if (captionFormat === 'markdown' && announcement.renderedCaption) {
    return (
      <div 
        className="announcement_caption_unique_2024 announcement_caption_markdown"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(announcement.renderedCaption, {
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
    );
  }
  
  return <p className="announcement_caption_unique_2024">{content}</p>;
};
  return (
    <div className="portfolio-container">
      {/* Announcement Label - Shows when there are announcements */}
 {/* Announcement Badge Trigger */}
{!showAnnouncementOverlay && announcements.length > 0 && (
  <button 
    className="announcement_label_trigger"
    onClick={() => setShowAnnouncementOverlay(true)}
    aria-label={`${announcements.length} new announcements`}
  >
    <div className="announcement_bell_container">
      <Bell size={32} className="announcement_label_icon" />
      <div className="announcement_badge_count">
        {announcements.length}
      </div>
    </div>
  </button>
)}
{showAnnouncementOverlay && announcements.length > 0 && currentAnnouncement && (
  <div className="announcement_overlay_wrapper_unique_2024">
    <div 
      className="announcement_overlay_backdrop_unique_2024" 
      onClick={handleCloseAnnouncement}
    ></div>
    
    <div className="announcement_overlay_content_unique_2024">
      {/* Header */}
      <div className="announcement_overlay_header_unique_2024">
        <h3 className="announcement_overlay_header_title_unique_2024">
          Important Announcement
        </h3>
      
        <button 
          className="announcement_overlay_close_btn_unique_2024"
          onClick={handleCloseAnnouncement}
          aria-label="Close announcement"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Content Container */}
      <div className="announcement_overlay_container_unique_2024">
        <div className="announcement_card_unique_2024">
          {/* Title */}
          <h2 
            className="announcement_title_unique_2024"
            style={{ 
              color: currentAnnouncement.titleColor || '#1a1a1a' 
            }}
          >
            {currentAnnouncement.title}
          </h2>
          
          {/* Caption with inline media */}
          {renderAnnouncementContent(currentAnnouncement)}
          
          {/* Featured Image */}
          {currentAnnouncement.hasImage && announcementImages[currentAnnouncement._id] && (
            <div className="announcement_image_wrapper_unique_2024">
              <img 
                src={announcementImages[currentAnnouncement._id]}
                alt={currentAnnouncement.title}
                className="announcement_image_unique_2024"
              />
            </div>
          )}
          <div className="announcement_links_container_2024">
  
  {/* External Link */}
  {currentAnnouncement.link && currentAnnouncement.link.url && (
    <a 
      href={currentAnnouncement.link.url}
      target={currentAnnouncement.link.openInNewTab ? "_blank" : "_self"}
      rel={currentAnnouncement.link.openInNewTab ? "noopener noreferrer" : ""}
      className="announcement_link_unique_2024"
    >
      {currentAnnouncement.link.name || 'Learn More'} <ArrowUpRight size={16} />
    </a>
  )}

  {/* Document Download */}
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
      </div>
      
      {/* Slider Controls */}
      {announcements.length > 0 && (
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
       {/* Fixed Social Links - Right Side */}
<div className="aaditiya-connection-sidebar">
  <a
    href="https://github.com/meaaditiya"
    target="_blank"
    rel="noopener noreferrer"
    className="aaditiya-connection-node-vertical"
    title="GitHub"
  >
    <Github size={20} />
  </a>
  <a
    href="https://www.linkedin.com/in/aaditiya-tyagi-babb26290/"
    target="_blank"
    rel="noopener noreferrer"
    className="aaditiya-connection-node-vertical"
    title="LinkedIn"
  >
    <Linkedin size={20} />
  </a>
  <a 
    href="mailto:aaditiyatyagi123@gmail.com" 
    className="aaditiya-connection-node-vertical"
    title="Email"
  >
    <Mail size={20} />
  </a>
  <div className="aaditiya-connection-line"></div>
</div>

{/* Hero Section */}
/* Replace your Hero Section with this updated version */

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

          {/* Visitor Stats - Inline */}
          <div className="hero-visitor-stats">
            <div className="hero-stat-item">
              {isConnected && <span className="hero-live-dot"></span>}
              <Users size={16} />
              <span className="hero-stat-value">{liveCount}</span>
              
              <span className="hero-stat-label">live</span>
            </div>
         
            <span className="hero-stat-divider">•</span>
            <div className="hero-stat-item">
              <Globe size={16} />
              <span className="hero-stat-value">{visitorStats.totalVisitors}</span>
              <span className="hero-stat-label">visits</span>
            </div>
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