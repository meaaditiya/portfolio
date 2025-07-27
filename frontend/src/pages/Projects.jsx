import { useState } from 'react';
import './Projects.css';
import aadiImage10 from '../images/aadiimage10.jpg';
import aadiImage1 from '../images/aadiimage01.jpeg';
import weatherImage from '../images/weather.jpg';
import castwave from '../images/Castwave.png';
const Projects = () => {
  const [activeProject, setActiveProject] = useState(null);

  const projects = [
    {
      id: 1,
      title: 'E-Portal for Case Management',
      period: '08 Mar, 2023 - 15 May, 2024',
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
      id: 2,
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
  id: 3,
  title: 'CastWave',
  period: '30 May, 2025 - 23 Jul, 2024',
  teamSize: 1,
  description: 'A full-stack live chat application enabling real-time chatting community sessions, and interactive conversations with advanced host controls.',
  detailedDescription: [
    'Built with Next.js (App Router) and TypeScript for scalable, maintainable architecture.',
    'Implemented secure user authentication and session-based login persistence using Firebase Auth.',
    'Designed dynamic session creation, scheduling, and real-time live control features for hosts.',
    'Integrated Firestore for real-time chat synchronization and participant management.',
    'Enabled live polls with real-time voting and results display for session engagement.',
    'Developed featured messages and message voting for interactive discussion flow.',
    'Integrated Google Genkit for AI-powered live chat summarization.',
    'Styled using Tailwind CSS and ShadCN UI for responsive, modern light/dark themed UI.',
    'Managed app-wide state using React Hooks and Context API.'
  ],
  tech: ['Next.js', 'TypeScript', 'Firebase', 'Firestore', 'Tailwind CSS', 'ShadCN UI', 'Genkit', 'React Hooks', 'Context API'],
  outcomes: [
    'Enabled creators and communities to host live chat events with rich interaction.',
    'Improved user engagement through polls, featured messages, and voting.',
    'Enhanced content accessibility with AI-based chat summarization.'
  ],
   link: 'https://castwave-red.vercel.app/',
  color: 'purple',
  image: castwave
}
,
    {
      id: 4,
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
    <section className="tyagi-project-section" id="projects">
      <div className="tyagi-project-container">
        <h2 className="tyagi-project-section-heading">Featured Projects</h2>
        
        <div className="tyagi-project-layout">
          {projects.map((project) => {
            const isActive = activeProject === project.id;
            
            return (
              <div 
                key={project.id} 
                className={`tyagi-project-card ${project.color}-accent ${isActive ? 'tyagi-project-expanded' : ''}`}
              >
                <div className="tyagi-project-header">
                  <div className="tyagi-project-image-container">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="tyagi-project-image" 
                    />
                    <div className="tyagi-project-tech-badges">
                      {project.tech.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="tyagi-project-tech-badge1">{tech}</span>
                      ))}
                      {project.tech.length > 3 && (
                        <span className="tyagi-project-tech-badge1 tyagi-project-more-badge1">+{project.tech.length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="tyagi-project-summary">
                    <h3 className="tyagi-project-title">{project.title}</h3>
                    <p className="tyagi-project-period">{project.period}</p>
                    <p className="tyagi-project-team">
                      <span className="tyagi-project-detail-label">Team:</span> {project.teamSize}
                      {project.mentor && <> | <span className="tyagi-project-detail-label">Mentor:</span> {project.mentor}</>}
                    </p>
                    <p className="tyagi-project-brief">{project.description}</p>
                    <div className="tyagi-project-toggle">
                      <button 
                        className="tyagi-project-toggle-button"
                        onClick={() => toggleProjectDetails(project.id)}
                      >
                        {isActive ? 'Hide Details' : 'Show Details'}
                        <span className={`tyagi-project-arrow-icon ${isActive ? 'tyagi-project-up' : 'tyagi-project-down'}`}></span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {isActive && (
                  <div className="tyagi-project-details">
                    <div className="tyagi-project-details-content">
                      {/* Features Section */}
                      <div className="tyagi-project-details-section">
                        <h4 className="tyagi-project-details-heading">Key Features</h4>
                        <ul className="tyagi-project-details-list">
                          {project.detailedDescription.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Technologies Section */}
                      <div className="tyagi-project-details-section">
                        <h4 className="tyagi-project-details-heading">Technologies Used</h4>
                        <div className="tyagi-project-tech-tags">
                          {project.tech.map((tech, idx) => (
                            <span key={idx} className="tyagi-project-tech-tag">{tech}</span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Outcomes Section */}
                      <div className="tyagi-project-details-section">
                        <h4 className="tyagi-project-details-heading">Outcomes</h4>
                        <ul className="tyagi-project-details-list">
                          {project.outcomes.map((outcome, idx) => (
                            <li key={idx}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Action Button Section */}
                      {project.link && (
                        <div className="tyagi-project-details-actions">
                          <a 
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tyagi-project-action-button"
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