import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, User, GraduationCap, Code, Award, Calendar,
  Globe, Database, Server, Smartphone, GitBranch, Layers, FileCode, Palette, Download,
  ChevronLeft, ChevronRight, Cloud
} from 'lucide-react';
import '../pagesCSS/about.css';
import profileImage from '../images/java2.png';
import ProfileSlider from '../components/ProfileSlider';

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
    { name: "React.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Spring Boot", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
    { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "Express.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
    { name: "AWS", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" },
    { name: "HTML5", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS3", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" }
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
            <h1 className="hero-main-title">
  Full-Stack
  <span className="hero-gradient-text"> Developer</span>
</h1>
       {/* Technical Expertise Section */}
<div className="minimal-expertise-section">
 
  
  <div className="minimal-skills-grid">
    {skills.map((skill, index) => (
      <div key={index} className="minimal-skill-item">
        <img src={skill.logo} alt={skill.name} className="minimal-skill-logo" />
        <span className="minimal-skill-name">{skill.name}</span>
      </div>
    ))}
  </div>
</div>
       
        
<ProfileSlider />
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



        {/* Download Resume Button */}
       

      
      </div>
    </section>
  );
};

export default About;