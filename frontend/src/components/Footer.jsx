// src/components/Footer.js
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <h3 className="footer-title">Aaditiya Tyagi</h3>
          <p className="footer-role">Full-Stack Web Developer</p>
        </div>
        <div className="footer-socials">
          {[
            { href: 'https://github.com/', icon: <FaGithub className="social-icon" />, label: 'GitHub' },
            { href: 'https://linkedin.com/', icon: <FaLinkedin className="social-icon" />, label: 'LinkedIn' },
            { href: 'mailto:aaditiyatyagi123@gmail.com', icon: <FaEnvelope className="social-icon" />, label: 'Email' },
          ].map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <span className="sr-only">{social.label}</span>
              {social.icon}
            </a>
          ))}
        </div>
      </div>
      <hr className="footer-divider" />
      <div className="footer-copyright">
        <p>© {new Date().getFullYear()} Aaditiya Tyagi. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;