import { useState, useEffect } from 'react';

export default function Auth() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [forgotForm, setForgotForm] = useState({
    email: ''
  });

  const [resetForm, setResetForm] = useState({
    token: '',
    newPassword: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/user/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchProfile(token);
      } else {
        localStorage.removeItem('token');
        setView('login');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setView('login');
    }
  };

  const fetchProfile = async (token) => {
    try {
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        setView('profile');
      }
    } catch (error) {
      console.error('Profile fetch failed:', error);
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    setForgotForm(prev => ({ ...prev, [name]: value }));
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    fetch('https://connectwithaaditiyamg.onrender.com/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setView('profile');
        setLoginForm({ email: '', password: '' });
      } else {
        setMessage(data.message || 'Login failed');
      }
      setLoading(false);
    })
    .catch(error => {
      setMessage('Login failed');
      setLoading(false);
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    fetch('https://connectwithaaditiyamg.onrender.com/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm)
    })
    .then(response => response.json())
    .then(data => {
      if (data.message && data.message.includes('successful')) {
        setMessage('Registration successful. Check your email to verify.');
        setRegisterForm({ name: '', email: '', password: '' });
        setTimeout(() => setView('login'), 2000);
      } else {
        setMessage(data.message || 'Registration failed');
      }
      setLoading(false);
    })
    .catch(error => {
      setMessage('Registration failed');
      setLoading(false);
    });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    fetch('https://connectwithaaditiyamg.onrender.com/api/user/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forgotForm)
    })
    .then(response => response.json())
    .then(data => {
      setMessage(data.message || 'Password reset link sent to your email');
      setForgotForm({ email: '' });
      setTimeout(() => setView('login'), 3000);
      setLoading(false);
    })
    .catch(error => {
      setMessage('Request failed');
      setLoading(false);
    });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    fetch('https://connectwithaaditiyamg.onrender.com/api/user/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetForm)
    })
    .then(response => response.json())
    .then(data => {
      setMessage(data.message || 'Password reset successful. Login with new password.');
      setResetForm({ token: '', newPassword: '' });
      setTimeout(() => setView('login'), 2000);
      setLoading(false);
    })
    .catch(error => {
      setMessage('Reset failed');
      setLoading(false);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('login');
    setLoginForm({ email: '', password: '' });
  };

  return (
    <>
      <style>{`
        .aaditiya-authentication-wrapper-container-2k9x {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: white;
        }

        .aaditiya-authentication-form-card-panel-7h3m {
          width: 100%;
          max-width: 400px;
          background-color: white;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .aaditiya-authentication-heading-title-text-5n8p {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 24px;
          text-align: center;
          color: black;
          margin-top: 0;
        }

        .aaditiya-authentication-textfield-input-element-4q2w {
          width: 100%;
          padding: 12px;
          margin-bottom: 12px;
          border: 1px solid #d0d0d0;
          font-size: 14px;
          box-sizing: border-box;
          background-color: white;
          color: black;
        }

        .aaditiya-authentication-textfield-input-element-4q2w::placeholder {
          color: #999;
        }

        .aaditiya-authentication-textfield-input-element-4q2w:focus {
          outline: none;
          border-color: #000;
        }

        .aaditiya-authentication-submit-action-button-9r5t {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          background-color: white;
          color: black;
          border: 1px solid #000;
          font-size: 13px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .aaditiya-authentication-submit-action-button-9r5t:hover {
          background-color: #f5f5f5;
        }

        .aaditiya-authentication-submit-action-button-9r5t:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .aaditiya-authentication-navigation-toggle-paragraph-6l1v {
          font-size: 12px;
          text-align: center;
          margin-top: 12px;
          margin-bottom: 8px;
          color: black;
        }

        .aaditiya-authentication-navigation-hyperlink-button-3y8z {
          background: none;
          border: none;
          color: black;
          text-decoration: underline;
          cursor: pointer;
          font-size: 12px;
          padding: 0;
        }

        .aaditiya-authentication-navigation-hyperlink-button-3y8z:hover {
          text-decoration: none;
        }

        .aaditiya-authentication-notification-feedback-text-8d4k {
          font-size: 12px;
          padding: 8px;
          margin-bottom: 12px;
          text-align: center;
          color: black;
          background-color: #f9f9f9;
        }

        .aaditiya-authentication-user-avatar-circular-icon-1x7j {
          width: 85px;
          height: 85px;
          background-color: #e0e0e0;
          border-radius: 50%;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .aaditiya-authentication-user-avatar-circular-icon-1x7j::before {
          content: '';
          position: absolute;
          width: 28px;
          height: 28px;
          background-color: #999;
          border-radius: 50%;
          top: 10px;
        }

        .aaditiya-authentication-user-avatar-circular-icon-1x7j::after {
          content: '';
          position: absolute;
          width: 50px;
          height: 28px;
          background-color: #999;
          border-radius: 50% 50% 0 0;
          bottom: 14px;
        }

        .aaditiya-authentication-profile-details-section-2m9b {
          margin-bottom: 24px;
        }

        .aaditiya-authentication-profile-field-descriptor-label-5p3c {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
          margin-top: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .aaditiya-authentication-profile-field-descriptor-label-5p3c:first-child {
          margin-top: 0;
        }

        .aaditiya-authentication-profile-data-display-value-6w4n {
          font-size: 14px;
          color: black;
          margin-bottom: 0;
        }

        .aaditiya-authentication-form-submission-wrapper-9k2h {
          display: flex;
          flex-direction: column;
        }
      `}</style>
      
      <div className="aaditiya-authentication-wrapper-container-2k9x">
        {view === 'profile' && user ? (
          <div className="aaditiya-authentication-form-card-panel-7h3m">
            <div className="aaditiya-authentication-user-avatar-circular-icon-1x7j"></div>
            <div className="aaditiya-authentication-profile-details-section-2m9b">
              <p className="aaditiya-authentication-profile-field-descriptor-label-5p3c">Name</p>
              <p className="aaditiya-authentication-profile-data-display-value-6w4n">{user.name}</p>
              <p className="aaditiya-authentication-profile-field-descriptor-label-5p3c">Email</p>
              <p className="aaditiya-authentication-profile-data-display-value-6w4n">{user.email}</p>
            </div>
            <button className="aaditiya-authentication-submit-action-button-9r5t" onClick={handleLogout}>Logout</button>
          </div>
        ) : view === 'login' ? (
          <div className="aaditiya-authentication-form-card-panel-7h3m">
            <h2 className="aaditiya-authentication-heading-title-text-5n8p">Login</h2>
            {message && <p className="aaditiya-authentication-notification-feedback-text-8d4k">{message}</p>}
            <div className="aaditiya-authentication-form-submission-wrapper-9k2h">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                className="aaditiya-authentication-textfield-input-element-4q2w"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                className="aaditiya-authentication-textfield-input-element-4q2w"
              />
              <button onClick={handleLogin} disabled={loading} className="aaditiya-authentication-submit-action-button-9r5t">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
            <p className="aaditiya-authentication-navigation-toggle-paragraph-6l1v">
              Don't have an account? <button type="button" onClick={() => setView('register')} className="aaditiya-authentication-navigation-hyperlink-button-3y8z">Register</button>
            </p>
            <button type="button" onClick={() => setView('forgot')} className="aaditiya-authentication-navigation-hyperlink-button-3y8z">Forgot Password?</button>
          </div>
        ) : view === 'register' ? (
          <div className="aaditiya-authentication-form-card-panel-7h3m">
            <h2 className="aaditiya-authentication-heading-title-text-5n8p">Register</h2>
            {message && <p className="aaditiya-authentication-notification-feedback-text-8d4k">{message}</p>}
            <div className="aaditiya-authentication-form-submission-wrapper-9k2h">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                required
                className="aaditiya-authentication-textfield-input-element-4q2w"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
                className="aaditiya-authentication-textfield-input-element-4q2w"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
                className="aaditiya-authentication-textfield-input-element-4q2w"
              />
              <button onClick={handleRegister} disabled={loading} className="aaditiya-authentication-submit-action-button-9r5t">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
            <p className="aaditiya-authentication-navigation-toggle-paragraph-6l1v">
              Already have an account? <button type="button" onClick={() => setView('login')} className="aaditiya-authentication-navigation-hyperlink-button-3y8z">Login</button>
            </p>
          </div>
        ) : view === 'forgot' ? (
          <div className="aaditiya-authentication-form-card-panel-7h3m">
            <h2 className="aaditiya-authentication-heading-title-text-5n8p">Forgot Password</h2>
            {message && <p className="aaditiya-authentication-notification-feedback-text-8d4k">{message}</p>}
            <div className="aaditiya-authentication-form-submission-wrapper-9k2h">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={forgotForm.email}
                onChange={handleForgotChange}
                required
                className="aaditiya-authentication-textfield-input-element-4q2w"
              />
              <button onClick={handleForgotPassword} disabled={loading} className="aaditiya-authentication-submit-action-button-9r5t">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
            <p className="aaditiya-authentication-navigation-toggle-paragraph-6l1v">
              <button type="button" onClick={() => setView('login')} className="aaditiya-authentication-navigation-hyperlink-button-3y8z">Back to Login</button>
            </p>
          </div>
        ) : view === 'reset' ? (
          <div className="aaditiya-authentication-form-card-panel-7h3m">
            <h2 className="aaditiya-authentication-heading-title-text-5n8p">Reset Password</h2>
            {message && <p className="aaditiya-authentication-notification-feedback-text-8d4k">{message}</p>}
            <div className="aaditiya-authentication-form-submission-wrapper-9k2h">
              <input
                type="text"
                name="token"
                placeholder="Token from email"
                value={resetForm.token}
                onChange={handleResetChange}
                required
                className="aaditiya-authentication-textfield-input-element-4q2w"
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={resetForm.newPassword}
                onChange={handleResetChange}
                required
                className="aaditiya-authentication-textfield-input-element-4q2w"
              />
              <button onClick={handleResetPassword} disabled={loading} className="aaditiya-authentication-submit-action-button-9r5t">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
            <p className="aaditiya-authentication-navigation-toggle-paragraph-6l1v">
              <button type="button" onClick={() => setView('login')} className="aaditiya-authentication-navigation-hyperlink-button-3y8z">Back to Login</button>
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}