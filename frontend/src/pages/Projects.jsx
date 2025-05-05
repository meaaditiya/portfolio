import { useState } from 'react';
import './Projects.css';
import aadiImage10 from '../images/aadiimage10.jpg';
import aadiImage1 from '../images/aadiimage1.png';
const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = [
    
    {
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
      color: 'purple',
      image: aadiImage10
    },
    {
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
      image: '/images/weather-tracking.jpg'
    },
  ];

  const openDetails = (project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };

  const closeDetails = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <section className="portfolio-projects-section" id="projects">
      <div className="container">
        <h2 className="section-title">My Projects</h2>
        
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className={`project-card project-card-${project.color}`}>
              <div className="project-image-container">
                <img 
                  src={project.image || `/api/placeholder/600/400`} 
                  alt={project.title} 
                  className="project-image" 
                />
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-period">{project.period}</p>
                <p className="project-team">
                  Team Size: {project.teamSize}
                  {project.mentor && ` | Mentor: ${project.mentor}`}
                </p>
                <p className="project-description">{project.description}</p>
                <div className="project-tech-tags">
                  {project.tech.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                  {project.tech.length > 3 && (
                    <span className="tech-tag more-tag">+{project.tech.length - 3}</span>
                  )}
                </div>
                <div className="project-actions">
                  <button
                    className="btn btn-details"
                    onClick={() => openDetails(project)}
                  >
                    View Details
                  </button>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link"
                    >
                      Visit Project
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <div className="project-modal-overlay" onClick={closeDetails}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeDetails}>
              &times;
            </button>
            
            <div className="modal-content">
              <div className="modal-image-container">
                <img 
                  src={selectedProject.image || `/api/placeholder/800/500`} 
                  alt={selectedProject.title} 
                  className="modal-image" 
                />
              </div>
              
              <div className="modal-info">
                <h3 className="modal-title">{selectedProject.title}</h3>
                <p className="modal-period">{selectedProject.period}</p>
                <p className="modal-team">
                  Team Size: {selectedProject.teamSize}
                  {selectedProject.mentor && ` | Mentor: ${selectedProject.mentor}`}
                </p>
                
                <div className="modal-description">
                  <p>{selectedProject.description}</p>
                </div>
                
                <div className="modal-section">
                  <h4 className="modal-subtitle">Key Features</h4>
                  <ul className="modal-list">
                    {selectedProject.detailedDescription.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="modal-section">
                  <h4 className="modal-subtitle">Outcomes</h4>
                  <ul className="modal-list">
                    {selectedProject.outcomes.map((outcome, idx) => (
                      <li key={idx}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="modal-section">
                  <h4 className="modal-subtitle">Technologies Used</h4>
                  <div className="modal-tech-tags">
                    {selectedProject.tech.map((tech, idx) => (
                      <span key={idx} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
                
                {selectedProject.link && (
                  <div className="modal-actions">
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Visit Project
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;