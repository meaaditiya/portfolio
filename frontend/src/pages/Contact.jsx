import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaQuestionCircle, FaProjectDiagram, FaArrowLeft, FaTimes, FaCheckCircle, FaExclamationTriangle, FaMicrophone, FaStop, FaPlay, FaPause } from 'react-icons/fa';
import axios from 'axios';
import '../pagesCSS/contact.css';

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
    files: []
  });

  // Audio recording states
  const [audioData, setAudioData] = useState({
    name: '',
    email: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({
    type: '', // 'success' or 'error'
    title: '',
    message: '',
    isProject: false
  });
  
  const [activeSection, setActiveSection] = useState('contact'); // 'contact', 'project', 'audio'

  const frequentQueries = [
    "What technologies do you work with as a full-stack developer?",
    "Can you build responsive and mobile-friendly web applications?",
    "Do you handle both frontend and backend development?",
    "Are your applications secure and scalable?",
    "Do you offer support for deployment and hosting?"
  ];

  // Auto-close popup after 8 seconds
  useEffect(() => {
    let timer;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 8000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showPopup]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const showFullScreenPopup = (type, title, message, isProject = false) => {
    setPopupData({ type, title, message, isProject });
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const validate = (isProject = false, isAudio = false) => {
    const newErrors = {};
    let data;
    
    if (isAudio) {
      data = audioData;
    } else {
      data = isProject ? projectData : formData;
    }
    
    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (isAudio && !audioBlob) {
      newErrors.audio = 'Please record an audio message';
    }
    
    if (isProject) {
      if (!data.projectType.trim()) {
        newErrors.projectType = 'Project type is required';
      }
      if (!data.description.trim()) {
        newErrors.description = 'Project description is required';
      }
    } else if (!isAudio) {
      if (!data.message.trim()) {
        newErrors.message = 'Message is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e, isProject = false, isAudio = false) => {
    const { id, value, files } = e.target;
    let setter;
    
    if (isAudio) {
      setter = setAudioData;
    } else {
      setter = isProject ? setProjectData : setFormData;
    }
    
    if (isProject && id === 'files') {
      setter(prev => ({
        ...prev,
        files: Array.from(files)
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
    // Scroll to the message textarea
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
      messageTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setAudioLoaded(false);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playAudio = async () => {
    if (audioRef.current) {
      try {
        setIsPlaying(true);
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingDuration(0);
    setIsPlaying(false);
    setAudioLoaded(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const isProject = activeSection === 'project';
  const isAudio = activeSection === 'audio';
  
  if (!validate(isProject, isAudio)) {
    return;
  }
  
  setSubmitStatus({
    loading: true,
    success: false,
    error: null
  });
  
  try {
    if (isAudio) {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', audioData.name);
      formDataToSend.append('email', audioData.email);
      formDataToSend.append('duration', recordingDuration.toString());
      formDataToSend.append('transcription', ''); // Add transcription if available
      
      // Convert audioBlob to File object for proper upload
      const audioFile = new File([audioBlob], 'audio-recording.wav', {
        type: audioBlob.type || 'audio/wav'
      });
      formDataToSend.append('audioFile', audioFile);

      const response = await axios.post('https://connectwithaaditiyamg.onrender.com/api/audio-contact', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reset form and audio data
      setAudioData({
        name: '',
        email: ''
      });
      resetRecording();

      showFullScreenPopup(
        'success',
        'Audio Message Sent!',
        response.data.message || 'Thank you for your audio message! I\'ve received your recording and will listen to it shortly. I\'ll get back to you via email soon.',
        false
      );
    } else if (isProject) {
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
      
      // Append multiple files
      if (projectData.files && projectData.files.length > 0) {
        for (let i = 0; i < projectData.files.length; i++) {
          formDataToSend.append('files', projectData.files[i]);
        }
      }

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
        files: []
      });

      showFullScreenPopup(
        'success',
        'Project Request Submitted!',
        'Thank you for your project request! I\'ve received all the details and will review your requirements carefully. I\'ll get back to you with a detailed quote and timeline within 24-48 hours.',
        true
      );
    } else {
      // Regular contact form
      const response = await axios.post('https://connectwithaaditiyamg.onrender.com/api/contact', formData);
      
      setFormData({
        name: '',
        email: '',
        message: ''
      });

      showFullScreenPopup(
        'success',
        'Message Sent Successfully!',
        'Thanks for reaching out! Your message has been delivered successfully. I\'ll get back to you as soon as possible, usually within 24 hours.',
        false
      );
    }
    
    setSubmitStatus({
      loading: false,
      success: true,
      error: null
    });
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
    
    setSubmitStatus({
      loading: false,
      success: false,
      error: errorMessage
    });

    showFullScreenPopup(
      'error',
      'Submission Failed',
      `Oops! ${errorMessage} Please check your internet connection and try again. If the problem persists, you can reach me directly at aaditiyatyagi123@gmail.com`,
      isProject || isAudio
    );
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
          Request a Project 
        </button>
        <button 
          className="cnt-action-btn-project2"
          onClick={() => setActiveSection('audio')}
        >
          <FaMicrophone className="cnt-action-icon" />
          Send Audio Message
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

  const renderAudioSection = () => (
  <>
    <div className="cnt-section-headers">
      <button 
        className="cnt-back-btn"
        onClick={() => setActiveSection('contact')}
      >
        <FaArrowLeft className="cnt-back-icon" />
        Back to Contact
      </button>
      <h3 className="cnt-section-subtitle">Send Audio Message</h3>
    </div>

    <div className="cnt-project-form-container">
      <form className="cnt-form" onSubmit={handleSubmit}>
        <div className="cnt-form-row">
          <div className="cnt-form-group">
            <label htmlFor="name" className="cnt-form-label">Full Name *</label>
            <input
              type="text"
              id="name"
              className={`cnt-form-input ${errors.name ? 'cnt-input-error' : ''}`}
              placeholder="Your Full Name"
              value={audioData.name}
              onChange={(e) => handleChange(e, false, true)}
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
              value={audioData.email}
              onChange={(e) => handleChange(e, false, true)}
            />
            {errors.email && <p className="cnt-error-text">{errors.email}</p>}
          </div>
        </div>

        <div className="cnt-form-group">
          <label className="cnt-form-label">Audio Message *</label>
          <div className="cnt-audio-recorder">
            {!audioBlob ? (
              <div className="cnt-record-section">
                <button
                  type="button"
                  className={`cnt-record-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? <FaStop /> : <FaMicrophone />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                {isRecording && (
                  <div className="cnt-recording-info">
                    <span className="cnt-recording-indicator">● REC</span>
                    <span className="cnt-recording-duration">{formatTime(recordingDuration)}</span>
                    <div className="cnt-audio-waves">
                      <div className="cnt-wave-bar"></div>
                      <div className="cnt-wave-bar"></div>
                      <div className="cnt-wave-bar"></div>
                      <div className="cnt-wave-bar"></div>
                      <div className="cnt-wave-bar"></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="cnt-audio-preview">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onLoadedData={() => setAudioLoaded(true)}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  preload="auto"
                />
                <div className="cnt-audio-controls">
                  <button
                    type="button"
                    className="cnt-play-btn"
                    onClick={isPlaying ? pauseAudio : playAudio}
                    disabled={!audioLoaded}
                  >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <div className="cnt-audio-waves static">
                    <div className="cnt-wave-bar"></div>
                    <div className="cnt-wave-bar"></div>
                    <div className="cnt-wave-bar"></div>
                    <div className="cnt-wave-bar"></div>
                    <div className="cnt-wave-bar"></div>
                  </div>
                  <span className="cnt-audio-duration">Duration: {formatTime(recordingDuration)}</span>
                  <button
                    type="button"
                    className="cnt-reset-btn"
                    onClick={resetRecording}
                  >
                    Record Again
                  </button>
                </div>
              </div>
            )}
            {errors.audio && <p className="cnt-error-text">{errors.audio}</p>}
          </div>
        </div>

        <button 
          type="submit" 
          className="cnt-btn-primary cnt-btn-large"
          disabled={submitStatus.loading || !audioBlob}
        >
          {submitStatus.loading ? 'Sending Audio...' : 'Send Audio Message'}
        </button>
      </form>
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
            <label htmlFor="files" className="cnt-form-label">Upload Files (Optional - Max 5 files)</label>
            <input
              type="file"
              id="files"
              multiple
              className="cnt-form-input"
              onChange={(e) => handleChange(e, true)}
            />
            {projectData.files && projectData.files.length > 0 && (
              <div className="cnt-file-list">
                <p>Selected files:</p>
                <ul>
                  {Array.from(projectData.files).map((file, index) => (
                    <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                  ))}
                </ul>
              </div>
            )}
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

  const renderFullScreenPopup = () => (
    <div className="cnt-popup-overlay">
      <div className="cnt-popup-container">
        <button className="cnt-popup-close" onClick={closePopup}>
          <FaTimes />
        </button>
        
        <div className="cnt-popup-content">
          <div className={`cnt-popup-icon ${popupData.type}`}>
            {popupData.type === 'success' ? (
              <FaCheckCircle size={60} />
            ) : (
              <FaExclamationTriangle size={60} />
            )}
          </div>
          
          <h2 className="cnt-popup-title">{popupData.title}</h2>
          <p className="cnt-popup-message">{popupData.message}</p>
          
          <div className="cnt-popup-actions">
            <button className="cnt-popup-btn" onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section className="cnt-main-section">
        <h2 className="cnt-section-title">
          {activeSection === 'contact' ? 'Contact Me' : activeSection === 'project' ? 'Project Request' : 'Send Audio Message'}
        </h2>
        <div className="cnt-card">
          {activeSection === 'contact' && renderContactSection()}
          {activeSection === 'project' && renderProjectSection()}
          {activeSection === 'audio' && renderAudioSection()}
        </div>
      </section>

      {showPopup && renderFullScreenPopup()}
    </>
  );
};

export default Contact;