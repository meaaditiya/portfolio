import { useState } from 'react';
import '../pagesCSS/Projects.css';
import aadiImage10 from '../images/aadiimage10.jpg';
import aadiImage1 from '../images/aadiimage01.jpeg';
import weatherImage from '../images/weather.jpg';
import castwave from '../images/Castwave.png';
import React from 'react';
import { Search, Folder, File, GitBranch, Star, Eye, AlertCircle, Loader2, FolderOpen, FileText, Code } from 'lucide-react';

const GitHubRepoExplorer = ({ repoUrl: initialRepoUrl, onClose }) => {
  const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN; 
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl || '');
  const [repoData, setRepoData] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const parseGitHubUrl = (url) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  };


  const fetchRepoData = async (owner, repo) => {
    const headers = {};
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later or add authentication.');
      }
      throw new Error(`Repository not found or not accessible`);
    }
    return response.json();
  };

  const fetchFileTree = async (owner, repo, sha) => {
    const headers = {};
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, {
      headers
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch file tree');
    }
    return response.json();
  };
  const buildTreeStructure = (items) => {
    const tree = [];
    const pathMap = new Map();

    const sortedItems = items.sort((a, b) => {
      const aDepth = a.path.split('/').length;
      const bDepth = b.path.split('/').length;
      if (aDepth !== bDepth) return aDepth - bDepth;
      return a.path.localeCompare(b.path);
    });

    sortedItems.forEach(item => {
      const parts = item.path.split('/');
      const fileName = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');

      const node = {
        name: fileName,
        path: item.path,
        type: item.type,
        size: item.size,
        children: item.type === 'tree' ? [] : null,
        sha: item.sha
      };

      pathMap.set(item.path, node);

      if (parentPath === '') {
        tree.push(node);
      } else {
        const parent = pathMap.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      }
    });

    return tree;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError('');
    setRepoData(null);
    setFileTree([]);

    try {
      const parsed = parseGitHubUrl(repoUrl);
      if (!parsed) {
        throw new Error('Invalid GitHub URL format');
      }

      const [repo, tree] = await Promise.all([
        fetchRepoData(parsed.owner, parsed.repo),
        fetchFileTree(parsed.owner, parsed.repo, 'HEAD')
      ]);

      setRepoData(repo);
      const treeStructure = buildTreeStructure(tree.tree);
      setFileTree(treeStructure);
      
      const rootFolders = treeStructure
        .filter(item => item.type === 'tree')
        .map(item => item.path);
      setExpandedFolders(new Set(rootFolders));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (name, type) => {
    if (type === 'tree') {
      return <FolderOpen className="github-tree-icon github-folder-icon" />;
    }
    
    const ext = name.split('.').pop()?.toLowerCase();
    
    switch(ext) {
      case 'js': case 'jsx': case 'ts': case 'tsx':
        return <Code className="github-tree-icon github-js-icon" />;
      case 'json':
        return <FileText className="github-tree-icon github-json-icon" />;
      case 'md': case 'txt': case 'readme':
        return <FileText className="github-tree-icon github-md-icon" />;
      case 'css': case 'scss': case 'sass':
        return <FileText className="github-tree-icon github-css-icon" />;
      case 'html':
        return <FileText className="github-tree-icon github-html-icon" />;
      case 'py':
        return <Code className="github-tree-icon github-py-icon" />;
      case 'java':
        return <Code className="github-tree-icon github-java-icon" />;
      default:
        return <File className="github-tree-icon github-default-icon" />;
    }
  };

  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node, index) => {
      const isExpanded = expandedFolders.has(node.path);
      const hasChildren = node.children && node.children.length > 0;
      
      return (
        <div key={node.path} className="github-tree-node">
          <div 
            className={`github-tree-item ${node.type === 'tree' ? 'github-tree-folder' : 'github-tree-file'}`}
            onClick={() => node.type === 'tree' && toggleFolder(node.path)}
          >
            <div className="github-tree-content">
              <div className="github-tree-indent">
                {Array.from({ length: depth }, (_, i) => (
                  <div key={i} className="github-tree-indent-line"></div>
                ))}
              </div>
              
              {node.type === 'tree' && (
                <div className={`github-tree-toggle ${isExpanded ? 'expanded' : ''}`}>
                  <span className="github-tree-arrow">▶</span>
                </div>
              )}
              
              <div className="github-tree-icon-wrapper">
                {getFileIcon(node.name, node.type)}
              </div>
              
              <span className="github-tree-name">{node.name}</span>
              
              {node.type === 'blob' && node.size && (
                <span className="github-tree-size">{formatFileSize(node.size)}</span>
              )}
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="github-tree-children">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const countFiles = (nodes) => {
    return nodes.reduce((acc, node) => {
      if (node.type === 'blob') return acc + 1;
      if (node.children) return acc + countFiles(node.children);
      return acc;
    }, 0);
  };

  const countFolders = (nodes) => {
    return nodes.reduce((acc, node) => {
      if (node.type === 'tree') {
        let count = 1;
        if (node.children) count += countFolders(node.children);
        return acc + count;
      }
      return acc;
    }, 0);
  };

  React.useEffect(() => {
    if (initialRepoUrl) {
      handleSubmit();
    }
  }, []);

  return (
    <div className="github-explorer-overlay">
      <div className="github-explorer-modal">
        <div className="github-explorer-header">
          <h2 className="github-explorer-title">GitHub Repository Explorer</h2>
          <button 
            onClick={onClose}
            className="github-explorer-close"
          >
            ×
          </button>
        </div>
        
        <div className="github-explorer-content">
          <div className="github-explorer-search">
            <div className="github-search-input-group">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                placeholder="https://github.com/username/repository"
                className="github-search-input"
              /> 
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="github-search-button"
              >
                {loading ? <Loader2 className="github-loading-spinner" /> : <GitBranch className="github-search-icon" />}
                {loading ? 'Loading...' : 'Explore'}
              </button>
              <button className="github-search-button"><a
                className="link"
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit repository
              </a></button>
            </div>
          </div>

          {error && (
            <div className="github-error-message">
              <AlertCircle className="github-error-icon" />
              {error}
            </div>
          )}

          {repoData && (
            <div className="github-repo-info">
              <div className="github-repo-header">
                <h3 className="github-repo-name">{repoData.full_name}</h3>
                <div className="github-repo-stats">
                  <span className="github-stat">
                    <Star className="github-stat-icon" />
                    {repoData.stargazers_count.toLocaleString()}
                  </span>
                  <span className="github-stat">
                    <Eye className="github-stat-icon" />
                    {repoData.watchers_count.toLocaleString()}
                  </span>
                </div>
              </div>
              {repoData.description && (
                <p className="github-repo-description">{repoData.description}</p>
              )}
              <div className="github-repo-meta">
                <span>Language: {repoData.language || 'Not specified'}</span>
                <span>Size: {(repoData.size / 1024).toFixed(1)} MB</span>
                <span>Updated: {new Date(repoData.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {fileTree.length > 0 && (
            <div className="github-tree-container">
              <div className="github-tree-header">
                <h4 className="github-tree-title">Repository Structure</h4>
                <p className="github-tree-stats">
                  {fileTree.filter(n => n.type === 'blob').length + 
                   fileTree.reduce((acc, n) => acc + (n.children ? countFiles(n.children) : 0), 0)} files, {' '}
                  {fileTree.filter(n => n.type === 'tree').length + 
                   fileTree.reduce((acc, n) => acc + (n.children ? countFolders(n.children) : 0), 0)} folders
                </p>
              </div>
              <div className="github-tree-view">
                {renderTree(fileTree)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const [activeProject, setActiveProject] = useState(null);
  const [showGitHub, setShowGitHub] = useState(false);
  const [currentRepoUrl, setCurrentRepoUrl] = useState('');

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
      githubUrl: 'https://github.com/meaaditiya/casemanager.git',
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
      githubUrl: 'https://github.com/meaaditiya/bunkoff.git',
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
      githubUrl: 'https://github.com/meaaditiya/castwave.git',
      color: 'purple',
      image: castwave
    },
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

  const openGitHub = (githubUrl) => {
    setCurrentRepoUrl(githubUrl);
    setShowGitHub(true);
  };

  const closeGitHub = () => {
    setShowGitHub(false);
    setCurrentRepoUrl('');
  };

  

  return (
    <>
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
                        <div className="tyagi-project-details-actions">
                          {project.link && (
                            <a 
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tyagi-project-action-button"
                            >
                              Visit
                            </a>
                          )}
                          {project.githubUrl && (
                            <button 
                              onClick={() => openGitHub(project.githubUrl)}
                              className="tyagi-project-action-button tyagi-project-github-button"
                            >
                              GitHub 
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {showGitHub && (
        <GitHubRepoExplorer 
          repoUrl={currentRepoUrl} 
          onClose={closeGitHub} 
        />
      )}
    
    </>
  );
};

export default Projects;