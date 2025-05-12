// src/pages/Contact.js
import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import './contact.css';
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const validateEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setSubmitStatus({
      loading: true,
      success: false,
      error: null
    });
    
    try {
      const response = await axios.post('https://connectwithaaditiyamg.onrender.com/api/contact', formData);
      
      setSubmitStatus({
        loading: false,
        success: true,
        error: null
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      
      // Clear success message after 5 seconds
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

  return (
    <section className="section">
      <h2 className="section-title">Contact Me</h2>
      <div className="card">
        <div className="contact-grid">
          <div className="contact-info">
            <h3 className="card-title">Get In Touch</h3>
            <p className="card-text">
              I'm excited to connect and discuss new projects, creative ideas, or opportunities to bring your vision to life. Reach out anytime!
            </p>
            <div className="contact-details">
              {[
                {
                  icon: <FaEnvelope className="contact-icon" />,
                  title: 'Email',
                  value: 'aaditiyatyagi123@gmail.com',
                  href: 'mailto:aaditiyatyagi123@gmail.com',
                },
                {
                  icon: <FaPhone className="contact-icon" />,
                  title: 'Phone',
                  value: '+91-7351102036',
                  href: 'tel:+917351102036',
                },
                {
                  icon: <FaMapMarkerAlt className="contact-icon" />,
                  title: 'Location',
                  value: 'Ghaziabad, Uttar Pradesh, India - 201003',
                },
              ].map((item, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-icon-container">{item.icon}</div>
                  <div>
                    <h4 className="contact-title">{item.title}</h4>
                    {item.href ? (
                      <a href={item.href} className="contact-link">{item.value}</a>
                    ) : (
                      <p className="contact-value">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="contact-form">
            <h3 className="card-title">Send a Message</h3>
            
            {submitStatus.success && (
              <div className="alert alert-success">
                Your message has been sent successfully! I'll get back to you soon.
              </div>
            )}
            
            {submitStatus.error && (
              <div className="alert alert-error">
                {submitStatus.error}
              </div>
            )}
            
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  id="message"
                  rows="5"
                  className={`form-textarea ${errors.message ? 'input-error' : ''}`}
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
                {errors.message && <p className="error-text">{errors.message}</p>}
              </div>
              
              <button 
                type="submit" 
                className="button-primary"
                disabled={submitStatus.loading}
              >
                {submitStatus.loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;