import React from 'react';
import { Github, Instagram, Twitter, Mail, Linkedin , Download} from 'lucide-react';
import { Link } from 'react-router-dom';
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
    const handleDownloadResume = () => {
    // Open resume in new popup window
    window.open('/resume.pdf', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    // Also trigger download
    const link = document.createElement('a');
    link.href = '/resume.pdf'; // Assuming resume.pdf is in the public folder
    link.download = 'Aaditiya_Tyagi_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <footer className="portfolio-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-year">Aaditiya Tyagi © 2024 All Rights Reserved</span>
        </div>
         <div className="footer-policy">
          <Link to="/privacy-policy" className="policy-link">
            Privacy Policy
          </Link>
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
          {/*download section*/}
        
         </div>
      
      
     
    </footer>
  );
};

export default Footer;