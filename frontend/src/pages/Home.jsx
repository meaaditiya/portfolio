import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {GithubIcon, Linkedin, Mail, ArrowRight, ChevronDown } from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const roles = ["Full-Stack Developer", "React Specialist", "Node.js Expert", "UI/UX Enthusiast"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  // Animation setup
  useEffect(() => {
    setIsVisible(true);
    
    // Role rotation
    const roleInterval = setInterval(() => {
      setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length);
    }, 3000);
    
    return () => clearInterval(roleInterval);
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className={`hero-content ${isVisible ? 'fade-in' : ''}`}>
          <div className="hero-text">
            <h1 className="name-intro">
              <span className="greeting">Hi, I'm</span>
              <span className="name">Aaditiya Tyagi</span>
            </h1>
            
            <div className="role-display">
              <span className="role-text">{roles[currentRoleIndex]}</span>
            </div>
            
            <p className="hero-description">
              I create elegant, performant web applications with modern technologies.
              My expertise spans the entire development stack, focusing on scalable and
              innovative solutions that deliver exceptional user experiences.
            </p>
            
            <div className="action-buttons">
              <button 
                className="primary-button"
                onClick={() => navigate('/projects')}
              >
                View My Work <ArrowRight size={16} className="ml-2" />
              </button>
              
              <button 
                className="secondary-button"
                onClick={() => navigate('/contact')}
              >
                Get In Touch
              </button>
            </div>
            
            <div className="social-icons">
              <a href="https://github.com/aaditiyatyagi" target="_blank" rel="noopener noreferrer" className="social-icon">
                <GithubIcon size={20} />
              </a>
              <a href="https://linkedin.com/in/aaditiyatyagi" target="_blank" rel="noopener noreferrer" className="social-icon">
                <Linkedin size={20} />
              </a>
              <a href="mailto:contact@aaditiyatyagi.com" className="social-icon">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="profile-container">
              <div className="profile-backdrop"></div>
              <div className="profile-initials">AT</div>
              <div className="tech-stack">
                <div className="tech-badge">React</div>
                <div className="tech-badge">Node</div>
                <div className="tech-badge">MongoDB</div>
                <div className="tech-badge">Express</div>
                <div className="tech-badge">SQL</div>
                <div className="tech-badge">Java</div>
              </div>
            </div>
          </div>
        </div>
        
       
      </section>
      
      {/* Skills Highlight */}
      <section className="skills-highlight">
        <div className="skills-container">
          <div className="skill-card">
            <h3>Frontend Development</h3>
            <p>Creating responsive, beautiful interfaces with React.js and modern CSS</p>
          </div>
          <div className="skill-card">
            <h3>Backend Solutions</h3>
            <p>Building robust APIs and services with Node.js, Express, and MongoDB</p>
          </div>
          <div className="skill-card">
            <h3>Full-Stack Integration</h3>
            <p>Seamlessly connecting all components for powerful web applications</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;