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
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
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

        .nav-item:hover {
          color: #000;
          box-shadow: inset 0px -20px 0px -18.5px #000;
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

        /* Circular Mobile Menu */
        .circular-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .circular-menu-overlay.active {
          opacity: 1;
          pointer-events: all;
        }

        .circular-menu-container {
          position: relative;
          width: 320px;
          height: 320px;
          transform: scale(0.8);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .circular-menu-overlay.active .circular-menu-container {
          transform: scale(1);
          opacity: 1;
        }

        .menu-center {
          position: relative;
          top: 10%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90px;
          height: 90px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          z-index: 10;
        }

        .close-icon {
          font-size: 38px;
          color: #000;
          font-weight: 350;
          line-height: 1;
          position:relative;
          top:-2px;
        }

        .circular-nav-item {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 90px;
          height: 90px;
          margin: -45px 0 0 -45px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .circular-nav-item:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.25);
          border-color: #000;
        }

        .circular-nav-item.active {
          background: #000;
          color: white;
        }

        .circular-nav-item span {
          font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
        }

        .circular-nav-item.active span {
          color: white;
        }

        /* Position items in a circle */
        .circular-nav-item:nth-child(1) { transform: translate(0, -130px); }
        .circular-nav-item:nth-child(2) { transform: translate(92px, -92px); }
        .circular-nav-item:nth-child(3) { transform: translate(130px, 0); }
        .circular-nav-item:nth-child(4) { transform: translate(92px, 92px); }
        .circular-nav-item:nth-child(5) { transform: translate(0, 130px); }
        .circular-nav-item:nth-child(6) { transform: translate(-92px, 92px); }
        .circular-nav-item:nth-child(7) { transform: translate(-130px, 0); }
        .circular-nav-item:nth-child(8) { transform: translate(-92px, -92px); }

        .circular-nav-item:nth-child(1):hover { transform: translate(0, -130px) scale(1.1); }
        .circular-nav-item:nth-child(2):hover { transform: translate(92px, -92px) scale(1.1); }
        .circular-nav-item:nth-child(3):hover { transform: translate(130px, 0) scale(1.1); }
        .circular-nav-item:nth-child(4):hover { transform: translate(92px, 92px) scale(1.1); }
        .circular-nav-item:nth-child(5):hover { transform: translate(0, 130px) scale(1.1); }
        .circular-nav-item:nth-child(6):hover { transform: translate(-92px, 92px) scale(1.1); }
        .circular-nav-item:nth-child(7):hover { transform: translate(-130px, 0) scale(1.1); }
        .circular-nav-item:nth-child(8):hover { transform: translate(-92px, -92px) scale(1.1); }

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
  .back-button {
  pointer-events: none;
}

.back-button > * {
  pointer-events: auto;
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

          .circular-menu-container {
            width: 280px;
            height: 280px;
          }

          .circular-nav-item {
            width: 75px;
            height: 75px;
            margin: -37.5px 0 0 -37.5px;
          }

          .circular-nav-item span {
            font-size: 11px;
          }

          .circular-nav-item:nth-child(1) { transform: translate(0, -110px); }
          .circular-nav-item:nth-child(2) { transform: translate(78px, -78px); }
          .circular-nav-item:nth-child(3) { transform: translate(110px, 0); }
          .circular-nav-item:nth-child(4) { transform: translate(78px, 78px); }
          .circular-nav-item:nth-child(5) { transform: translate(0, 110px); }
          .circular-nav-item:nth-child(6) { transform: translate(-78px, 78px); }
          .circular-nav-item:nth-child(7) { transform: translate(-110px, 0); }
          .circular-nav-item:nth-child(8) { transform: translate(-78px, -78px); }

          .circular-nav-item:nth-child(1):hover { transform: translate(0, -110px) scale(1.1); }
          .circular-nav-item:nth-child(2):hover { transform: translate(78px, -78px) scale(1.1); }
          .circular-nav-item:nth-child(3):hover { transform: translate(110px, 0) scale(1.1); }
          .circular-nav-item:nth-child(4):hover { transform: translate(78px, 78px) scale(1.1); }
          .circular-nav-item:nth-child(5):hover { transform: translate(0, 110px) scale(1.1); }
          .circular-nav-item:nth-child(6):hover { transform: translate(-78px, 78px) scale(1.1); }
          .circular-nav-item:nth-child(7):hover { transform: translate(-110px, 0) scale(1.1); }
          .circular-nav-item:nth-child(8):hover { transform: translate(-78px, -78px) scale(1.1); }
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

      {/* Circular Mobile Menu */}
      <div className={`circular-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="circular-menu-container">
          
          
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigateToPage(item.path)}
              className={`circular-nav-item ${currentPath === item.path ? 'active' : ''}`}
            >
              <span>{item.name}</span>
            </button>
          ))}
          <div className="circular-nav-item" onClick={toggleMobileMenu}>
            <span className="close-icon">Close</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;