import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    { name: 'Blogs', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'Stream', path: '/stream' },
  ];

  return (
    <>
   

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
          <div className="menu-center" onClick={toggleMobileMenu}>
            <span className="close-icon">×</span>
          </div>
          
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigateToPage(item.path)}
              className={`circular-nav-item ${currentPath === item.path ? 'active' : ''}`}
            >
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Header;