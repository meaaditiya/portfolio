import { useState, useEffect } from 'react';
import '../pagesCSS/Projects.css';
import aadiImage10 from '../images/court.avif';
import aadiImage1 from '../images/aadiimage01.jpeg';
import weatherImage from '../images/weather.jpg';
import castwave from '../images/Castwave.jpeg';
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
  const [fetchedProjects, setFetchedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://connectwithaaditiyamg2.onrender.com';

  const staticProjects = [];

  const imageMap = {
    'aadiImage10': aadiImage10,
    'aadiImage1': aadiImage1,
    'castwave': castwave,
    'weatherImage': weatherImage
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/projects`);
      const data = await response.json();
      if (response.ok) {
        const projectsWithImages = data.projects.map(project => ({
          ...project,
          image: project.imageUrl || null
        }));
        setFetchedProjects(projectsWithImages);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const projects = [...staticProjects, ...fetchedProjects];

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
          <h1 className="tyagi-hero-title">
            Featured
            <span className="tyagi-hero-gradient"> Projects</span>
          </h1>
          
          <div className="tyagi-project-layout">
            {projects.map((project) => {
              const isActive = activeProject === project.id || activeProject === project._id;
              const projectId = project.id || project._id;
              const hasGallery = project.galleryImages && project.galleryImages.length > 0;
              
              return (
                <div 
                  key={projectId} 
                  className={`tyagi-project-card ${project.color}-accent ${isActive ? 'tyagi-project-expanded' : ''}`}
                >
                  <div className="tyagi-project-header">
                    <div className="tyagi-project-image-container">
                      {project.image && (
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="tyagi-project-image" 
                        />
                      )}
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
                          onClick={() => toggleProjectDetails(projectId)}
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
                        <div className="tyagi-project-details-section">
                          <h4 className="tyagi-project-details-heading">Key Features</h4>
                          <ul className="tyagi-project-details-list">
                            {project.detailedDescription.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="tyagi-project-details-section">
                          <h4 className="tyagi-project-details-heading">Technologies Used</h4>
                          <div className="tyagi-project-tech-tags">
                            {project.tech.map((tech, idx) => (
                              <span key={idx} className="tyagi-project-tech-tag">{tech}</span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="tyagi-project-details-section">
                          <h4 className="tyagi-project-details-heading">Outcomes</h4>
                          <ul className="tyagi-project-details-list">
                            {project.outcomes.map((outcome, idx) => (
                              <li key={idx}>{outcome}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {hasGallery && (
                          <div className="tyagi-project-gallery-section">
                            <h4 className="tyagi-project-details-heading">Gallery</h4>
                            <div className="tyagi-carousel-wrapper">
                              <div className="tyagi-carousel">
                                {project.galleryImages.map((imgUrl, idx) => {
                                  const hueValue = (idx * 70) % 360;
                                  return (
                                    <React.Fragment key={idx}>
                                      <input 
                                        type="radio" 
                                        name={`carousel-${projectId}`} 
                                        id={`cr-${projectId}-${idx}`}
                                        defaultChecked={idx === 0}
                                      />
                                      <label 
                                        htmlFor={`cr-${projectId}-${idx}`}
                                        style={{ '--hue': hueValue }}
                                      ></label>
                                      <div 
                                        className="tyagi-carousel-item" 
                                        style={{ '--z': project.galleryImages.length - idx }}
                                      >
                                        <img 
                                          src={imgUrl} 
                                          alt={`${project.title} gallery ${idx + 1}`}
                                        />
                                      </div>
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="tyagi-project-details-actions">
                          {project.link && (
                            <button
                              onClick={() => window.open(project.link, "_blank", "noopener,noreferrer")}
                              className="tyagi-project-action-button tyagi-project-github-button"
                            >
                              Visit
                            </button>
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