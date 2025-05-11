import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaProjectDiagram, FaBlog, FaEnvelopeOpenText } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <header className="tyagi-header">
      <div className="tyagi-header-content">
        <div className="tyagi-logo-container">
          
        </div>
        <nav className="tyagi-nav">
          {[
            { name: 'Home', icon: <FaUser />, path: '/' },
            { name: 'About', icon: <FaUser />, path: '/about' },
            { name: 'Projects', icon: <FaProjectDiagram />, path: '/projects' },
            { name: 'Blog', icon: <FaBlog />, path: '/blog' },
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
      </div>
    </header>
  );
};

export default Header;