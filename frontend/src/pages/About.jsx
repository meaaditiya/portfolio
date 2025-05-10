
import React from 'react';
import { useNavigate } from 'react-router-dom';
import profileImage from '../images/aadiprofile.png';
import './about.css';

const About = () => {
  const navigate = useNavigate();

  const handleConnectClick = () => {
    navigate('/about');
  };

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-header">
          <div className="about-text-container">
            <h2 className="about-main-title">About Me</h2>
            <p className="about-intro">
             Full-stack developer with a strong command of React.js, Node.js, and modern web technologies, dedicated to building scalable, high-performance, and user-focused digital solutions. Passionate about innovation, clean code, and crafting seamless web experiences that drive real-world impact.
            </p>
            <div className="about-cta-container">
             
            </div>
          </div>
          <div className="about-image-container">
            <img src={profileImage} alt="Aaditiya Tyagi" className="about-profile-image" />
          </div>
        </div>

        <div className="about-content">
          <div className="about-card about-summary-card">
            <h3 className="about-card-title">Professional Summary</h3>
            <p className="about-card-text">
              As a Computer Science student with hands-on experience in full-stack web development, I leverage 
              my skills in modern web technologies like React.js, Node.js, and MongoDB to build innovative software solutions.
            </p>
            <p className="about-card-text">
              Through my case management e-Portal project, I've demonstrated expertise in building scalable, secure 
              web applications with robust features like role-based authentication and real-time communication.
            </p>
            <p className="about-card-text">
              I'm passionate about solving complex technological challenges while delivering high-quality, user-centric 
              solutions that make a meaningful impact.
            </p>
          </div>

          <div className="about-two-column">
            <div className="about-card about-education-card">
              <h3 className="about-card-title">Education</h3>
              <div className="about-education-item">
                <h4 className="about-education-degree">B.Tech. - Computer Science & Engineering</h4>
                <p className="about-education-school">KIET Group of Institutions</p>
                <p className="about-education-details">2022 - 2026 | Percentage: 84.64/100</p>
              </div>
              <div className="about-education-item">
                <h4 className="about-education-degree">Higher Secondary Education</h4>
                <p className="about-education-school">Vidhaan Public School, Ghaziabad</p>
                <p className="about-education-details">2021 | Percentage: 93/100</p>
              </div>
              <div DixieclassName="about-education-item">
                <h4 className="about-education-degree">Secondary Education</h4>
                <p className="about-education-school">SSK Public School, Ghaziabad</p>
                <p className="about-education-details">2019 | Percentage: 91.20/100</p>
              </div>
            </div>

            <div className="about-card about-skills-card">
              <h3 className="about-card-title">Technical Expertise</h3>
              <div className="about-skills-container">
                {["React.js", "Node.js", "Java", "Javascript", "MongoDB", "SQL", 
                  "NoSQL", "Express.js", "HTML", "CSS"].map((skill, index) => (
                  <span key={index} className="about-skill-tag">{skill}</span>
                ))}
              </div>
              <h3 className="about-card-title about-card-title-secondary">Contact Information</h3>
              <div className="about-contact-info">
                <p className="about-contact-item">
                  <span className="about-contact-label">Email:</span> 
                  <a href="mailto:aaditiyatyagi123@gmail.com" className="about-contact-value">aaditiyatyagi123@gmail.com</a>
                </p>
                <p className="about-contact-item">
                  <span className="about-contact-label">Phone:</span> 
                  <a href="tel:+917351102036" className="about-contact-value">+91 7351102036</a>
                </p>
                <p className="about-contact-item">
                  <span className="about-contact-label">Location:</span> 
                  <span className="about-contact-value">Ghaziabad, Uttar Pradesh</span>
                </p>
                <p className="about-contact-item">
            
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;