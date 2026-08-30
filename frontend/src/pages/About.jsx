import React, { useEffect, useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import '../pagesCSS/about.css';
import '../pagesCSS/jobStatusSlider.css';
import JobStatusSlider from '../components/JobStatusSlider';

const API_BASE_URL = `${import.meta.env.VITE_APP_BACKEND_URL}`;

const FULL_NAME = 'Aaditiya Tyagi';
const TYPE_SPEED = 110;
const ERASE_SPEED = 55;
const HOLD_MS = 1200;
const RESTART_DELAY = 400;

const About = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typedName, setTypedName] = useState('');
  const [minLoadDone, setMinLoadDone] = useState(false);

  const showLoader = loading || !minLoadDone;

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/about`);
        if (!res.ok) throw new Error('Failed to load about details');
        const data = await res.json();
        setAbout(data.about);
      } catch (err) {
        console.error('Error fetching about details:', err);
        setError('Could not load details right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  useEffect(() => {
    const t = setTimeout(
      () => setMinLoadDone(true),
      TYPE_SPEED * FULL_NAME.length + HOLD_MS
    );
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showLoader) return;

    let charIndex = 0;
    let phase = 'typing';
    let timeoutId;

    const tick = () => {
      if (phase === 'typing') {
        charIndex += 1;
        setTypedName(FULL_NAME.slice(0, charIndex));
        if (charIndex >= FULL_NAME.length) {
          phase = 'holding';
          timeoutId = setTimeout(tick, HOLD_MS);
        } else {
          timeoutId = setTimeout(tick, TYPE_SPEED);
        }
      } else if (phase === 'holding') {
        phase = 'erasing';
        timeoutId = setTimeout(tick, ERASE_SPEED);
      } else if (phase === 'erasing') {
        charIndex -= 1;
        setTypedName(FULL_NAME.slice(0, charIndex));
        if (charIndex <= 0) {
          phase = 'pausing';
          timeoutId = setTimeout(tick, RESTART_DELAY);
        } else {
          timeoutId = setTimeout(tick, ERASE_SPEED);
        }
      } else if (phase === 'pausing') {
        phase = 'typing';
        timeoutId = setTimeout(tick, TYPE_SPEED);
      }
    };

    timeoutId = setTimeout(tick, TYPE_SPEED);
    return () => clearTimeout(timeoutId);
  }, [showLoader]);

  const handleDownloadResume = () => {
    if (!about?.resume?.url) return;
    const link = document.createElement('a');
    link.href = about.resume.url;
    link.download = about.resume.originalName || 'Resume.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showLoader) {
    return (
      <section className="about-section">
        <div className="about-container about-loading-wrap">
          <h1 className="hero-main-title loading-typewriter">
            {typedName}
            <span className="loading-cursor">|</span>
          </h1>
        </div>
      </section>
    );
  }

  if (error || !about) {
    return (
      <section className="about-section">
        <div className="about-container about-loading">{error || 'No details found.'}</div>
      </section>
    );
  }

  const sortedSkills = [...(about.skills || [])].sort((a, b) => a.order - b.order);
  const sortedExperience = [...(about.experience || [])].sort((a, b) => a.order - b.order);
  const sortedEducation = [...(about.education || [])].sort((a, b) => a.order - b.order);
  const sortedStatuses = [...(about.jobStatuses || [])].sort((a, b) => a.order - b.order);

  return (
    <section className="about-section">
      <div className="about-container">
        <h1 className="hero-main-title">
          {about.heroTitlePrefix}
          <span className="hero-gradient-text"> {about.heroTitleHighlight}</span>
        </h1>

        <div className="minimal-expertise-section">
          <div className="minimal-skills-grid">
            {sortedSkills.map((skill) => (
              <div key={skill._id} className="minimal-skill-item">
                {skill.logo?.url && (
                  <img src={skill.logo.url} alt={skill.name} className="minimal-skill-logo" />
                )}
                <span className="minimal-skill-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>

        {sortedStatuses.length > 0 && <JobStatusSlider statuses={sortedStatuses} />}

        <div className="about-resume-row about-resume-row-stacked">
          <button
            className="super-button"
            onClick={handleDownloadResume}
            aria-label="Download Resume"
            disabled={!about.resume?.url}
          >
            <Download size={20} />
            <span>{about.resume?.url ? 'Download Resume' : 'Resume unavailable'}</span>
          </button>
        </div>

        <div className="about-single-row">
          <div className="about-card about-summary-card">
            <div className="card-header">
              <div className="tech-logos">
                {sortedSkills.map(
                  (skill) =>
                    skill.logo?.url && (
                      <img key={skill._id} src={skill.logo.url} alt={skill.name} className="tech-logo" />
                    )
                )}
              </div>
              <h3 className="card-title">Professional Summary</h3>
            </div>

            <div className="card-content">
              {sortedExperience.map((exp) => (
                <div key={exp._id} className="education-item" style={{ marginBottom: '14px' }}>
                  <div className="education-item-logos">
                    {exp.companyLogo?.url && (
                      <img src={exp.companyLogo.url} alt={exp.company} className="inline-edu-logo" />
                    )}
                  </div>
                  <div className="education-content">
                    <h4 className="education-degree">{exp.role}</h4>
                    <p className="education-school">{exp.company}</p>
                    <div className="education-meta">
                      <span className="education-duration">
                        <Calendar size={12} />
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <ul className="summary-list">
                {(about.summaryPoints || []).map((point, idx) => (
                  <li key={idx} className="summary-list-item">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="about-card about-education-card">
            <div className="card-header">
              <div className="edu-logos">
                {sortedEducation.map(
                  (edu) =>
                    edu.schoolLogo?.url && (
                      <img key={edu._id} src={edu.schoolLogo.url} alt={edu.school} className="edu-logo" />
                    )
                )}
              </div>
              <h3 className="card-title">Education</h3>
            </div>
            <div className="card-content">
              <div className="education-timeline">
                {sortedEducation.map((edu) => (
                  <div key={edu._id} className="education-item">
                    <div className="education-item-logos">
                      {edu.schoolLogo?.url && (
                        <img src={edu.schoolLogo.url} alt={edu.school} className="inline-edu-logo" />
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
                        {edu.grade && <span className="education-grade">{edu.grade}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;