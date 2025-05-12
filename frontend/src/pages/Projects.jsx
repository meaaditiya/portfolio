import { useState } from 'react';
import './Projects.css';
import aadiImage10 from '../images/aadiimage10.jpg';
import aadiImage1 from '../images/aadiimage01.jpeg';
import weatherImage from '../images/weather.jpg';

const Projects = () => {
  const [activeProject, setActiveProject] = useState(null);

  const projects = [
    {
      id: 1, // Added unique ID
      title: 'E-Portal for Case Management',
      period: '08 Mar, 2023 - 15 May, 2024',
      mentor: 'Anmol Jain',
      teamSize: 4,
      description: 'Developed an advanced e-Portal to streamline judicial processes, enhancing transparency, accessibility, and communication between judges, lawyers, and clients.',
      detailedDescription: [
        'Built a React.js and Node.js-based web application with a secure role-based authentication system.',
        'Implemented real-time case tracking and notifications for efficient case management.',
        'Integrated centralized document management for secure storage and access.',
        'Enabled video conferencing capabilities for remote hearings.',
        'Developed automated scheduling and task management features.',
        'Modernized judicial infrastructure with a user-friendly, efficient digital platform.'
      ],
      tech: ['ReactJS', 'Node.js', 'MongoDB', 'Express.js', 'JSON'],
      outcomes: [
        'Enhanced transparency in judicial processes.',
        'Improved accessibility for stakeholders.',
        'Reduced administrative overhead.',
        'Enabled seamless communication between judges, lawyers, and clients.'
      ],
        link: 'https://ecourtfiling.onrender.com/',
      color: 'purple',
      image: aadiImage10
    },
    {
      id: 2, // Added unique ID
      title: 'Personal Attendance Manager',
      period: '01 Jan, 2025 - 10 Mar, 2025',
      teamSize: 1,
      description: 'A user-friendly digital tool designed to help individuals track and manage their attendance effectively with real-time calculations and target setting.',
      detailedDescription: [
        'Developed a web application using React.js for an intuitive user interface.',
        'Implemented manual entry for daily attendance with real-time percentage calculations.',
        'Enabled tracking of total classes/days attended and scheduled.',
        'Created a target attendance calculator to recommend required class attendance.',
        'Added functionality to save and review attendance history.'
      ],
      tech: ['React.js', 'HTML', 'CSS', 'Javascript'],
      link: 'https://attendancetarget.onrender.com/',
      outcomes: [
        'Simplified attendance tracking for users.',
        'Provided actionable insights to meet attendance goals.',
        'Offered a responsive and intuitive interface.'
      ],
      color: 'pink',
      image: aadiImage1
    },
    {
      id: 3, // Added unique ID
      title: 'Weather Tracking for Farmers',
      period: '01 May, 2023 - 23 Jul, 2024',
      teamSize: 4,
      description: 'A comprehensive digital solution for farmers to monitor agricultural weather conditions, providing crop-specific insights and real-time updates.',
      detailedDescription: [
        'Developed a responsive frontend with React.js for an interactive user experience.',
        'Built a robust backend using Node.js and Express.js for API development.',
        'Utilized MongoDB for flexible data storage and WebSocket for real-time updates.',
        'Integrated weather APIs and Google Maps API for accurate, geolocation-based data.',
        'Provided hourly and daily weather predictions, including temperature, humidity, and precipitation.',
        'Offered crop-specific recommendations and alerts for risks like frost or drought.',
        'Included soil moisture and temperature tracking with historical data analysis.'
      ],
      tech: ['ReactJS', 'Web API', 'Google API', 'Google Maps API', 'MongoDB', 'Express.js', 'Node.js'],
      outcomes: [
        'Empowered farmers with data-driven agricultural decisions.',
        'Optimized crop management with personalized insights.',
        'Mitigated weather-related risks through timely alerts.'
      ],
      color: 'orange',
      image: weatherImage
    },
  ];

  const toggleProjectDetails = (projectId) => {
    setActiveProject(activeProject === projectId ? null : projectId);
  };

  return (
    <section className="projects-section" id="projects">
      <div className="container">
        <h2 className="section-heading">Featured Projects</h2>
        
        <div className="projects-layout">
          {projects.map((project) => {
            const isActive = activeProject === project.id;
            
            return (
              <div 
                key={project.id} 
                className={`project-card ${project.color}-accent ${isActive ? 'expanded' : ''}`}
              >
                <div className="project-header" onClick={() => toggleProjectDetails(project.id)}>
                  <div className="project-image-container">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="project-image" 
                    />
                    <div className="project-tech-badges">
                      {project.tech.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="tech-badge">{tech}</span>
                      ))}
                      {project.tech.length > 3 && (
                        <span className="tech-badge more-badge">+{project.tech.length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="project-summary">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-period">{project.period}</p>
                    <p className="project-team">
                      <span className="detail-label">Team:</span> {project.teamSize}
                      {project.mentor && <> | <span className="detail-label">Mentor:</span> {project.mentor}</>}
                    </p>
                    <p className="project-brief">{project.description}</p>
                    <div className="project-toggle">
                      <button className="toggle-button">
                        {isActive ? 'Hide Details' : 'Show Details'}
                        <span className={`arrow-icon ${isActive ? 'up' : 'down'}`}></span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {isActive && (
                  <div className="project-details">
                    <div className="details-content">
                      {/* Features Section */}
                      <div className="details-section">
                        <h4 className="details-heading">Key Features</h4>
                        <ul className="details-list">
                          {project.detailedDescription.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Technologies Section */}
                      <div className="details-section">
                        <h4 className="details-heading">Technologies Used</h4>
                        <div className="tech-tags">
                          {project.tech.map((tech, idx) => (
                            <span key={idx} className="tech-tag">{tech}</span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Outcomes Section */}
                      <div className="details-section">
                        <h4 className="details-heading">Outcomes</h4>
                        <ul className="details-list">
                          {project.outcomes.map((outcome, idx) => (
                            <li key={idx}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Action Button Section */}
                      {project.link && (
                        <div className="details-actions">
                          <a 
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-button"
                          >
                            Visit Project
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;