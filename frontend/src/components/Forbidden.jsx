import React from 'react';
import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import '../pagesCSS/forbidden.css';

const Forbidden = () => {
  const [showPopup, setShowPopup] = useState(false);
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [ticketId, setTicketId] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [copied, setCopied] = useState(false);

const handleSubmitQuery = async () => {
  if (!name.trim() || !email.trim()) {
    setError('Please fill all fields');
    return;
  }
  setLoading(true);
  setError('');
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/queries/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        queryText: 'Security system falsely marks me suspicious'
      })
    });
    const data = await response.json();
    if (response.ok) {
      setTicketId(data.ticketId);
      setName('');
      setEmail('');
    } else {
      setError(data.message || 'Failed to submit query');
    }
  } catch (err) {
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="forbidden-page">
      {showPopup && (
  <div className="jpopup-overlay">
    <div className="jpopup-content">
      <button className="jpopup-close" onClick={() => setShowPopup(false)}>×</button>
      <h2 className="jpopup-heading">Security System Falsely Marks Me Suspicious</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="jpopup-input"
      />
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="jpopup-input"
      />
      {!ticketId ? (
        <button onClick={handleSubmitQuery} className="jpopup-button" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Query'}
        </button>
      ) : (
        <div className="ticket-success">
  <label className="ticket-label">Your Ticket ID</label>
  <div className="ticket-box">{ticketId}</div>

  <button
    onClick={() => {
      navigator.clipboard.writeText(ticketId);
      setCopied(true);
    }}
    className="jpopup-button"
  >
    {copied ? 'Copied!' : 'Copy Ticket ID'}
  </button>
</div>

      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  </div>
)}
      <svg 
        className="h-[50vh] aspect-video"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 500 500"
      >
        <g id="background">
          <path 
            d="M55.48,273.73s2.32,72,62.43,120,143.41,51.43,210.84,56,119.23-33.62,127-91.32-43.72-74.64-71.68-140.33S358.64,130.8,299.49,90.4,147.8,74.81,99.29,144,55.48,273.73,55.48,273.73Z" 
            fill="#3B82F6"
          />
          <path 
            d="M55.48,273.73s2.32,72,62.43,120,143.41,51.43,210.84,56,119.23-33.62,127-91.32-43.72-74.64-71.68-140.33S358.64,130.8,299.49,90.4,147.8,74.81,99.29,144,55.48,273.73,55.48,273.73Z" 
            fill="#fff" 
            opacity="0.7"
          />
        </g>
        
        <g id="padlock">
          <path 
            d="M83.61,179.69V153.92c0-18.24,15.16-33.08,33.79-33.08s33.79,14.84,33.79,33.08v25.77h13.47V153.92c0-25.51-21.2-46.27-47.26-46.27s-47.26,20.76-47.26,46.27v25.77Z" 
            fill="none" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <rect 
            x="65.14" 
            y="179.87" 
            width="103.18" 
            height="85.35" 
            fill="none" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M127.46,215.32a11.24,11.24,0,0,0-22.47,0,11,11,0,0,0,5.9,9.68L109,244.38h14.45L121.56,225A11,11,0,0,0,127.46,215.32Z" 
            fill="none" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
        </g>
        
        <g id="character">
          <polygon 
            points="232.64 267.99 206.95 266.3 206.95 265.88 203.79 266.09 200.64 265.88 200.64 266.3 174.95 267.99 156 423.79 174.95 423.79 203.16 299.57 204.43 299.57 232.64 423.79 251.59 423.79 232.64 267.99" 
            fill="#263238" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M156,423.78l-4.63,7.16-14.32,6.32a4.88,4.88,0,0,0-2.52,4.21v5.47h40.84a54.21,54.21,0,0,0,0-8.84c-.42-4.21-.42-14.32-.42-14.32Z" 
            fill="#4c4c4c" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M134.53,442.31v4.63h40.84s.19-2,.19-4.63Z" 
            fill="#263238" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M251.51,423.78l4.63,7.16,14.32,6.32a4.88,4.88,0,0,1,2.52,4.21v5.47H232.14a54.21,54.21,0,0,1,0-8.84c.42-4.21.42-14.32.42-14.32Z" 
            fill="#4c4c4c" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M273,442.31v4.63H232.14s-.18-2-.19-4.63Z" 
            fill="#263238" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M164.07,195.51s-30,42.16-30,45.25,4.77,26.95,12.35,29.19,11.79-1.68,13.19-9.54-3.37-19.09-3.37-19.09l14-12.63Z" 
            fill="#3B82F6" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M158.25,259.29s8.7-1.41,10.95-.85,3.93,5.9,3.93,5.9.84,7.86-.57,9.54-8.14,3.65-10.94,4.21-8.71-5.89-11-9.82S152.35,257.6,158.25,259.29Z" 
            fill="#ccc" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <polygon 
            points="170.38 193.6 164.07 195.51 174.01 261.86 233.09 261.86 242.08 195.89 234.05 192.83 204.41 186.33 170.38 193.6" 
            fill="#3B82F6" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <polygon 
            points="192.75 187.29 167.32 193.6 168.09 196.66 192.94 189.77 192.75 187.29" 
            fill="#263238" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <polygon 
            points="213.59 186.52 239.02 192.83 238.26 195.89 213.4 189.01 213.59 186.52" 
            fill="#263238" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <polygon 
            points="193.9 184.04 191.03 185.95 191.79 205.26 204.22 196.47 217.22 205.45 218.37 186.33 214.93 183.46 193.9 184.04" 
            fill="#3B82F6" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M219,161.07s7.06-1.72,8.39-8.78S216,136.64,207.18,135.12s-21.75,7.63-23.85,13.93,6.1,12.59,14.88,13.93S219,161.07,219,161.07Z" 
            fill="#263238" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <polygon 
            points="193.52 173.9 193.52 186.52 204.22 196.47 216.27 186.14 216.27 174.29 193.52 173.9" 
            fill="#ccc" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M191.92,158.4s-.58,11.83.38,15.65,7.25,11.83,12.21,13.55,11.83-8.59,13.36-12,.95-17.94.95-17.94-2.09-5-6.29-6.48S195.35,147,191.92,158.4Z" 
            fill="#ccc" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M199.85,164.68c0,.9-.41,1.63-.92,1.63s-.92-.73-.92-1.63.41-1.63.92-1.63S199.85,163.78,199.85,164.68Z" 
            fill="#263238"
          />
          <path 
            d="M211.56,164.68c0,.9-.41,1.63-.92,1.63s-.92-.73-.92-1.63.41-1.63.92-1.63S211.56,163.78,211.56,164.68Z" 
            fill="#263238"
          />
          <rect 
            x="173.13" 
            y="261.25" 
            width="60.63" 
            height="9.54" 
            fill="#4c4c4c" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <rect 
            x="168.92" 
            y="261.81" 
            width="18.53" 
            height="11.79" 
            rx="2.67" 
            fill="#4c4c4c" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <rect 
            x="217.2" 
            y="261.81" 
            width="18.53" 
            height="11.79" 
            rx="2.67" 
            fill="#4c4c4c" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <rect 
            x="197.83" 
            y="261.81" 
            width="13.19" 
            height="8.42" 
            fill="#fff" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M156.28,241.32s-8.42-.56-11.51-5.9" 
            fill="none" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <ellipse 
            cx="249.9" 
            cy="202.02" 
            rx="13.9" 
            ry="14.6" 
            fill="#3B82F6" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <ellipse 
            cx="249.9" 
            cy="194.63" 
            rx="10.88" 
            ry="9.75" 
            fill="#3B82F6" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <ellipse 
            cx="249.9" 
            cy="187.46" 
            rx="10.88" 
            ry="9.75" 
            fill="#ccc" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M232.42,166.44s.19,14.38.92,18.62,3.69,9.77,7.75,9.77a25.53,25.53,0,0,0,7.93-1.47s4.79,2.58,9.4,1.84,3.87-7.19,3.87-10-.55-23.6-.55-23.6.37-2-1.48-2.39a15.8,15.8,0,0,0-2.76-.37v-4.43a3.36,3.36,0,0,0-3.14-1.47c-2.39,0-2.58.55-2.58.55v-4.06s-2-3.23-4.61-1.66a3.68,3.68,0,0,0-1.84,2.95l-.19,3.88s-4.42-1.66-4.79.92S239.24,174,239.24,174a40.86,40.86,0,0,0-1.47-7.38C236.85,164.22,232.42,164.22,232.42,166.44Z" 
            fill="#ccc" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <line 
            x1="245.14" 
            y1="154.64" 
            x2="245.51" 
            y2="171.6" 
            fill="none" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <line 
            x1="251.78" 
            y1="153.53" 
            x2="251.97" 
            y2="171.78" 
            fill="none" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <line 
            x1="257.5" 
            y1="158.88" 
            x2="257.13" 
            y2="171.6" 
            fill="none" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <line 
            x1="242.75" 
            y1="171.42" 
            x2="259.53" 
            y2="172.15" 
            fill="none" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
          <path 
            d="M239.24,174a4.51,4.51,0,0,0,1.81,3.58c1.82,1.14,5.92,4.1,6.37,8.88" 
            fill="none" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
        </g>
        
        <g id="text">
          <path 
            d="M306.54,208.26l22.25-52.61h13.35v52.61h5.78v11.12h-5.78V233.5h-12V219.38H306.54Zm23.58,0V179l-12.34,29.25Z" 
            fill="#263238"
          />
          <path 
            d="M352.48,174.33c0-12.45,6.56-19.57,18.57-19.57s18.58,7.12,18.58,19.57v40.49c0,12.46-6.57,19.57-18.58,19.57s-18.57-7.11-18.57-19.57Zm12.23,41.27c0,5.56,2.45,7.67,6.34,7.67s6.34-2.11,6.34-7.67v-42c0-5.57-2.44-7.68-6.34-7.68s-6.34,2.11-6.34,7.68Z" 
            fill="#263238"
          />
          <path 
            d="M421.1,174.78c0-7-2.44-8.9-6.34-8.9s-6.34,2.11-6.34,7.68v5H396.86v-4.23c0-12.45,6.22-19.57,18.24-19.57s18.24,7.12,18.24,19.57v2c0,8.34-2.67,13.57-8.57,16,6.12,2.67,8.57,8.45,8.57,16.35v6.12c0,12.46-6.23,19.57-18.24,19.57s-18.24-7.11-18.24-19.57v-6.45h11.56v7.23c0,5.56,2.45,7.67,6.34,7.67s6.34-1.89,6.34-8.78v-6.12c0-7.23-2.44-9.9-8-9.9H409V187.35h4.78c4.56,0,7.34-2,7.34-8.23Z" 
            fill="#263238"
          />
        </g>
        
        <g id="barrier">
          <polygon 
            points="86.87 446.5 72.61 446.5 91.62 313.99 105.88 313.99 86.87 446.5" 
            fill="#263238" 
            stroke="#263238" 
            strokeWidth="1.17"
          />
          <polygon 
            points="115.39 446.5 129.64 446.5 110.63 313.99 96.38 313.99 115.39 446.5" 
            fill="#fff" 
            stroke="#263238" 
            strokeWidth="1.17"
          />
          <polygon 
            points="289.18 446.5 274.93 446.5 293.93 313.99 308.19 313.99 289.18 446.5" 
            fill="#263238" 
            stroke="#263238" 
            strokeWidth="1.17"
          />
          <polygon 
            points="317.7 446.5 331.95 446.5 312.94 313.99 298.69 313.99 317.7 446.5" 
            fill="#fff" 
            stroke="#263238" 
            strokeWidth="1.17"
          />
          <rect 
            x="55.73" 
            y="293.21" 
            width="271.93" 
            height="26.36" 
            fill="#3B82F6" 
            stroke="#263238" 
            strokeWidth="1.17"
          />
          <rect 
            x="62.36" 
            y="293.21" 
            width="271.93" 
            height="26.36" 
            fill="#3B82F6" 
            stroke="#263238" 
            strokeWidth="1.17"
          />
          <polygon 
            points="395.49 440.56 344.39 440.56 364.42 331.6 375.46 331.6 395.49 440.56" 
            fill="#3B82F6" 
            stroke="#263238" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.17"
          />
        </g>
      </svg>
      
      <div className="flex flex-col items-center gap-4 px-4">
        <h1 className="text-3xl font-medium text-center text-gray-900">
          You are not authorized
        </h1>
      <p className="text-xl text-center text-gray-600 max-w-md">
  Our security system flagged unusual activity and prevented access to this page.
  If you believe this was a mistake, please contact us at  
</p>
<div className="contact-info">
  <a href="mailto:aaditiyatyagi.dev@gmail.com" className="contact-link">
    <span className="contact-icon-box">
      <Mail className="contact-icon" />
    </span>
    aaditiyatyagi.dev@gmail.com
  </a>

  <a href="tel:+917351102036" className="contact-link">
    <span className="contact-icon-box">
      <Phone className="contact-icon" />
    </span>
    +91 7351102036
  </a>
</div>


<div className="action-buttons">
  <button onClick={() => setShowPopup(true)} className="action-button">
    Raise Query
  </button>
  <button onClick={() => window.location.href = '/contact'} className="action-button">
    Check Status
  </button>
</div>
      </div>
    </div>
  );
};

export default Forbidden;