import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, User, GraduationCap, Code, Award, Calendar,
  Globe, Database, Server, Smartphone, GitBranch, Layers, FileCode, Palette, Download,
  ChevronLeft, ChevronRight, Cloud
} from 'lucide-react';
import '../pagesCSS/about.css';
import profileImage from '../images/java2.png';
import ProfileSlider from './ProfileSlider';
const About = () => {
  const [currentSlide, setCurrentSlide] = useState(5);

  const handleDownloadResume = () => {
    window.open('/resume.pdf', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Aaditiya_Tyagi_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const skills = [
    { name: "React.js", icon: <Globe size={20} />, color: "#61DAFB" },
    { name: "Node.js", icon: <Server size={20} />, color: "#339933" },
    { name: "Spring Boot", icon: <Layers size={20} />, color: "#6DB33F" },
    { name: "Javascript", icon: <FileCode size={20} />, color: "#F7DF1E" },
    { name: "MongoDB", icon: <Database size={20} />, color: "#47A248" },
    { name: "Java", icon: <Code size={20} />, color: "#007396" },
    { name: "SQL", icon: <Database size={20} />, color: "#4479A1" },
    { name: "Express.js", icon: <Server size={20} />, color: "#000000" },
    { name: "AWS", icon: <Cloud size={20} />, color: "#FF9900" },
    { name: "HTML", icon: <FileCode size={20} />, color: "#E34F26" },
    { name: "CSS", icon: <Palette size={20} />, color: "#1572B6" },
    { name: "Git", icon: <GitBranch size={20} />, color: "#F05032" }
  ];

  const educationData = [
    {
      degree: "B.Tech. - Computer Science & Engineering",
      school: "KIET Group of Institutions",
      duration: "2022 - 2026",
      grade: "CGPA: 8.73 | 84.95%",
      icon: <GraduationCap className="education-icon" />
    },
    {
      degree: "Higher Secondary Education",
      school: "Vidhaan Public School, Ghaziabad",
      duration: "2021",
      grade: "93%",
      icon: <Award className="education-icon" />
    },
    {
      degree: "Secondary Education",
      school: "SSK Public School, Ghaziabad",
      duration: "2019",
      grade: "91.20%",
      icon: <Award className="education-icon" />
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % skills.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + skills.length) % skills.length);
  };

  return (
    <section className="about-section">
      <div className="about-container">
        {/* Hero Section */}
        <div className="about-hero">
          <div className="about-hero-content">
            <div className="about-text-content">
             <h1 className="hero-main-title">
  Full-Stack
  <span className="hero-gradient-text"> Developer</span>
</h1>
      <p className="about-description">
              Full-stack developer with strong expertise in Java, Spring Boot, SQL, and modern backend engineering. 
              Skilled in building scalable APIs, secure architectures, and high-performance systems with clean, 
              maintainable code. Passionate about robust backend design, database optimization, and creating seamless,
               reliable user experiences that deliver real-world impact.
              </p>
            </div>
            <div className="about-image-wrapper">
              <div className="about-image-container">
                <img src={profileImage} alt="Aaditiya Tyagi" className="about-profile-image" />
                <div className="about-image-overlay"></div>
              </div>
              
            </div>
          </div>
        </div>
<ProfileSlider />
      {/* Single Row Layout */}
<div className="about-single-row">
  {/* Professional Summary */}
  <div className="about-card about-summary-card">
    <div className="card-header">
      <div className="tech-logos">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" className="tech-logo" />
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" alt="Spring" className="tech-logo" />
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" alt="SQL" className="tech-logo" />
      </div>
      <h3 className="card-title">Professional Summary</h3>
    </div>
    <div className="card-content">
      <p className="summary-text">
        Computer Science student with hands-on experience in full-stack web development, leveraging 
        modern technologies like React.js, Node.js, and MongoDB to build innovative solutions.
      </p>
      <p className="summary-text">
        Demonstrated expertise in building scalable, secure web applications with robust features 
        like role-based authentication and real-time communication through case management e-Portal project.
      </p>
      <p className="summary-text">
        Passionate about solving complex technological challenges while delivering high-quality, 
        user-centric solutions that make a meaningful impact.
      </p>
    </div>
  </div>

  {/* Education */}
 <div className="about-card about-education-card">
    <div className="card-header">
      <div className="edu-logos">
        <img src="https://static.wikia.nocookie.net/logopedia/images/4/40/Uptu_logo.png" alt="AKTU" className="edu-logo" />
        <img src="https://vectorseek.com/wp-content/uploads/2023/08/CBSE-Logo-Vector.svg-.png" alt="CBSE" className="edu-logo" />
        <img src="https://www.kiet.edu/assets/images/logo/dark_logo.png" alt="KIET" className="edu-logo" />
      </div>
      <h3 className="card-title">Education</h3>
    </div>
    <div className="card-content">
      <div className="education-timeline">
        {educationData.map((edu, index) => (
          <div key={index} className="education-item">
            <div className="education-item-logos">
              {index === 0 && (
                <>
                 
                  <img src="https://static.wikia.nocookie.net/logopedia/images/4/40/Uptu_logo.png" alt="AKTU" className="inline-edu-logo" />
                </>
              )}
              {(index === 1 || index === 2) && (
                <img src="https://vectorseek.com/wp-content/uploads/2023/08/CBSE-Logo-Vector.svg-.png" alt="CBSE" className="inline-edu-logo" />
              )}
            </div>
            <div className="education-content">
              <h4 className="education-degree">{edu.degree}</h4>
              <p className="education-school">{edu.school}</p>
              <div className="education-meta">
                <span className="education-duration">
                  <Calendar size={12} />
                  {edu.duration}
                </span>
                <span className="education-grade">{edu.grade}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

        {/* Technical Skills Slider Section */}
        <div className="expertise-section">
         <h1 className="section-heading tyagi-hero-title">
          Technical
              <span className="tyagi-hero-gradient"> Expertise</span>
            </h1>
          
          <div className="slider-container">
            <button className="slider-nav prev" onClick={prevSlide} aria-label="Previous slide">
              <ChevronLeft size={24} />
            </button>

            <div className="slider-wrapper">
              {skills.map((skill, index) => {
                const offset = index - currentSlide;
                const isActive = offset === 0;
                const absOffset = Math.abs(offset);
                
                return (
                  <div
                    key={index}
                    className={`expertise-card-small ${isActive ? 'active' : ''}`}
                    style={{
                      transform: `translateX(${offset * 35}%) translateZ(${-absOffset * 100}px) scale(${1 - absOffset * 0.15})`,
                      opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.3,
                      zIndex: 20 - absOffset,
                      pointerEvents: isActive ? 'auto' : 'none'
                    }}
                  >
                    <div className="card-gradient-small" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}></div>
                    <div className="card-glass-small">
                      <div className="skill-card-content">
                        <div className="skill-icon-large" style={{ color: skill.color }}>
                          {skill.icon}
                        </div>
                        <h3 className="skill-name-large">{skill.name}</h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="slider-nav next" onClick={nextSlide} aria-label="Next slide">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Slider Dots */}
          <div className="slider-dots">
            {skills.map((_, index) => (
              <button
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Download Resume Button */}
        <div className="about-resume-row">
          <button 
            className="super-button" 
            onClick={handleDownloadResume}
            aria-label="Download Resume"
          >
            <Download size={20} />
            <span>Download Resume</span>
          </button>
        </div>

      
      </div>
    </section>
  );
};

export default About;