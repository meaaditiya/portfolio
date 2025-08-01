import React from 'react';
import { Github, Instagram, Twitter, Mail, Linkedin } from 'lucide-react';
import '../pagesCSS/Footer.css';
const Footer = () => {
  const socialLinks = [
    {
      href: "https://github.com/meaaditiya",
      icon: Github,
      label: "GitHub"
    },
    {
      href: "https://www.instagram.com/aaditiya_tyagi/",
      icon: Instagram,
      label: "Instagram"
    },
    {
      href: "https://x.com/aaditiya__tyagi",
      icon: Twitter,
      label: "Twitter"
    },
    {
      href: "mailto:aaditiyatyagi123@gmail.com",
      icon: Mail,
      label: "Email"
    },
    {
      href: "https://www.linkedin.com/in/aaditiya-tyagi-babb26290/",
      icon: Linkedin,
      label: "LinkedIn"
    }
  ];

  return (
    <footer className="portfolio-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-initials">AT</span>
          <span className="footer-year">© 2024</span>
        </div>
        
        <div className="footer-socials1">
          {socialLinks.map((social, index) => {
            const IconComponent = social.icon;
            return (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link1"
                aria-label={social.label}
              >
                <IconComponent size={20} />
              </a>
            );
          })}
        </div>
        
        <div className="footer-status">
          <span className="status-text">Available for opportunities</span>
          <div className="status-dot"></div>
          <span className="location-text">Remote / Global</span>
        </div>
      </div>
      
     
    </footer>
  );
};

export default Footer;