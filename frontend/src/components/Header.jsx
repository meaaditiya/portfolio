import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from "lucide-react";
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
const pathSegments = currentPath.split('/').filter(Boolean);
const showBackButton = pathSegments.length >= 2;

const handleBack = () => {
  navigate(-1);
};
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
    { name: 'Gallery', path: '/posts' },
    { name: 'Projects', path: '/projects' },
    { name: 'Resources', path: '/resources' },
    {name: 'Refer Me', path : '/referme'},
    { name: 'Blogs', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'Stream', path: '/stream' },
   {name: <User size={18} />, path: '/auth'},



  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .portfolio-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: ;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
         background: var(--color-white);
          z-index: 1000;
          height: 55px;
          display: flex;
          align-items: center;
          padding: 0 2rem;
        }

        .header-content {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
.header-content {
  pointer-events: none;
}

.header-content > * {
  pointer-events: auto;
}
        .logo-section {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          z-index: 0;
        }

        .stylish-at-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position:relative;
          top:4px;
        }
        
        .at-logo-text {
          font-family: 'Great Vibes', cursive;
          font-size: 24px;
          font-weight: normal;
          background: linear-gradient(90deg, #000, #444, #000);
          background-size: 300% 100%;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-stroke: 1px #000;
          text-transform: uppercase;
          line-height: 1;
          transition: transform 0.3s ease;
        }
        
        .at-subtext {
          font-family: 'Great Vibes', cursive;
          font-size: 20px;
          margin-top: 2px;
          color: #000000cc;
          letter-spacing: 0.3px;
          text-align: center;
          white-space: nowrap;
          transition: opacity 0.3s ease;
        }
        
        .stylish-at-logo:hover .at-logo-text {
          transform: scale(1.05);
        }
        
        .stylish-at-logo:hover .at-subtext {
          opacity: 0.8;
        }

        /* Desktop Navigation */
        .main-navigation {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          justify-content: center;
          max-width: 800px;
        }

        .nav-item {
          border: none;
          background-color: transparent;
          cursor: pointer;
          position: relative;
          transition: all 300ms ease-out;
          box-shadow: inset 0px 0px 0px -15px #000;
          padding: 0.4rem 0.9rem;
          border-radius: 0.5rem;
          font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #333;
          white-space: nowrap;
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
          box-shadow: inset 0px -20px 0px -19px #000;
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

        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 1001;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 24px;
        }

        .hamburger span {
          display: block;
          height: 2px;
          background: #000;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .mobile-menu-toggle.active .hamburger span:nth-child(1) {
          transform: rotate(45deg) translate(7px, 7px);
        }

        .mobile-menu-toggle.active .hamburger span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-toggle.active .hamburger span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        /* Mobile Navigation — frosted glass overlay */
        .mobile-nav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(26px) saturate(160%);
          -webkit-backdrop-filter: blur(26px) saturate(160%);
          z-index: 999;
          display: flex;
          flex-direction: column;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
        }

        .mobile-nav-overlay.active {
          opacity: 1;
          pointer-events: all;
        }

        .mobile-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          flex-shrink: 0;
        }

        .mobile-nav-title {
          font-family: 'Great Vibes', cursive;
          font-size: 24px;
          color: rgba(0, 0, 0, 0.4);
        }

        .mobile-nav-close {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 26px;
          font-weight: 200;
          line-height: 1;
          color: #111;
          padding: 0.25rem 0.5rem;
          transition: transform 0.25s ease, opacity 0.2s ease;
        }

        .mobile-nav-close:active {
          transform: rotate(90deg);
          opacity: 0.6;
        }

        .mobile-nav-list {
          list-style: none;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 1rem 1.5rem 3rem;
          overflow-y: auto;
        }

        .mobile-nav-list-item {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .mobile-nav-overlay.active .mobile-nav-list-item {
          opacity: 1;
          transform: translateY(0);
        }

        .mobile-nav-link {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
          font-size: 21px;
          font-weight: 500;
          letter-spacing: 0.2px;
          color: rgba(17, 17, 17, 0.65);
          padding: 0.5rem 0.25rem;
          position: relative;
          transition: color 0.25s ease;
        }

        .mobile-nav-link::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 0;
          height: 1px;
          background: #111;
          transform: translateX(-50%);
          transition: width 0.3s ease;
        }

        .mobile-nav-link:active {
          color: #111;
        }

        .mobile-nav-link.active {
          color: #111;
          font-weight: 700;
        }

        .mobile-nav-link.active::after {
          width: 60%;
        }

        @media (min-width: 769px) {
          .mobile-nav-overlay {
            display: none;
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .nav-item {
            padding: 0.4rem 0.8rem;
            font-size: 13px;
          }
        }

        @media (max-width: 900px) {
          .portfolio-header {
            height: 52px;
            padding: 0 1.5rem;
          }

          .at-logo-text {
            font-size: 22px;
          }

          .at-subtext {
            font-size: 20px;
          }

          .main-navigation {
            gap: 0.3rem;
          }

          .nav-item {
            padding: 0.35rem 0.7rem;
            font-size: 12px;
          }
        }

        @media (max-width: 768px) {
          .portfolio-header {
            height: 48px;
            padding: 0 1rem;
          }
.back-button {
  font-size: 24px;
  padding: 0.4rem;
  margin-right: 0.3rem;
}

          .main-navigation {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .at-subtext {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .portfolio-header {
            height: 45px;
            padding: 0 1rem;
          }
.back-button {
  font-size: 22px;
  padding: 0.3rem;
}
          .at-logo-text {
            font-size: 20px;
          }

          .mobile-nav-panel {
            width: min(82vw, 300px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
          /* Back Button */
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #333;
  font-size: 45px;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
  opacity: 0.7;
  margin-right: 0.5rem;
  line-height: 3;
  font-weight: 100;
  position: relative;
  top:-2px;
  left:-10px;
}

.back-button:hover {
  opacity: 1;
  transform: translateX(-2px);
  color: #000;
}

.back-button:active {
  transform: translateX(-1px);
}
      `}</style>

      <header className="portfolio-header">
        <div className="header-content">
        
           <div className="logo-section">
  {showBackButton && (
    <button className="back-button" onClick={handleBack} aria-label="Go back">
      ‹
    </button>
  )}
  <div className="stylish-at-logo">
    <div className="at-logo-text">AT</div>
  </div>
</div>
          {/* Desktop Navigation */}
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

          <div className="header-controls">
            <div className="stylish-at-logo">
              <div className="at-subtext">Aaditiya Tyagi</div>
            </div>
            
            <button 
              className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
              onClick={toggleMobileMenu}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation — frosted glass overlay */}
      <div
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
      >
        <div className="mobile-nav-header">
          <span className="mobile-nav-title">Menu</span>
          <button className="mobile-nav-close" onClick={toggleMobileMenu} aria-label="Close menu">
            ×
          </button>
        </div>
        <ul className="mobile-nav-list">
          {navItems.map((item, index) => (
            <li
              key={item.path}
              className="mobile-nav-list-item"
              style={{ transitionDelay: isMobileMenuOpen ? `${index * 40}ms` : '0ms' }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToPage(item.path);
                }}
                className={`mobile-nav-link ${currentPath === item.path ? 'active' : ''}`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Header;