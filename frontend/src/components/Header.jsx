import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigateToPage = (path) => {
    navigate(path);
  };

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

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Posts', path: '/posts' },
    { name: 'Projects', path: '/projects' },
    { name: 'Blogs', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="portfolio-header">
      <div className="header-content">
        <div className="logo-section">
          <span className="logo-initials">AT</span>
          <div className="logo-text">
            <span className="logo-name">Aaditiya Tyagi</span>
            <span className="logo-role">Developer</span>
          </div>
        </div>
        
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
        
        <div className="header-controls">
          <button 
            onClick={handleRefresh} 
            className="control-btn" 
            title="Refresh Page"
          >
            ↻
          </button>
          <button 
            onClick={handleFullscreen} 
            className="control-btn" 
            title={document.fullscreenElement ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {document.fullscreenElement ? '⤓' : '⤢'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;