import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaQuestionCircle, FaProjectDiagram, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import './contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [projectData, setProjectData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: '',
    features: '',
    techPreferences: '',
    additionalInfo: '',
    image: null
  });
  
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  
  const [activeSection, setActiveSection] = useState('contact'); // 'contact', 'project'

  const frequentQueries = [
    "What technologies do you work with as a full-stack developer?",
    "Can you build responsive and mobile-friendly web applications?",
    "Do you handle both frontend and backend development?",
    "Are your applications secure and scalable?",
    "Do you offer support for deployment and hosting?"
  ];

  const validateEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const validate = (isProject = false) => {
    const newErrors = {};
    const data = isProject ? projectData : formData;
    
    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (isProject) {
      if (!data.projectType.trim()) {
        newErrors.projectType = 'Project type is required';
      }
      if (!data.description.trim()) {
        newErrors.description = 'Project description is required';
      }
    } else {
      if (!data.message.trim()) {
        newErrors.message = 'Message is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e, isProject = false) => {
    const { id, value, files } = e.target;
    const setter = isProject ? setProjectData : setFormData;
    
    if (isProject && id === 'image') {
      setter(prev => ({
        ...prev,
        image: files[0] || null
      }));
    } else {
      setter(prev => ({
        ...prev,
        [id]: value
      }));
    }
    
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: null
      }));
    }
  };

  const handleFrequentQuery = (query) => {
    setFormData(prev => ({
      ...prev,
      message: query
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isProject = activeSection === 'project';
    
    if (!validate(isProject)) {
      return;
    }
    
    setSubmitStatus({
      loading: true,
      success: false,
      error: null
    });
    
    try {
      if (isProject) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', projectData.name);
        formDataToSend.append('email', projectData.email);
        formDataToSend.append('projectType', projectData.projectType);
        formDataToSend.append('description', projectData.description);
        if (projectData.budget) formDataToSend.append('budget', projectData.budget);
        if (projectData.timeline) formDataToSend.append('timeline', projectData.timeline);
        if (projectData.features) formDataToSend.append('features', projectData.features);
        if (projectData.techPreferences) formDataToSend.append('techPreferences', projectData.techPreferences);
        if (projectData.additionalInfo) formDataToSend.append('additionalInfo', projectData.additionalInfo);
        if (projectData.image) formDataToSend.append('image', projectData.image);

        const response = await axios.post('https://connectwithaaditiyamg.onrender.com/api/project/submit', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setProjectData({
          name: '',
          email: '',
          projectType: '',
          budget: '',
          timeline: '',
          description: '',
          features: '',
          techPreferences: '',
          additionalInfo: '',
          image: null
        });
      } else {
        const response = await axios.post('https://connectwithaaditiyamg.onrender.com/api/contact', formData);
        
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      }
      
      setSubmitStatus({
        loading: false,
        success: true,
        error: null
      });
      
      setTimeout(() => {
        setSubmitStatus(prev => ({
          ...prev,
          success: false
        }));
      }, 5000);
      
    } catch (error) {
      setSubmitStatus({
        loading: false,
        success: false,
        error: error.response?.data?.message || 'Something went wrong. Please try again.'
      });
    }
  };

  const renderContactSection = () => (
    <>
      <div className="cnt-actions">
        <button 
          className="cnt-action-btn-project"
          onClick={() => setActiveSection('project')}
        >
          <FaProjectDiagram className="cnt-action-icon" />
          Request Project 
        </button>
      </div>

      <div className="cnt-grid">
        <div className="cnt-info">
          <h3 className="cnt-card-title">Get In Touch</h3>
          <p className="cnt-card-text">
            I'm excited to connect and discuss new projects, creative ideas, or opportunities to bring your vision to life. Reach out anytime!
          </p>
          <div className="cnt-details">
            {[
              {
                icon: <FaEnvelope className="cnt-icon" />,
                title: 'Email',
                value: 'aaditiyatyagi123@gmail.com',
                href: 'mailto:aaditiyatyagi123@gmail.com',
              },
              {
                icon: <FaPhone className="cnt-icon" />,
                title: 'Phone',
                value: '+91-7351102036',
                href: 'tel:+917351102036',
              },
              {
                icon: <FaMapMarkerAlt className="cnt-icon" />,
                title: 'Location',
                value: 'Ghaziabad, Uttar Pradesh, India - 201003',
              },
            ].map((item, index) => (
              <div key={index} className="cnt-item">
                <div className="cnt-icon-container">{item.icon}</div>
                <div>
                  <h4 className="cnt-title">{item.title}</h4>
                  {item.href ? (
                    <a href={item.href} className="cnt-link">{item.value}</a>
                  ) : (
                    <p className="cnt-value">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="cnt-queries">
            <h4 className="cnt-queries-title">
              <FaQuestionCircle className="cnt-queries-icon" />
              Frequent Queries
            </h4>
            <div className="cnt-queries-list">
              {frequentQueries.map((query, index) => (
                <button
                  key={index}
                  className="cnt-query-btn"
                  onClick={() => handleFrequentQuery(query)}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="cnt-form-container">
          <h3 className="cnt-card-title">Send a Message</h3>
          
          {submitStatus.success && (
            <div className="cnt-notification cnt-notification-success">
              Your message has been sent successfully! I'll get back to you soon.
            </div>
          )}
          
          {submitStatus.error && (
            <div className="cnt-notification cnt-notification-error">
              {submitStatus.error}
            </div>
          )}
          
          <form className="cnt-form" onSubmit={handleSubmit}>
            <div className="cnt-form-group">
              <label htmlFor="name" className="cnt-form-label">Name</label>
              <input
                type="text"
                id="name"
                className={`cnt-form-input ${errors.name ? 'cnt-input-error' : ''}`}
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => handleChange(e, false)}
              />
              {errors.name && <p className="cnt-error-text">{errors.name}</p>}
            </div>
            
            <div className="cnt-form-group">
              <label htmlFor="email" className="cnt-form-label">Email</label>
              <input
                type="email"
                id="email"
                className={`cnt-form-input ${errors.email ? 'cnt-input-error' : ''}`}
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => handleChange(e, false)}
              />
              {errors.email && <p className="cnt-error-text">{errors.email}</p>}
            </div>
            
            <div className="cnt-form-group">
              <label htmlFor="message" className="cnt-form-label">Message</label>
              <textarea
                id="message"
                rows="5"
                className={`cnt-form-textarea ${errors.message ? 'cnt-input-error' : ''}`}
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => handleChange(e, false)}
              ></textarea>
              {errors.message && <p className="cnt-error-text">{errors.message}</p>}
            </div>
            
            <button 
              type="submit" 
              className="cnt-btn-primary"
              disabled={submitStatus.loading}
            >
              {submitStatus.loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </>
  );

  const renderProjectSection = () => (
    <>
      <div className="cnt-section-header">
        <button 
          className="cnt-back-btn"
          onClick={() => setActiveSection('contact')}
        >
          <FaArrowLeft className="cnt-back-icon" />
          Back to Contact
        </button>
        <h3 className="cnt-section-subtitle">Project Request Form</h3>
      </div>

      {submitStatus.success && (
        <div className="cnt-notification cnt-notification-success">
          Your project request has been sent successfully! I'll review your requirements and get back to you with a detailed quote soon.
        </div>
      )}
      
      {submitStatus.error && (
        <div className="cnt-notification cnt-notification-error">
          {submitStatus.error}
        </div>
      )}

      <div className="cnt-project-form-container">
        <form className="cnt-form cnt-project-form" onSubmit={handleSubmit}>
          <div className="cnt-form-row">
            <div className="cnt-form-group">
              <label htmlFor="name" className="cnt-form-label">Full Name *</label>
              <input
                type="text"
                id="name"
                className={`cnt-form-input ${errors.name ? 'cnt-input-error' : ''}`}
                placeholder="Your Full Name"
                value={projectData.name}
                onChange={(e) => handleChange(e, true)}
              />
              {errors.name && <p className="cnt-error-text">{errors.name}</p>}
            </div>
            
            <div className="cnt-form-group">
              <label htmlFor="email" className="cnt-form-label">Email Address *</label>
              <input
                type="email"
                id="email"
                className={`cnt-form-input ${errors.email ? 'cnt-input-error' : ''}`}
                placeholder="your.email@example.com"
                value={projectData.email}
                onChange={(e) => handleChange(e, true)}
              />
              {errors.email && <p className="cnt-error-text">{errors.email}</p>}
            </div>
          </div>

          <div className="cnt-form-row">
            <div className="cnt-form-group">
              <label htmlFor="projectType" className="cnt-form-label">Project Type *</label>
              <select
                id="projectType"
                className={`cnt-form-select ${errors.projectType ? 'cnt-input-error' : ''}`}
                value={projectData.projectType}
                onChange={(e) => handleChange(e, true)}
              >
                <option value="">Select Project Type</option>
                <option value="Web Application">Web Application</option>
                <option value="Mobile App">Mobile App</option>
                <option value="E-commerce Site">E-commerce Site</option>
                <option value="Portfolio Website">Portfolio Website</option>
                <option value="Business Website">Business Website</option>
                <option value="API Development">API Development</option>
                <option value="Database Design">Database Design</option>
                <option value="Other">Other</option>
              </select>
              {errors.projectType && <p className="cnt-error-text">{errors.projectType}</p>}
            </div>
            
            <div className="cnt-form-group">
              <label htmlFor="budget" className="cnt-form-label">Budget Range</label>
              <select
                id="budget"
                className="cnt-form-select"
                value={projectData.budget}
                onChange={(e) => handleChange(e, true)}
              >
                <option value="">Select Budget Range</option>
                <option value="Under $1,000">Under $1,000</option>
                <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                <option value="$25,000+">$25,000+</option>
                <option value="Discuss">Prefer to Discuss</option>
              </select>
            </div>
          </div>

          <div className="cnt-form-group">
            <label htmlFor="timeline" className="cnt-form-label">Project Timeline</label>
            <select
              id="timeline"
              className="cnt-form-select"
              value={projectData.timeline}
              onChange={(e) => handleChange(e, true)}
            >
              <option value="">Select Timeline</option>
              <option value="ASAP">ASAP</option>
              <option value="Within 1 month">Within 1 month</option>
              <option value="1-3 months">1-3 months</option>
              <option value="3-6 months">3-6 months</option>
              <option value="6+ months">6+ months</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div className="cnt-form-group">
            <label htmlFor="description" className="cnt-form-label">Project Description *</label>
            <textarea
              id="description"
              rows="4"
              className={`cnt-form-textarea ${errors.description ? 'cnt-input-error' : ''}`}
              placeholder="Describe your project in detail. What problem does it solve? Who is your target audience?"
              value={projectData.description}
              onChange={(e) => handleChange(e, true)}
            ></textarea>
            {errors.description && <p className="cnt-error-text">{errors.description}</p>}
          </div>

          <div className="cnt-form-group">
            <label htmlFor="features" className="cnt-form-label">Required Features</label>
            <textarea
              id="features"
              rows="3"
              className="cnt-form-textarea"
              placeholder="List the key features and functionalities you need (e.g., user authentication, payment processing, admin dashboard, etc.)"
              value={projectData.features}
              onChange={(e) => handleChange(e, true)}
            ></textarea>
          </div>

          <div className="cnt-form-group">
            <label htmlFor="techPreferences" className="cnt-form-label">Technology Preferences</label>
            <textarea
              id="techPreferences"
              rows="2"
              className="cnt-form-textarea"
              placeholder="Any specific technologies you prefer or need to avoid? (e.g., React, Node.js, Python, specific databases, etc.)"
              value={projectData.techPreferences}
              onChange={(e) => handleChange(e, true)}
            ></textarea>
          </div>

          <div className="cnt-form-group">
            <label htmlFor="additionalInfo" className="cnt-form-label">Additional Information</label>
            <textarea
              id="additionalInfo"
              rows="3"
              className="cnt-form-textarea"
              placeholder="Any additional details, special requirements, or questions you have about the project?"
              value={projectData.additionalInfo}
              onChange={(e) => handleChange(e, true)}
            ></textarea>
          </div>

          <div className="cnt-form-group">
            <label htmlFor="image" className="cnt-form-label">Upload Image (Optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              className="cnt-form-input"
              onChange={(e) => handleChange(e, true)}
            />
          </div>

          <button 
            type="submit" 
            className="cnt-btn-primary cnt-btn-large"
            disabled={submitStatus.loading}
          >
            {submitStatus.loading ? 'Sending Request...' : 'Submit Project Request'}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <section className="cnt-main-section">
      <h2 className="cnt-section-title">
        {activeSection === 'contact' ? 'Contact Me' : 'Project Request'}
      </h2>
      <div className="cnt-card">
        {activeSection === 'contact' ? renderContactSection() : renderProjectSection()}
      </div>
    </section>
  );
};

export default Contact;