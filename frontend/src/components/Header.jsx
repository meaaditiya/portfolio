import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigateToPage = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Posts', path: '/posts' },
    { name: 'Projects', path: '/projects' },
    { name: 'Blogs', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header className="portfolio-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-initials">AT</span>
            <div className="logo-text">
              <span className="logo-name">Aaditiya Tyagi</span>
              <span className="logo-role">keep Learning</span>
            </div>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="main-navigation">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigateToPage(item.path)}
                className={`nav-item ${currentPath === item.path ? 'nav-item-active' : ''}`}
              >
                <span className="nav-label">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Header Controls */}
          <div className="header-controls">
            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
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
              <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
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