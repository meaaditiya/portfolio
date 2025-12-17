import React, { useState, useEffect } from 'react';
import '../pagesCSS/PrivacyPolicy.css';

const UserPolicy = () => {
    const [policies, setPolicies] = useState([]);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = `${import.meta.env.VITE_APP_BACKEND_URL}/api`;

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/policy`);
            const data = await response.json();
            setPolicies(data.policies || []);
        } catch (err) {
            setError('Failed to load policies');
            console.error('Error fetching policies:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPolicyDetails = async (policyType) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/policy/${policyType}`);
            const data = await response.json();
            
            if (response.ok && data.policy) {
                setSelectedPolicy(data.policy);
                if (data.policy.tabs && data.policy.tabs.length > 0) {
                    setActiveTab(data.policy.tabs[0]);
                }
            } else {
                setError('Policy not found');
            }
        } catch (err) {
            setError('Failed to load policy details');
            console.error('Error fetching policy details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePolicySelect = (policyType) => {
        fetchPolicyDetails(policyType);
    };

    const handleTabSelect = (tab) => {
        setActiveTab(tab);
    };

    const handleBackToList = () => {
        setSelectedPolicy(null);
        setActiveTab(null);
    };

    const renderContent = (tab) => {
        if (!tab) return null;

        let content = tab.renderedContent || tab.content;

        // Replace image placeholders
        if (tab.images && tab.images.length > 0) {
            tab.images.forEach(image => {
                const placeholder = `[IMAGE:${image.imageId}]`;
                const imageHtml = `
                    <div class="user-policy-image-container user-policy-image-${image.position}">
                        <img src="${image.url}" alt="${image.alt || ''}" class="user-policy-image" />
                        ${image.caption ? `<p class="user-policy-image-caption">${image.caption}</p>` : ''}
                    </div>
                `;
                content = content.replace(placeholder, imageHtml);
            });
        }

        // Replace video placeholders
        if (tab.videos && tab.videos.length > 0) {
            tab.videos.forEach(video => {
                const placeholder = `[VIDEO:${video.embedId}]`;
                let embedUrl = '';
                
                if (video.platform === 'youtube') {
                    embedUrl = `https://www.youtube.com/embed/${video.videoId}${video.autoplay ? '?autoplay=1' : ''}${video.muted ? '&mute=1' : ''}`;
                } else if (video.platform === 'vimeo') {
                    embedUrl = `https://player.vimeo.com/video/${video.videoId}${video.autoplay ? '?autoplay=1' : ''}${video.muted ? '&muted=1' : ''}`;
                } else if (video.platform === 'dailymotion') {
                    embedUrl = `https://www.dailymotion.com/embed/video/${video.videoId}${video.autoplay ? '?autoplay=1' : ''}${video.muted ? '&mute=1' : ''}`;
                }

                const videoHtml = `
                    <div class="user-policy-video-container user-policy-video-${video.position}">
                        ${video.title ? `<h4 class="user-policy-video-title">${video.title}</h4>` : ''}
                        <div class="user-policy-video-wrapper">
                            <iframe 
                                src="${embedUrl}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                                class="user-policy-video-iframe">
                            </iframe>
                        </div>
                        ${video.caption ? `<p class="user-policy-video-caption">${video.caption}</p>` : ''}
                    </div>
                `;
                content = content.replace(placeholder, videoHtml);
            });
        }

        return content;
    };

    if (loading) {
        return (
            <div className="user-policy-container">
                <div className="user-policy-loading">
                    <div className="user-policy-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-policy-container">
                <div className="user-policy-error">
                    <p>{error}</p>
                    <button className="user-policy-btn" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!selectedPolicy) {
        return (
            <div className="user-policy-container">
                <div className="user-policy-header">
                    <h1 className="user-policy-main-title">Our Policies</h1>
                    <p className="user-policy-subtitle">Select a policy to view details</p>
                </div>

                <div className="user-policy-list">
                    {policies.length > 0 ? (
                        policies.map((policy) => (
                            <div 
                                key={policy._id} 
                                className="user-policy-card"
                                onClick={() => handlePolicySelect(policy.policyType)}
                            >
                                <div className="user-policy-card-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <h2 className="user-policy-card-title">{policy.policyType}</h2>
                                <p className="user-policy-card-action">Click to view →</p>
                            </div>
                        ))
                    ) : (
                        <div className="user-policy-empty">
                            <p>No policies available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="user-policy-container">
            <div className="user-policy-viewer">
                <div className="user-policy-viewer-header">
                    <button className="user-policy-back-btn" onClick={handleBackToList}>
                        ← Back to Policies
                    </button>
                    <h1 className="user-policy-viewer-title">{selectedPolicy.policyType}</h1>
                </div>

                {selectedPolicy.tabs && selectedPolicy.tabs.length > 0 && (
                    <div className="user-policy-tabs">
                        {selectedPolicy.tabs.map((tab) => (
                            <button
                                key={tab._id}
                                className={`user-policy-tab-btn ${activeTab?._id === tab._id ? 'user-policy-tab-active' : ''}`}
                                onClick={() => handleTabSelect(tab)}
                            >
                                {tab.tabName}
                            </button>
                        ))}
                    </div>
                )}

                <div className="user-policy-content-wrapper">
                    {activeTab ? (
                        <div className="user-policy-content">
                            <h2 className="user-policy-content-title">{activeTab.tabName}</h2>
                            <div 
                                className="user-policy-rendered-content"
                                dangerouslySetInnerHTML={{ __html: renderContent(activeTab) }}
                            />

                            {activeTab.documents && activeTab.documents.length > 0 && (
                                <div className="user-policy-documents">
                                    <h3 className="user-policy-documents-title">Related Documents</h3>
                                    <div className="user-policy-documents-list">
                                        {activeTab.documents.map((doc) => (
                                            <a
                                                key={doc.documentId}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="user-policy-document-link"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                </svg>
                                                <span>{doc.filename || 'Download Document'}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="user-policy-metadata">
                               <p>Last updated: {new Date(selectedPolicy.updatedAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
})}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="user-policy-no-content">
                            <p>Select a tab to view its content</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserPolicy;