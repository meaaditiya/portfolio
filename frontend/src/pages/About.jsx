import React from 'react';
import { 
  Mail, Phone, MapPin, User, GraduationCap, Code, Award, Calendar,
  Globe, Database, Server, Smartphone, GitBranch, Layers, FileCode, Palette, Download
} from 'lucide-react';
import '../pagesCSS/about.css';
import profileImage from '../images/aadiprofile.png';

const About = () => {
  const handleConnectClick = () => {
    // Navigate to contact section or show contact modal
    console.log('Navigate to contact');
  };

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

  const skills = [
    { name: "React.js", icon: <Globe size={18} /> },
    { name: "Node.js", icon: <Server size={18} /> },
    { name: "Java", icon: <Code size={18} /> },
    { name: "Javascript", icon: <FileCode size={18} /> },
    { name: "MongoDB", icon: <Database size={18} /> },
    { name: "SQL", icon: <Database size={18} /> },
    { name: "NoSQL", icon: <Database size={18} /> },
    { name: "Express.js", icon: <Server size={18} /> },
    { name: "HTML", icon: <FileCode size={18} /> },
    { name: "CSS", icon: <Palette size={18} /> },
    { name: "Git", icon: <GitBranch size={18} /> },
    { name: "REST APIs", icon: <Layers size={18} /> }
  ];

  const educationData = [
    {
      degree: "B.Tech. - Computer Science & Engineering",
      school: "KIET Group of Institutions",
      duration: "2022 - 2026",
      grade: "CGPA: 8.8 | 85.10%",
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
 
  return (
    <section className="about-section">
      <div className="about-container">
        {/* Hero Section */}
        <div className="about-hero">
          <div className="about-hero-content">
            <div className="about-text-content">
              <div className="about-badge">
                <User size={16} />
                <span>About Me</span>
              </div>
              <h1 className="about-title">
                Full-Stack Developer
              </h1>
              <p className="about-description">
                Full-stack developer with a strong command of React.js, Node.js, and modern web technologies, 
                dedicated to building scalable, high-performance, and user-focused digital solutions. 
                Passionate about innovation, clean code, and crafting seamless web experiences that drive real-world impact.
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

        {/* Single Row Layout */}
        <div className="about-single-row">
          {/* Professional Summary */}
          <div className="about-card about-summary-card">
            <div className="card-header">
              <div className="card-icon">
                <User size={20} />
              </div>
              <h3 className="card-title">Professional Summary</h3>
            </div>
            <div className="card-content">
              <p className="summary-text">
                As a Computer Science student with hands-on experience in full-stack web development, I leverage 
                my skills in modern web technologies like React.js, Node.js, and MongoDB to build innovative software solutions.
              </p>
              <p className="summary-text">
                Through my case management e-Portal project, I've demonstrated expertise in building scalable, secure 
                web applications with robust features like role-based authentication and real-time communication.
              </p>
              <p className="summary-text">
                I'm passionate about solving complex technological challenges while delivering high-quality, user-centric 
                solutions that make a meaningful impact.
              </p>
            </div>
          </div>

          {/* Education */}
          <div className="about-card about-education-card">
            <div className="card-header">
              <div className="card-icon">
                <GraduationCap size={20} />
              </div>
              <h3 className="card-title">Education</h3>
            </div>
            <div className="card-content">
              <div className="education-timeline">
                {educationData.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="education-icon-wrapper">
                      {edu.icon}
                    </div>
                    <div className="education-content">
                      <h4 className="education-degree">{edu.degree}</h4>
                      <p className="education-school">{edu.school}</p>
                      <div className="education-meta">
                        <span className="education-duration">
                          <Calendar size={14} />
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

          {/* Technical Skills */}
          <div className="about-card about-skills-card">
            <div className="card-header">
              <div className="card-icon">
                <Code size={20} />
              </div>
              <h3 className="card-title">Technical Expertise</h3>
            </div>
            <div className="card-content">
              <div className="skills-scroll-container">
                <div className="skills-grid">
                  {skills.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <div className="skill-icon">
                        {skill.icon}
                      </div>
                      <span className="skill-name">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
         {/* Download Resume Button */}
        <div className="about-resume-row">
          <button 
            className="download-resume-btn" 
            onClick={handleDownloadResume}
            aria-label="Download Resume"
          >
            <Download size={20} />
            <span>Download Resume</span>
          </button>
        </div>
        {/* Contact Information - Separate Row */}
        <div className="about-contact-row">
          <div className="about-card about-contact-card">
            <div className="card-header">
              <div className="card-icon">
                <Mail size={20} />
              </div>
              <h3 className="card-title">Contact Information</h3>
            </div>
            <div className="card-content">
              <div className="contact-items">
                <div className="contact-item">
                  <div className="contact-icon">
                    <Mail size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Email</span>
                    <a href="mailto:aaditiyatyagi123@gmail.com" className="contact-value">
                      aaditiyatyagi123@gmail.com
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <Phone size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Phone</span>
                    <a href="tel:+917351102036" className="contact-value">
                      +91 7351102036
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <MapPin size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Location</span>
                    <span className="contact-value">Ghaziabad, Uttar Pradesh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </section>
  );
};

export default About;