import { useState, useEffect } from 'react';
import { Edit2, CheckCircle, ChevronRight } from 'lucide-react';

const API_BASE = 'https://connectwithaaditiyamg.onrender.com/api';

export default function Auth() {
  const [view, setView] = useState('loading');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [redirectPath, setRedirectPath] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ email: '' });
  const [resetForm, setResetForm] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const redir = params.get("redirect");
  if (redir) {
    setRedirectPath(decodeURIComponent(redir));
  }
    const urlToken = params.get('token');
    const googleLogin = params.get('google_login');
    const authError = params.get('error');
    
    const redirect = params.get('redirect');
    if (redirect) {
      setRedirectPath(decodeURIComponent(redirect));
    }

    // Handle Google OAuth callback
   if (googleLogin === 'success' && urlToken) {
  localStorage.setItem('token', urlToken);
  fetchProfile(urlToken);
 if (redirectPath) {
  window.location.replace(redirectPath);
} else {
  window.location.replace('/');
}

  return;
}

    if (authError) {
      setMessage('Google authentication failed. Please try again.');
      setView('login');
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    
    if (savedToken) {
      fetchProfile(savedToken);
    } else {
      setView('login');
    }

    if (urlToken) {
      setToken(urlToken);
      const page = window.location.pathname;
      if (page.includes('verify')) {
        verifyEmailAuto(urlToken);
      } else if (page.includes('reset')) {
        setView('reset');
      }
    }
  }, []);

  const fetchProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE}/user/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
    if (response.ok) {
  setUser(data);

  if (redirectPath) {
    window.location.replace(redirectPath);
  } else {
    setView('profile');  // only for users who VISIT /auth directly
  }
}
 else {
        localStorage.removeItem('token');
        setView('login');
      }
    } catch (error) {
      console.error('Profile fetch failed:', error);
      localStorage.removeItem('token');
      setView('login');
    }
  };

  const verifyEmailAuto = async (verifyToken) => {
    try {
      setMessage('Verifying your email...');
      setLoading(true);
      const response = await fetch(`${API_BASE}/user/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✓ Email verified successfully! You can now login.');
        setTimeout(() => {
          setView('login');
          setMessage('');
        }, 2000);
      } else {
        setMessage(data.message || 'Verification failed. Link may have expired.');
      }
    } catch (error) {
      setMessage('Error verifying email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setUser(data.user);
          setLoginForm({ email: '', password: '' });
          
        if (redirectPath) {
  window.location.replace(redirectPath);
} else {
  window.location.replace('/');
}

        } else {
          setMessage(data.message || 'Login failed');
        }
        setLoading(false);
      })
      .catch(() => {
        setMessage('Login failed');
        setLoading(false);
      });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/google`;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    fetch(`${API_BASE}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm)
    })
      .then(res => res.json())
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
      .catch(() => {
        setMessage('Registration failed');
        setLoading(false);
      });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    fetch(`${API_BASE}/user/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forgotForm)
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message || 'Password reset link sent to your email');
        setForgotForm({ email: '' });
        setTimeout(() => setView('login'), 3000);
        setLoading(false);
      })
      .catch(() => {
        setMessage('Request failed');
        setLoading(false);
      });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (resetForm.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');
    fetch(`${API_BASE}/user/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: resetForm.newPassword })
    })
      .then(res => {
        return res.json().then(data => ({ ok: res.ok, data }));
      })
      .then(({ ok, data }) => {
        if (ok) {
          setMessage('✓ Password reset successful. Redirecting to login...');
          setTimeout(() => {
            setView('login');
            setResetForm({ newPassword: '', confirmPassword: '' });
            setMessage('');
          }, 2000);
        } else {
          setMessage(data.message || 'Reset failed');
        }
        setLoading(false);
      })
      .catch(() => {
        setMessage('Reset failed');
        setLoading(false);
      });
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setMessage('Name cannot be empty');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const savedToken = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/user/update-name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({ name: newName.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setEditingName(false);
        setNewName('');
        setMessage('✓ Name updated successfully');
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(data.message || 'Update failed');
      }
    } catch (error) {
      setMessage('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('login');
    setLoginForm({ email: '', password: '' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <style>{`
        .auth-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: none;
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          background-color: white;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        .auth-heading {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 24px;
          text-align: center;
          color: black;
          margin-top: 0;
        }

        .auth-input {
          width: 100%;
          padding: 12px;
          margin-bottom: 12px;
          border: 1px solid #d0d0d0;
          font-size: 14px;
          box-sizing: border-box;
          background-color: white;
          color: black;
          border-radius: 4px;
        }

        .auth-input::placeholder {
          color: #999;
        }

        .auth-input:focus {
          outline: none;
          border-color: #000;
        }

        .auth-button {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          background-color: white;
          color: black;
          border: 1px solid #000;
          font-size: 13px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .auth-button:hover {
          background-color: #f5f5f5;
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-button.success {
          background-color: #28a745;
          color: white;
          border-color: #28a745;
        }

        .auth-link-text {
          font-size: 12px;
          text-align: center;
          margin-top: 12px;
          margin-bottom: 8px;
          color: black;
        }

        .auth-link-button {
          background: none;
          border: none;
          color: black;
          text-decoration: underline;
          cursor: pointer;
          font-size: 12px;
          padding: 0;
        }

        .auth-link-button:hover {
          text-decoration: none;
        }

        .auth-message {
          font-size: 12px;
          padding: 8px;
          margin-bottom: 12px;
          text-align: center;
          color: black;
          background-color: #f9f9f9;
          border-radius: 4px;
        }

        .auth-message.error {
          color: #dc3545;
          background-color: #fef3f3;
          border-left: 3px solid #dc3545;
        }

        .auth-message.success {
          color: #28a745;
          background-color: #f0f9f6;
          border-left: 3px solid #28a745;
        }

        .auth-avatar {
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

        .auth-avatar::before {
          content: '';
          position: absolute;
          width: 28px;
          height: 28px;
          background-color: #999;
          border-radius: 50%;
          top: 10px;
        }

        .auth-avatar::after {
          content: '';
          position: absolute;
          width: 50px;
          height: 28px;
          background-color: #999;
          border-radius: 50% 50% 0 0;
          bottom: 14px;
        }

        .auth-profile-field {
          margin-bottom: 16px;
          position: relative;
        }

        .auth-profile-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .auth-profile-value {
          font-size: 14px;
          color: black;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 32px;
        }

        .edit-icon {
          cursor: pointer;
          padding: 4px;
          font-size: 16px;
          color: #666;
          transition: color 0.2s;
        }

        .edit-icon:hover {
          color: #000;
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: black;
        }

        .verified-icon {
          color: #28a745;
          flex-shrink: 0;
        }

        .last-updated {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
        }

        .name-edit-container {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .name-edit-input {
          flex: 1;
          padding: 8px;
          border: 1px solid #d0d0d0;
          font-size: 14px;
          border-radius: 4px;
          
        }

        .name-edit-input:focus {
          outline: none;
          border-color: #000;
        }
        .namesave-control {
        margin-top:10px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap:5px;
}

        .small-button {
          padding: 8.8px 12px;
          font-size: 12px;
          background-color: white;
          color: black;
          border: 1px solid #000;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
          width:100%;
          
        }

        .small-button:hover {
          background-color: #f5f5f5;
        }

        .small-button.cancel {
          border-color: #d0d0d0;
          color: #666;
        }

        .spinner {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 3px solid #f0f0f0;
          border-top: 3px solid #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        .auth-explore-section {
          width: 100%;
          max-width: 400px;
          margin-top: 20px;
          text-align: center;
          padding: 20px;
         
          border-radius: 8px;
        }

        .auth-explore-text {
          font-size: 14px;
          color: #333;
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .auth-explore-button {
          width: 100%;
          padding: 12px;
          background: none;
          color: black;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .navigation-back{
        position:relative;
        top:7px;
        }
        .navigation-back:hover{
        transform: translateX(-50%);
       }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 20px 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #d0d0d0;
        }

        .auth-divider span {
          padding: 0 10px;
          color: #666;
          font-size: 12px;
        }

        .google-button {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          background-color: white;
          color: #333;
          border: 1px solid #d0d0d0;
          font-size: 13px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 500;
        }

        .google-button:hover {
          background-color: #f8f8f8;
          border-color: #999;
        }

        .google-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          width: 18px;
          height: 18px;
        }
          .auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #d0d0d0;
}

.auth-divider span {
  padding: 0 10px;
  color: #666;
  font-size: 12px;
}

.google-button {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  background-color: white;
  color: #333;
  border: 1px solid #d0d0d0;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 500;
}

.google-button:hover {
  background-color: #f8f8f8;
  border-color: #999;
}

.google-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  width: 18px;
  height: 18px;
}
      `}</style>

      <div className="auth-wrapper">
        {view === 'loading' ? (
          <div className="auth-card">
            <div className="loading-placeholder">
              <div className="spinner"></div>
            </div>
          </div>
        ) : view === 'profile' && user ? (
          <>
            <div className="auth-card">
              <div className="auth-avatar"></div>
              
              <div className="auth-profile-field">
                <p className="auth-profile-label">Name</p>
                {editingName ? (
                  <>
                  <div className="name-edit-container">
                    <input
                      type="text"
                      className="name-edit-input"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter new name"
                      autoFocus
                    />
                   
                  </div>
                  <div className='namesave-control'>
                   <button 
                      className="small-button" 
                      onClick={handleUpdateName}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button 
                      className="small-button cancel" 
                      onClick={() => {
                        setEditingName(false);
                        setNewName('');
                        setMessage('');
                      }}
                    >
                      Cancel
                    </button>
                    </div>
                   </>
                  
                ) : (
                  <p className="auth-profile-value">
                    {user.name}
                    <span 
                      className="edit-icon" 
                      onClick={() => {
                        setEditingName(true);
                        setNewName(user.name);
                      }}
                      title="Edit name"
                    >
                      <Edit2 size={16} />
                    </span>
                  </p>
                )}
              </div>

              <div className="auth-profile-field">
                <p className="auth-profile-label">Email</p>
                <p className="auth-profile-value">
                  {user.email}
                  {user.isVerified && (
                    <span className="verified-badge">
                      <CheckCircle size={18} className="verified-icon" />
                      Verified
                    </span>
                  )}
                </p>
              </div>

              {user.updatedAt && (
                <div className="auth-profile-field">
                  <p className="last-updated">
                    Last updated: {formatDate(user.updatedAt)}
                  </p>
                </div>
              )}

              {message && <p className={`auth-message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}

              <button className="auth-button" onClick={handleLogout}>Logout</button>
            </div>
            
            <div className="auth-explore-section">
              <button 
                className="auth-explore-button" 
              onClick={() => {
  if (redirectPath) {
    window.location.replace(redirectPath);
  } else {
    window.location.replace('/');
  }
}}

              >
                Continue Exploring <span className='navigation-back'><ChevronRight/></span>
              </button>
            </div>
          </>
        ) : view === 'login' ? (
          <div className="auth-card">
            <h2 className="auth-heading">Login</h2>
            {message && <p className={`auth-message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
            
            <button onClick={handleGoogleLogin} disabled={loading} className="google-button">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="auth-input"
            />
            <button onClick={handleLogin} disabled={loading} className="auth-button">
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p className="auth-link-text">
              Don't have an account? <button type="button" onClick={() => { setView('register'); setMessage(''); }} className="auth-link-button">Register</button>
            </p>
            <button type="button" onClick={() => { setView('forgot'); setMessage(''); }} className="auth-link-button">Forgot Password?</button>
          </div>
        ) : view === 'register' ? (
          <div className="auth-card">
            <h2 className="auth-heading">Register</h2>
            {message && <p className={`auth-message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
            
            <button onClick={handleGoogleLogin} disabled={loading} className="google-button">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <input
              type="text"
              placeholder="Name"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              className="auth-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              className="auth-input"
            />
            <button onClick={handleRegister} disabled={loading} className="auth-button">
              {loading ? 'Registering...' : 'Register'}
            </button>
            <p className="auth-link-text">
              Already have an account? <button type="button" onClick={() => { setView('login'); setMessage(''); }} className="auth-link-button">Login</button>
            </p>
          </div>
        ) : view === 'forgot' ? (
          <div className="auth-card">
            <h2 className="auth-heading">Forgot Password</h2>
            {message && <p className={`auth-message ${message.includes('sent') ? 'success' : 'error'}`}>{message}</p>}
            <input
              type="email"
              placeholder="Email"
              value={forgotForm.email}
              onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
              className="auth-input"
            />
            <button onClick={handleForgotPassword} disabled={loading} className="auth-button">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="auth-link-text">
              <button type="button" onClick={() => { setView('login'); setMessage(''); }} className="auth-link-button">Back to Login</button>
            </p>
          </div>
        ) : view === 'reset' ? (
          <div className="auth-card">
            <h2 className="auth-heading">Reset Password</h2>
            {message && <p className={`auth-message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
            <input
              type="password"
              placeholder="New Password"
              value={resetForm.newPassword}
              onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={resetForm.confirmPassword}
              onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
              className="auth-input"
            />
            <button onClick={handleResetPassword} disabled={loading} className="auth-button">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <p className="auth-link-text">
              <button type="button" onClick={() => { setView('login'); setMessage(''); }} className="auth-link-button">Back to Login</button>
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}