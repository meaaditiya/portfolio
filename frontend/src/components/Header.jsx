import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FaHome,
  FaUser,
  FaFileAlt,
  FaProjectDiagram,
  FaBlog,
  FaEnvelopeOpenText,
  FaRedo,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check fullscreen status on mount and when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  return (
    <header className="tyagi-header">
      <div className="tyagi-header-content">
        <div className="tyagi-logo-container">
          {/* Your logo content here */}
        </div>
        
        <nav className="tyagi-nav">
          {[
            { name: 'Home', icon: <FaHome />, path: '/' },
            { name: 'About', icon: <FaUser />, path: '/about' },
            { name: 'Posts', icon: <FaFileAlt />, path: '/posts' },
            { name: 'Projects', icon: <FaProjectDiagram />, path: '/projects' },
            { name: 'Blogs', icon: <FaBlog />, path: '/blog' },
            { name: 'Contact', icon: <FaEnvelopeOpenText />, path: '/contact' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`tyagi-nav-link ${currentPath === item.path ? 'tyagi-nav-link-active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Control buttons - only visible on desktop/laptop */}
        <div className="tyagi-control-buttons">
          <button
            onClick={handleRefresh}
            className="tyagi-control-btn"
            title="Refresh Page"
            aria-label="Refresh Page"
          >
            <FaRedo />
          </button>
          <button
            onClick={handleFullscreen}
            className="tyagi-control-btn"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;