import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../pagesCSS/Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigateToPage = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (path, index) => {
    setActiveButton(index);
    navigateToPage(path);
    setTimeout(() => {
      setActiveButton(null);
    }, 600);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Posts', path: '/posts' },
    { name: 'Projects', path: '/projects' },
    { name: 'Blogs', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'Stream', path: '/stream' },
  ];

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        
        .stylish-at-logo {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.1rem;
          z-index: 10;
          min-width: 0;
          flex-shrink: 0;
        }
        
        .at-logo-text {
          font-family: 'Great Vibes', cursive;
          font-size: 25px;
          font-weight: normal;
          background: linear-gradient(90deg, #000, #444, #000);
          background-size: 300% 100%;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-stroke: 1px #000;
         
          text-transform: uppercase;
          line-height: 0.6;
          margin: 0;
          transition: transform 0.3s ease;
          
        }
        
        .at-subtext {
          font-family: 'Great Vibes', cursive;
          font-size: 18px;
          margin-top: 0px;
          color: #000000cc;
          letter-spacing: 0.3px;
          text-align: center;
          white-space: nowrap;
          transition: opacity 0.3s ease;
          margin-bottom:-10px;
        }
        
        .stylish-at-logo:hover .at-logo-text {
          transform: scale(1.05);
        }
        
        .stylish-at-logo:hover .at-subtext {
          opacity: 0.8;
        }
        
        @keyframes moveGradient {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        
        @keyframes slideAnimation {
          0% {
            transform: translateX(0px);
          }
          25% {
            transform: translateX(5px);
          }
          50% {
            transform: translateX(0px);
          }
          75% {
            transform: translateX(-5px);
          }
          100% {
            transform: translateX(0px);
          }
        }

        @keyframes checkmarkAnimation {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
        
        /* Navigation Items - Enhanced Styles */
        .nav-item {
          border: none;
          background-color: transparent;
          cursor: pointer;
          margin: 0;
          position: relative;
          transition: all 300ms ease-out;
          box-shadow: inset 0px 0px 0px -15px #000;
          padding: 0.5rem 1.2rem;
          border-radius: 0.5rem;
          font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .nav-item:hover,
        {
          color: #000;
          box-shadow: inset 0px -20px 0px -15px #000;
          outline: none;
        }

        .nav-item::after {
          content: '✔';
          margin-left: 0.5rem;
          display: inline-block;
          color: #000;
          position: absolute;
          transform: translateY(10px);
          opacity: 0;
          transition: all 200ms ease-out;
          font-weight: bold;
        }

        .nav-item-active::after,
        .nav-item.active-feedback::after {
          opacity: 1;
          transform: translateY(-2px);
          animation: checkmarkAnimation 200ms ease-out;
        }

        .nav-item-active {
          color: #000;
          box-shadow: inset 0px -20px 0px -18px #000;
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
          .at-logo-text {
            font-size: 25px;
          }
          .at-subtext {
            font-size: 18px;
          }
        }

        @media (max-width: 829px) {
          .at-subtext {
            display: none;
            font-size: 18px;
            letter-spacing: 0.2px;
          }
        }

        @media (max-width: 768px) {
          .at-logo-text {
            font-size: 32px;
          }
          .at-subtext {
            display: none;
            font-size: 18px;
            letter-spacing: 0.2px;
          }
          .stylish-at-logo {
            padding: 0.05rem;
          }
        }
        
        @media (max-width: 680px) {
          .stylish-at-logo {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateX(-50%) translateY(-50%);
          }
        }
        
        @media (max-width: 640px) {
          .at-logo-text {
            font-size: 30px;
          }
          .at-subtext {
            font-size: 18px;
          }
        }
        
        @media (max-width: 560px) {
          .at-logo-text {
            font-size: 28px;
          }
          .at-subtext {
            font-size: 18px;
            margin-top: 0px;
          }
        }
        
        @media (max-width: 480px) {
          .at-logo-text {
            font-size: 26px;
          }
          .at-subtext {
            font-size: 18px;
            letter-spacing: 0px;
          }
          
          @keyframes slideAnimation {
            0%, 100% {
              transform: translateX(0px);
            }
            25% {
              transform: translateX(2px);
            }
            75% {
              transform: translateX(-2px);
            }
          }
        }
        
        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .at-logo-text,
          .at-subtext {
            animation: none;
          }
        }
        
        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .at-logo-text {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }

        /* Mobile Backdrop - Minimal & Effective */
        .mobile-menu-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          animation: fadeInBackdrop 200ms ease-out;
          z-index: 8;
        }

        @keyframes fadeInBackdrop {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
          }
        }
      `}</style>

      <header className="portfolio-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="stylish-at-logo">
              <div className="at-logo-text">AT</div>
            </div>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="main-navigation">
            {navItems.map((item, index) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path, index)}
                className={`nav-item ${currentPath === item.path ? 'nav-item-active' : ''} ${activeButton === index ? 'active-feedback' : ''}`}
              >
                <span className="nav-label">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Header Controls with Stylish AT Logo */}
          <div className="header-controls">
            {/* Stylish AT Logo */}
            <div className="stylish-at-logo">
              <div className="at-subtext">Aaditiya Tyagi</div>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      <div className={`mobile-sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-initials">AT</span>
              <div className="logo-text">
                <span className="logo-name">Aaditiya Tyagi</span>
                <span className="logo-role">keep Learning</span>
              </div>
            </div>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>

          <nav className="sidebar-navigation">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigateToPage(item.path)}
                className={`sidebar-nav-item ${currentPath === item.path ? 'active' : ''}`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={toggleMobileMenu}></div>
      )}
    </>
  );
};

export default Header;