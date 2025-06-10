// src/components/Footer.js
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import './Footer.css';

const Footer = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    const footerElement = document.querySelector('.footer');
    if (footerElement) observer.observe(footerElement);

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <footer 
      className={`footer ${isVisible ? 'footer-visible' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Elements */}
      <div className="footer-bg-animation">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Dynamic Light Effect */}
      <div 
        className="footer-light-effect"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, 
                      rgba(79, 70, 229, 0.15) 0%, 
                      rgba(147, 51, 234, 0.1) 25%, 
                      transparent 50%)`
        }}
      ></div>

      <div className="footer-content">
        <div className="footer-info">
          <h3 className="footer-title">
            <span className="title-text">Aaditiya Tyagi</span>
            <div className="title-underline"></div>
          </h3>
          <p className="footer-role">
            <span className="role-text">Full-Stack Web Developer</span>
            <div className="role-particles">
              <span className="particle"></span>
              <span className="particle"></span>
              <span className="particle"></span>
            </div>
          </p>
        </div>

        <div className="footer-socials">
          {[
            { 
              href: 'https://github.com/', 
              icon: <FaGithub className="social-icon" />, 
              label: 'GitHub',
              color: '#6366f1'
            },
            { 
              href: 'https://linkedin.com/', 
              icon: <FaLinkedin className="social-icon" />, 
              label: 'LinkedIn',
              color: '#8b5cf6'
            },
            { 
              href: 'mailto:aaditiyatyagi123@gmail.com', 
              icon: <FaEnvelope className="social-icon" />, 
              label: 'Email',
              color: '#ec4899'
            },
          ].map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{ '--social-color': social.color }}
            >
              <div className="social-bg"></div>
              <span className="sr-only">{social.label}</span>
              {social.icon}
              <div className="social-ripple"></div>
            </a>
          ))}
        </div>
      </div>

      <div className="footer-divider-container">
        <hr className="footer-divider" />
        <div className="divider-glow"></div>
      </div>

      <div className="footer-copyright">
        <p className="copyright-text">
          © {new Date().getFullYear()} Aaditiya Tyagi. All rights reserved.
        </p>
        <div className="copyright-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="footer-corners">
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>
      </div>
    </footer>
  );
};

export default Footer;