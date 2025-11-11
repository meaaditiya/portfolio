import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaQuestionCircle, FaProjectDiagram, FaArrowLeft, FaTimes, FaCheckCircle, FaExclamationTriangle, FaMicrophone, FaStop, FaPlay, FaPause } from 'react-icons/fa';
import axios from 'axios';
import '../pagesCSS/contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    otp: ''
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
    files: [],
    otp: ''
  });

  // Audio recording states
  const [audioData, setAudioData] = useState({
    name: '',
    email: '',
    transcription: '',
    otp: ''
  });
  
  // OTP states
  const [otpSent, setOtpSent] = useState({
    contact: false,
    project: false,
    audio: false
  });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(true);
  const otpTimerRef = useRef(null);
  
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
    const [submitQueryStatus, setSubmitQueryStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
    const [checkQueryStatus, setCheckQueryStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({
    type: '',
    title: '',
    message: '',
    isProject: false
  });
  
  const [activeSection, setActiveSection] = useState('contact');

  const frequentQueries = [
    "What technologies do you work with as a full-stack developer?",
    "Can you build responsive and mobile-friendly web applications?",
    "Do you handle both frontend and backend development?",
    "Are your applications secure and scalable?",
    "Do you offer support for deployment and hosting?"
  ];
const [querySection, setQuerySection] = useState(false); // Toggle query form
const [checkQuerySection, setCheckQuerySection] = useState(false); // Toggle check query
const [queryFormData, setQueryFormData] = useState({
  name: '',
  email: '',
  queryText: ''
});
const [ticketId, setTicketId] = useState('');
const [queryResult, setQueryResult] = useState(null);
const [queryErrors, setQueryErrors] = useState({});
const [showQueryPopup, setShowQueryPopup] = useState(false);
const [queryPopupData, setQueryPopupData] = useState({
  ticketId: '',
  message: ''
});

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

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      otpTimerRef.current = setTimeout(() => {
        setOtpTimer(otpTimer - 1);
      }, 1000);
    } else if (otpTimer === 0 && !canResendOtp) {
      setCanResendOtp(true);
    }
    return () => {
      if (otpTimerRef.current) clearTimeout(otpTimerRef.current);
    };
  }, [otpTimer, canResendOtp]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (otpTimerRef.current) {
        clearTimeout(otpTimerRef.current);
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
const showqueryPopup = (ticketId, message) => {
  setQueryPopupData({ ticketId, message });
  setShowQueryPopup(true);
};
const closeQueryPopup = () => {
  setShowQueryPopup(false);
  setQueryPopupData({ ticketId: '', message: '' });
};
const copyTicketId = () => {
  navigator.clipboard.writeText(queryPopupData.ticketId);
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
    
    // Validate OTP if sent
    const sectionKey = isAudio ? 'audio' : isProject ? 'project' : 'contact';
    if (otpSent[sectionKey] && !data.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (otpSent[sectionKey] && data.otp.trim().length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
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

  const handleOtpChange = (index, value, isProject = false, isAudio = false) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    let setter;
    if (isAudio) {
      setter = setAudioData;
    } else {
      setter = isProject ? setProjectData : setFormData;
    }
    
    setter(prev => {
      const otpArray = prev.otp.split('');
      otpArray[index] = value;
      return {
        ...prev,
        otp: otpArray.join('')
      };
    });
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    if (errors.otp) {
      setErrors(prev => ({
        ...prev,
        otp: null
      }));
    }
  };

  const handleOtpKeyDown = (index, e, isProject = false, isAudio = false) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e, isProject = false, isAudio = false) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;
    
    let setter;
    if (isAudio) {
      setter = setAudioData;
    } else {
      setter = isProject ? setProjectData : setFormData;
    }
    
    setter(prev => ({
      ...prev,
      otp: pastedData.padEnd(6, '')
    }));
    
    // Focus the last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    const lastInput = document.getElementById(`otp-${lastIndex}`);
    if (lastInput) lastInput.focus();
  };

  const sendOtp = async (isProject = false, isAudio = false) => {
    const data = isAudio ? audioData : isProject ? projectData : formData;
    
    if (!data.email.trim()) {
      setErrors({ email: 'Email is required to send OTP' });
      return;
    }
    
    if (!validateEmail(data.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    setOtpLoading(true);
    
 let otpEndpoint = 'https://connectwithaaditiyamg.onrender.com/api/contact/send-otp';
    if (isProject) {
      otpEndpoint = 'https://connectwithaaditiyamg.onrender.com/api/project/send-otp';
    } else if (isAudio) {
      otpEndpoint = 'https://connectwithaaditiyamg.onrender.com/api/audio-contact/send-otp';
    }
    
    try {
      const response = await axios.post(otpEndpoint, {
        email: data.email
      });
      
      const sectionKey = isAudio ? 'audio' : isProject ? 'project' : 'contact';
      setOtpSent(prev => ({
        ...prev,
        [sectionKey]: true
      }));
      
      setOtpTimer(120); // 60 seconds cooldown
      setCanResendOtp(false);
      
      showFullScreenPopup(
        'success',
        'OTP Sent!',
        response.data.message || 'OTP has been sent to your email. Please check your inbox.',
        false
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      showFullScreenPopup(
        'error',
        'OTP Failed',
        errorMessage,
        false
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFrequentQuery = (query) => {
    setFormData(prev => ({
      ...prev,
      message: query
    }));
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
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
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
    const sectionKey = isAudio ? 'audio' : isProject ? 'project' : 'contact';
    
    // Check if OTP is sent
    if (!otpSent[sectionKey]) {
      showFullScreenPopup(
        'error',
        'OTP Required',
        'Please verify your email by requesting and entering the OTP first.',
        false
      );
      return;
    }
    
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
        const formDataToSend = new FormData();
        formDataToSend.append('name', audioData.name);
        formDataToSend.append('email', audioData.email);
        formDataToSend.append('duration', recordingDuration.toString());
        formDataToSend.append('transcription', audioData.transcription);
        formDataToSend.append('otp', audioData.otp);
        
        const audioFile = new File([audioBlob], 'audio-recording.wav', {
          type: audioBlob.type || 'audio/wav'
        });
        formDataToSend.append('audioFile', audioFile);

        const response = await axios.post('https://connectwithaaditiyamg.onrender.com/api/audio-contact', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setAudioData({
          name: '',
          email: '',
          transcription: '',
          otp: ''
        });
        resetRecording();
        setOtpSent(prev => ({ ...prev, audio: false }));

        showFullScreenPopup(
          'success',
          'Audio Message Sent!',
          response.data.message || 'Thank you for your audio message! I\'ve received your recording and will listen to it shortly.',
          false
        );
      } else if (isProject) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', projectData.name);
        formDataToSend.append('email', projectData.email);
        formDataToSend.append('projectType', projectData.projectType);
        formDataToSend.append('description', projectData.description);
        formDataToSend.append('otp', projectData.otp);
        if (projectData.budget) formDataToSend.append('budget', projectData.budget);
        if (projectData.timeline) formDataToSend.append('timeline', projectData.timeline);
        if (projectData.features) formDataToSend.append('features', projectData.features);
        if (projectData.techPreferences) formDataToSend.append('techPreferences', projectData.techPreferences);
        if (projectData.additionalInfo) formDataToSend.append('additionalInfo', projectData.additionalInfo);
        
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
          files: [],
          otp: ''
        });
        setOtpSent(prev => ({ ...prev, project: false }));

        showFullScreenPopup(
          'success',
          'Project Request Submitted!',
          'Thank you for your project request! I\'ll review your requirements and get back to you within 24-48 hours.',
          true
        );
      } else {
        const response = await axios.post('https://connectwithaaditiyamg.onrender.com/api/contact', formData);
        
        setFormData({
          name: '',
          email: '',
          message: '',
          otp: ''
        });
        setOtpSent(prev => ({ ...prev, contact: false }));

        showFullScreenPopup(
          'success',
          'Message Sent Successfully!',
          'Thanks for reaching out! I\'ll get back to you as soon as possible.',
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
        `Oops! ${errorMessage}`,
        isProject || isAudio
      );
    }
  };

  const renderOtpInput = (isProject = false, isAudio = false) => {
    const data = isAudio ? audioData : isProject ? projectData : formData;
    const sectionKey = isAudio ? 'audio' : isProject ? 'project' : 'contact';
    
    return (
      <div className="cnt-form-group">
        <label className="cnt-form-label">
          Email Verification {otpSent[sectionKey] ? '*' : '(Required)'}
        </label>
        
        {!otpSent[sectionKey] ? (
          <button
            type="button"
            className="cnt-btn-otp"
            onClick={() => sendOtp(isProject, isAudio)}
            disabled={otpLoading || !data.email}
          >
            {otpLoading ? 'Sending OTP...' : 'Get OTP'}
          </button>
        ) : (
          <>
            <div className="cnt-otp-container">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  className={`cnt-otp-input ${errors.otp ? 'cnt-input-error' : ''}`}
                  value={data.otp[index] || ''}
                  onChange={(e) => handleOtpChange(index, e.target.value, isProject, isAudio)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e, isProject, isAudio)}
                  onPaste={(e) => handleOtpPaste(e, isProject, isAudio)}
                />
              ))}
            </div>
            {errors.otp && <p className="cnt-error-text">{errors.otp}</p>}
            
            <div className="cnt-otp-actions">
              {canResendOtp ? (
                <button
                  type="button"
                  className="cnt-btn-resend"
                  onClick={() => sendOtp(isProject, isAudio)}
                  disabled={otpLoading}
                >
                  Resend OTP
                </button>
              ) : (
                <p className="cnt-otp-timer">Resend OTP in {otpTimer}s</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderContactSection = () => (
    <>
      <div className="cnt-actions">
        <button 
          className="cnt-action-btn-project generate-summary-btn"
          onClick={() => setActiveSection('project')}
        >
          <FaProjectDiagram className="cnt-action-icon" />
          Request a Project 
        </button>
        <button 
          className="cnt-action-btn-project2 generate-summary-btn"
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
            
            {renderOtpInput(false, false)}
            
            <button 
              type="submit" 
              className="cnt-btn-primary "
              disabled={submitStatus.loading || !otpSent.contact}
            >
              {submitStatus.loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
          {renderQuerySection()}
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
            <label htmlFor="transcription" className="cnt-form-label">Transcription (Optional)</label>
            <input
              type="text"
              id="transcription"
              className="cnt-form-input"
              placeholder="Add text version of your message"
              value={audioData.transcription}
              onChange={(e) => handleChange(e, false, true)}
            />
          </div>

          <div className="cnt-form-group audio-form">
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

          {renderOtpInput(false, true)}

          <button 
            type="submit" 
            className="cnt-btn-primary"
            disabled={submitStatus.loading || !audioBlob || !otpSent.audio}
          >
            <FaMicrophone className="cnt-action-icon2" />
            {submitStatus.loading ? 'Sending Audio...' : 'Send Audio'}
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
              placeholder="List the key features and functionalities you need"
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
              placeholder="Any specific technologies you prefer or need to avoid?"
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
              placeholder="Any additional details, special requirements, or questions?"
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

          {renderOtpInput(true, false)}

          <button 
            type="submit" 
            className="cnt-btn-primary"
            disabled={submitStatus.loading || !otpSent.project}
          >
            {submitStatus.loading ? 'Sending Request...' : 'Submit Project Request'}
          </button>
        </form>
      </div>
    </>
  );

  const renderFullScreenPopup = () => (
  <div className="usersubmit-overlay" onClick={closePopup}>
    <div className="usersubmit-modal" onClick={(e) => e.stopPropagation()}>
   
      
      <div className={`usersubmit-successicon ${popupData.type}`}>
        {popupData.type === 'success' ? (
          <FaCheckCircle size={60} />
        ) : (
          <FaExclamationTriangle size={60} />
        )}
      </div>
      
      <h3 className="usersubmit-title">{popupData.title}</h3>
      <p className="usersubmit-message">{popupData.message}</p>
      
      <div className="usersubmit-actions">
        <button className="usersubmit-btn-small" onClick={closePopup}>
          Close
        </button>
      </div>
    </div>
  </div>
);
const renderQueryPopup = () => (
  <div className="usersubmit-overlay" onClick={closeQueryPopup}>
    <div className="usersubmit-modal" onClick={(e) => e.stopPropagation()}>
    
      <div className="usersubmit-successicon success">
        <FaCheckCircle size={60} />
      </div>
      
      <h3 className="usersubmit-title">Query Submitted Successfully!</h3>
      <p className="usersubmit-message">{queryPopupData.message}</p>
      
      <div className="cnt-ticket-id-section">
        <label className="cnt-ticket-label">Your Ticket Reference ID:</label>
        <div className="cnt-ticket-display">
          <span className="usersubmit-modalid">{queryPopupData.ticketId}</span>
        </div>
        <button
          className="usersubmit-btn-small"
          onClick={(e) => {
            copyTicketId();
            e.target.innerText = "Copied";
            setTimeout(() => {
              e.target.innerText = "Copy";
            }, 10000);
          }}
          title="Copy Ticket ID"
        >
          Copy
        </button>
        <p className="cnt-ticket-note">
          Please save this Ticket ID. You'll need it to check your query status.
        </p>
      </div>
      
      <div className="usersubmit-actions">
        <button className="usersubmit-btn-small" onClick={closeQueryPopup}>
          Close
        </button>
      </div>
    </div>
  </div>
);
  const handleQueryChange = (e) => {
  const { id, value } = e.target;
  setQueryFormData(prev => ({
    ...prev,
    [id]: value
  }));
  if (queryErrors[id]) {
    setQueryErrors(prev => ({
      ...prev,
      [id]: null
    }));
  }
};

// Add validation for query form
const validateQuery = () => {
  const newErrors = {};
  
  if (!queryFormData.name.trim()) {
    newErrors.name = 'Name is required';
  }
  
  if (!queryFormData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!validateEmail(queryFormData.email)) {
    newErrors.email = 'Please enter a valid email address';
  }
  
  if (!queryFormData.queryText.trim()) {
    newErrors.queryText = 'Query text is required';
  }
  
  setQueryErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Add function to submit query
const handleQuerySubmit = async (e) => {
  e.preventDefault();
  
  if (!validateQuery()) {
    return;
  }
  
  setSubmitQueryStatus({
    loading: true,
    success: false,
    error: null
  });
  
  try {
    const response = await axios.post('https://connectwithaaditiyamg.onrender.com/api/queries/create', queryFormData);
    
    showqueryPopup(
     response.data.ticketId,
      'Your query has been submitted successfully. Please save your Ticket ID for future reference.'
    );
    
    setQueryFormData({
      name: '',
      email: '',
      queryText: ''
    });
    
   setSubmitQueryStatus({
      loading: false,
      success: true,
      error: null
    });
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to submit query. Please try again.';
    
    showFullScreenPopup(
      'error',
      'Query Submission Failed',
      errorMessage,
      false
    );
    
    setSubmitQueryStatus({
      loading: false,
      success: false,
      error: errorMessage
    });
  }
};

// Add function to check query status
const handleCheckQuery = async (e) => {
  e.preventDefault();
  
  if (!ticketId.trim()) {
    setQueryErrors({ ticketId: 'Ticket ID is required' });
    return;
  }
  const raw = ticketId;
const normalized = String(raw)
  .trim()
  .replace(/\u00A0/g, "")
  .replace(/[\u200B-\u200D]/g, "")
  .replace(/\s+/g, "")
  .toUpperCase();

if (!/^QRY\d{12}$/.test(normalized)) {
  setQueryErrors({
    ticketId:
      'Invalid Ticket ID format. Expected "QRY" followed by 12 digits.'
  });
  return;
}
  setCheckQueryStatus({
    loading: true,
    success: false,
    error: null
  });
  
  try {
    const response = await axios.get(`https://connectwithaaditiyamg.onrender.com/api/queries/check/${ticketId}`);
    setQueryResult(response.data);
    setQueryErrors({});
    
    setCheckQueryStatus({
      loading: false,
      success: true,
      error: null
    });
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to check query status.';
    setQueryResult(null);
    setQueryErrors({ ticketId: errorMessage });
    
    setCheckQueryStatus({
      loading: false,
      success: false,
      error: errorMessage
    });
  }
};

// Add this render function for the Query Section
const renderQuerySection = () => (
  <div className="cnt-query-section">
   
    <div className="cnt-actions">
    

      <button 
        className="btn-1024 cnt-btn-otp query-btn generate-summary-btn"
        onClick={() => {
          setQuerySection(!querySection);
          setCheckQuerySection(false);
          setQueryResult(null);
        }}
      >
        {querySection ? 'Hide Query Form' : 'Raise Quick Query'}
      </button>
      
      <button 
        className="btn-1024 cnt-btn-otp query-btn generate-summary-btn"
        onClick={() => {
          setCheckQuerySection(!checkQuerySection);
          setQuerySection(false);
        }}
      >
        {checkQuerySection ? 'Hide Check Status' : 'Check Query Status'}
      </button>
    </div>

    {querySection && (
      <div className="cnt-form-container" style={{ marginTop: '20px' }}>
        <h3 className="cnt-card-title">Raise a Quick Query</h3>
        <form className="cnt-form" onSubmit={handleQuerySubmit}>
          <div className="cnt-form-group">
            <label htmlFor="name" className="cnt-form-label">Name *</label>
            <input
              type="text"
              id="name"
              className={`cnt-form-input ${queryErrors.name ? 'cnt-input-error' : ''}`}
              placeholder="Your Name"
              value={queryFormData.name}
              onChange={handleQueryChange}
            />
            {queryErrors.name && <p className="cnt-error-text">{queryErrors.name}</p>}
          </div>
          
          <div className="cnt-form-group">
            <label htmlFor="email" className="cnt-form-label">Email *</label>
            <input
              type="email"
              id="email"
              className={`cnt-form-input ${queryErrors.email ? 'cnt-input-error' : ''}`}
              placeholder="Your Email"
              value={queryFormData.email}
              onChange={handleQueryChange}
            />
            {queryErrors.email && <p className="cnt-error-text">{queryErrors.email}</p>}
          </div>
          
          <div className="cnt-form-group">
            <label htmlFor="queryText" className="cnt-form-label">Query *</label>
            <textarea
              id="queryText"
              rows="5"
              className={`cnt-form-textarea ${queryErrors.queryText ? 'cnt-input-error' : ''}`}
              placeholder="Describe your query in detail"
              value={queryFormData.queryText}
              onChange={handleQueryChange}
            ></textarea>
            {queryErrors.queryText && <p className="cnt-error-text">{queryErrors.queryText}</p>}
          </div>
          
          <button 
            type="submit" 
            className="cnt-btn-primary submit-query"
            disabled={submitStatus.loading}
          >
            {submitQueryStatus.loading ? 'Submitting...' : 'Submit Query'}
          </button>
        </form>
      </div>
    )}

    {checkQuerySection && (
      <div className="cnt-form-container" style={{ marginTop: '20px' }}>
        <h3 className="cnt-card-title">Check Query Status</h3>
        <form className="cnt-form" onSubmit={handleCheckQuery}>
          <div className="cnt-form-group">
            <label htmlFor="ticketId" className="cnt-form-label">Ticket ID *</label>
            <input
              type="text"
              id="ticketId"
              maxLength="15"
              className={`cnt-form-input ${queryErrors.ticketId ? 'cnt-input-error' : ''}`}
              placeholder="Enter your 15-digit ticket ID"
              value={ticketId}
              onChange={(e) => {
                setTicketId(e.target.value);
                if (queryErrors.ticketId) {
                  setQueryErrors({});
                }
              }}
            />
            {queryErrors.ticketId && <p className="cnt-error-text">{queryErrors.ticketId}</p>}
          </div>
          
          <button 
            type="submit" 
            className="cnt-btn-primary submit-query"
            disabled={submitStatus.loading}
          >
            {checkQueryStatus.loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {queryResult && (
          <div className="cnt-query-result" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '10px' }}>Query Details</h4>
            <p><strong>Ticket ID:</strong> {queryResult.ticketId}</p>
            <p><strong>Name:</strong> {queryResult.name}</p>
            <p><strong>Email:</strong> {queryResult.email}</p>
            <p><strong>Status:</strong> {queryResult.status}</p>
            <p><strong>Query:</strong> {queryResult.queryText}</p>
            <p><strong>Submitted At:</strong> {new Date(queryResult.submittedAt).toLocaleString()}</p>
            
            {queryResult.adminReply ? (
              <>
                <hr style={{ margin: '15px 0' }} />
                <h4 style={{ marginBottom: '10px', color: 'green' }}>Admin Reply:</h4>
                <p>{queryResult.adminReply}</p>
                <p><strong>Replied At:</strong> {new Date(queryResult.repliedAt).toLocaleString()}</p>
              </>
            ) : (
              <>
                <hr style={{ margin: '15px 0' }} />
                <p style={{ color: 'orange' }}>{queryResult.message}, don't worry the admin will definitely reply to it.</p>
              </>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);

  return (
    <>
      <section className="cnt-main-section">
       <h1 className="cnt-section-title tyagi-hero-title">
                {activeSection === 'contact' ? 'Contact' : activeSection === 'project' ? 'Project' : 'Send Audio'}
              <span className="tyagi-hero-gradient">{activeSection === 'contact' ? ' Me' : activeSection === 'project' ? ' Request' : ' Message'}</span>
            </h1>
            
        <div className="cnt-card">
          {activeSection === 'contact' && renderContactSection()}
          {activeSection === 'project' && renderProjectSection()}
          {activeSection === 'audio' && renderAudioSection()}
        </div>
      </section>

      {showPopup && renderFullScreenPopup()}
      {showQueryPopup && renderQueryPopup()}
    </>
  );
};

export default Contact;