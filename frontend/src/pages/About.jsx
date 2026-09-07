import React, { useEffect, useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import '../pagesCSS/about.css';
import '../pagesCSS/jobStatusSlider.css';
import JobStatusSlider from '../components/JobStatusSlider';

const API_BASE_URL = `${import.meta.env.VITE_APP_BACKEND_URL}`;

// Static fallback data — shown instantly, replaced silently if/when the backend responds.
const DEFAULT_ABOUT = {
  heroTitlePrefix: 'Full-Stack',
  heroTitleHighlight: 'Developer',
  summaryPoints: [
    'Full-stack Software Engineer skilled in Java, Spring Boot, React.js, Node.js, Express.js, and Angular.',
    'Experience with MongoDB, PostgreSQL, Redis, AWS, and Docker.',
    'Hands-on experience in testing and API validation using Selenium, TestNG, Postman, and SoapUI.',
    'Familiar with Git, Agile methodologies, SDLC, and STLC.',
    'Passionate about continuous learning, open-source contributions, DSA, and building scalable, high-quality software solutions.',
  ],
  skills: [
    { _id: 'skill-node', name: 'Node.js', order: 1, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788073946/uploads/images/fnpykdnrahdlwdn35z08.png' } },
    { _id: 'skill-spring', name: 'Spring Boot', order: 2, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074011/uploads/images/s9eoixyrs57qgiedwivm.png' } },
    { _id: 'skill-js', name: 'JavaScript', order: 3, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074089/uploads/images/dck37prdv3gzchlk7eek.png' } },
    { _id: 'skill-mongo', name: 'MongoDB', order: 4, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074138/uploads/images/k6qebux9cv1mdaufotxp.png' } },
    { _id: 'skill-react', name: 'React.js', order: 4, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074243/uploads/images/p9cpfmp0mljqa6kdgq08.png' } },
    { _id: 'skill-java', name: 'Java', order: 5, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074299/uploads/images/fyid3sohv6begz4zvxht.png' } },
    { _id: 'skill-mysql', name: 'MySQL', order: 6, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074336/uploads/images/suxofeyuwvk0rncslgyt.png' } },
    { _id: 'skill-express', name: 'Express.js', order: 7, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074442/uploads/images/lbuotwvprpnd8qfb9vtd.png' } },
    { _id: 'skill-aws', name: 'AWS', order: 8, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074478/uploads/images/xonkcohegahwgyrngjqo.jpg' } },
    { _id: 'skill-html', name: 'HTML 5', order: 9, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074536/uploads/images/mv41csedypn5vi3sj0tc.webp' } },
    { _id: 'skill-css', name: 'CSS3', order: 10, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074591/uploads/images/ow68zwvwivx5ieghunpj.png' } },
    { _id: 'skill-git', name: 'Git', order: 11, logo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074648/uploads/images/xdn1roqgpcc7x9qccdm4.png' } },
  ],
  experience: [
    {
      _id: 'exp-1',
      role: 'Programmer Analyst - GN',
      company: 'Cognizant Technology Solutions',
      companyLogo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788025270/uploads/images/vs9xjriwpuzw6uueetsc.png' },
      startDate: '21 Jul 2026',
      endDate: 'Present',
      order: 0,
    },
    {
      _id: 'exp-2',
      role: 'Programmer Analyst Intern',
      company: 'Cognizant Technology Solutions',
      companyLogo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788025343/uploads/images/tizkmk6gisuxqgyinwi5.png' },
      startDate: '17 Feb 2026',
      endDate: '12 June 2026',
      order: 1,
    },
  ],
  education: [
    {
      _id: 'edu-1',
      degree: 'B.Tech in Computer Science',
      school: 'KIET Group of Institutions',
      schoolLogo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788074991/uploads/images/kb2axf9ejrmk73vpshlz.webp' },
      duration: '2022 - 2026',
      grade: 'CGPA 8.84 | 85.70%',
      order: 0,
    },
    {
      _id: 'edu-2',
      degree: 'Higher Secondary Education',
      school: 'Vidhaan Public School',
      schoolLogo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788075072/uploads/images/bsakp9wtfijv5nutptyq.jpg' },
      duration: '2021',
      grade: '| 93%',
      order: 1,
    },
    {
      _id: 'edu-3',
      degree: 'Higher Education',
      school: 'SSK Public School',
      schoolLogo: { url: 'https://res.cloudinary.com/dd6sedo9n/image/upload/v1788075131/uploads/images/eoujekujadxzdmsfbv3h.jpg' },
      duration: '2019',
      grade: '| 91.2%',
      order: 2,
    },
  ],
  jobStatuses: [
    { _id: 'status-1', label: 'Open to Work', color: '#21c442', order: 1 },
  ],
  resume: {
    url: 'https://res.cloudinary.com/dd6sedo9n/raw/upload/v1788776555/portfolio/resume/resume-1788776554206.pdf',
    publicId: 'portfolio/resume/resume-1788776554206.pdf',
    originalName: 'Aaditiya_Tyagi_Resume (40).pdf',
  },
};

const About = () => {
  // Start with the fallback data already populated — no loading screen needed.
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/about`);
        if (!res.ok) throw new Error('Failed to load about details');
        const data = await res.json();
        if (data?.about) {
          setAbout(data.about);
        }
      } catch (err) {
        // Backend not reachable yet — keep showing the static fallback data.
        console.error('Error fetching about details, using fallback data:', err);
      }
    };
    fetchAbout();
  }, []);

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