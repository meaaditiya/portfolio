import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, ArrowUpRight, Code, Database, Globe, FileText, ExternalLink} from 'lucide-react';
// Import the actual page components
import About from './About';
import Projects from './Projects';
import Contact from './Contact';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const roles = ["Full-Stack Developer", "React Specialist", "Node.js Expert", "UI/UX Enthusiast"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    
    const roleInterval = setInterval(() => {
      setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length);
    }, 4000);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      clearInterval(roleInterval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const navigateToPage = (path) => {
    navigate(path);
  };

  const handleBlogRedirect = () => {
    window.open('/blog', '_blank');
  };

  return (
    <div className="portfolio-container">
      {/* Cursor Follower - Desktop Only */}
      <div 
        className="cursor-follower"
        style={{
          left: mousePosition.x - 10,
          top: mousePosition.y - 10,
        }}
      />
      
     
      
      {/* Main Content */}
      <main className="portfolio-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className={`hero-text ${isLoaded ? 'content-visible' : ''}`}>
              <div className="hero-left">
                <div className="hero-greeting">
                  <span className="greeting-label">Hello, I'm</span>
                  <h1 className="hero-name">Aaditiya Tyagi</h1>
                  
                  <div className="role-rotator">
                    <span className="role-prefix">—</span>
                    <span className="role-text">{roles[currentRoleIndex]}</span>
                  </div>
                  
                  <p className="hero-description">
                    Crafting digital experiences through clean code and thoughtful design.
                    I specialize in building scalable web applications that solve real-world
                    problems with modern technologies and best practices.
                  </p>
                  
                  <div className="hero-actions">
                    <button 
                      onClick={() => navigate('/projects')}
                      className="primary-cta"
                    >
                      View Projects <ArrowUpRight size={16} />
                    </button>
                    
                    <button 
                      onClick={() => navigate('/contact')}
                      className="secondary-cta"
                    >
                      Get in Touch
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="hero-right">
                <div className="profile-container">
                  <div className="profile-avatar">AT</div>
                  <div className="profile-glow"></div>
                </div>
                
                <div className="tech-stack">
                  {[
                    { name: 'React', icon: <Code size={14} /> },
                    { name: 'Node.js', icon: <Globe size={14} /> },
                    { name: 'MongoDB', icon: <Database size={14} /> },
                    { name: 'Express', icon: <Code size={14} /> },
                    { name: 'SQL', icon: <Database size={14} /> },
                    { name: 'Java', icon: <Code size={14} /> }
                  ].map((tech, index) => (
                    <div key={tech.name} className="tech-item" style={{ animationDelay: `${index * 0.1}s` }}>
                      {tech.icon}
                      <span>{tech.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="social-links">
              <a href="https://github.com/aaditiyatyagi" target="_blank" rel="noopener noreferrer" className="social-link">
                <Github size={18} />
                <span>GitHub</span>
              </a>
              <a href="https://linkedin.com/in/aaditiyatyagi" target="_blank" rel="noopener noreferrer" className="social-link">
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </a>
              <a href="mailto:contact@aaditiyatyagi.com" className="social-link">
                <Mail size={18} />
                <span>Email</span>
              </a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="content-section about-section">
          <div className="section-container">
            <div className="section-header">
            </div>
            
            <div 
              className="section-content"
              onClick={() => navigateToPage('/about')}
              style={{ cursor: 'pointer' }}
            >
              <About />
            </div>
             <button 
                onClick={() => navigateToPage('/about')}
                className="section-nav-btn"
              >
                Read More <ArrowUpRight size={16} />
              </button>
          </div>
        </section>

        {/* Projects Section */}
        <section className="content-section projects-section">
          <div className="section-container">
            <div className="section-header">
             
            </div>
            
            <div 
              className="section-content"
              onClick={() => navigateToPage('/projects')}
              style={{ cursor: 'pointer' }}
            >
              <Projects />
            </div>
            <button 
                onClick={() => navigateToPage('/projects')}
                className="section-nav-btn"
              >
                View All <ArrowUpRight size={16} />
              </button>
          </div>
        </section>

        {/* Blog Section - No Import, Just Link */}
    
<section className="content-section blog-section">
  <div className="section-container">
    <div className="section-header">
      
      <div className="section-info">
        <h2 className="section-title">Writing</h2>
        <p className="section-subtitle">Thoughts on development and technology</p>
      </div>
      <button 
        onClick={handleBlogRedirect}
        className="section-nav-btn"
      >
        Visit Blog <ExternalLink size={16} />
      </button>
    </div>
    <div 
      className="blog-intro"
      onClick={handleBlogRedirect}
      style={{ cursor: 'pointer' }}
    >
      <p className="blog-description">
        Explore a curated collection of insights, tutorials, and reflections on the ever-evolving world of coding and innovation.
      </p>
     
    </div>
    <div 
      className="featured-topics"
      onClick={handleBlogRedirect}
      style={{ cursor: 'pointer' }}
    >
      <h3 className="topics-title">Featured Topics</h3>
      <div className="topics-list">
        <span className="topic-item">React Development</span>
        <span className="topic-item">Node.js Best Practices</span>
        <span className="topic-item">UI/UX Design Trends</span>
      </div>
    </div>
  </div>
</section>
        {/* Contact Section */}
        <section className="content-section contact-section">
          <div className="section-container">
            <div className="section-header">
            </div>
            
            <div 
              className="section-content"
              onClick={() => navigateToPage('/contact')}
              style={{ cursor: 'pointer' }}
            >
              <Contact />
            </div>
               <button 
                onClick={() => navigateToPage('/contact')}
                className="section-nav-btn"
              >
                Get in Touch <ArrowUpRight size={16} />
              </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;