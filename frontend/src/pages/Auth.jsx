import { useState, useEffect } from 'react';
import "../pagesCSS/auth.css";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setView('profile');
        setLoginForm({ email: '', password: '' });
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Registration successful. Check your email to verify.');
        setRegisterForm({ name: '', email: '', password: '' });
        setTimeout(() => setView('login'), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Registration failed');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotForm)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset link sent to your email');
        setForgotForm({ email: '' });
        setTimeout(() => setView('login'), 3000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Request failed');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('https://connectwithaaditiyamg.onrender.com/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset successful. Login with new password.');
        setResetForm({ token: '', newPassword: '' });
        setTimeout(() => setView('login'), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Reset failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('login');
    setLoginForm({ email: '', password: '' });
  };

  return (
    <div className="auth-container">
      {view === 'profile' && user ? (
        <div className="auth-card">
          <div className="profile-placeholder"></div>
          <div className="profile-info">
            <p className="profile-label">Name</p>
            <p className="profile-value">{user.name}</p>
            <p className="profile-label">Email</p>
            <p className="profile-value">{user.email}</p>
          </div>
          <button className="auth-button" onClick={handleLogout}>Logout</button>
        </div>
      ) : view === 'login' ? (
        <div className="auth-card">
          <h2 className="auth-title">Login</h2>
          {message && <p className="auth-message">{message}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={handleLoginChange}
              required
              className="auth-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={handleLoginChange}
              required
              className="auth-input"
            />
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="auth-toggle-text">
            Don't have an account? <button type="button" onClick={() => setView('register')} className="auth-link">Register</button>
          </p>
          <button type="button" onClick={() => setView('forgot')} className="auth-link">Forgot Password?</button>
        </div>
      ) : view === 'register' ? (
        <div className="auth-card">
          <h2 className="auth-title">Register</h2>
          {message && <p className="auth-message">{message}</p>}
          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={registerForm.name}
              onChange={handleRegisterChange}
              required
              className="auth-input"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              required
              className="auth-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              required
              className="auth-input"
            />
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="auth-toggle-text">
            Already have an account? <button type="button" onClick={() => setView('login')} className="auth-link">Login</button>
          </p>
        </div>
      ) : view === 'forgot' ? (
        <div className="auth-card">
          <h2 className="auth-title">Forgot Password</h2>
          {message && <p className="auth-message">{message}</p>}
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={forgotForm.email}
              onChange={handleForgotChange}
              required
              className="auth-input"
            />
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="auth-toggle-text">
            <button type="button" onClick={() => setView('login')} className="auth-link">Back to Login</button>
          </p>
        </div>
      ) : view === 'reset' ? (
        <div className="auth-card">
          <h2 className="auth-title">Reset Password</h2>
          {message && <p className="auth-message">{message}</p>}
          <form onSubmit={handleResetPassword}>
            <input
              type="text"
              name="token"
              placeholder="Token from email"
              value={resetForm.token}
              onChange={handleResetChange}
              required
              className="auth-input"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={resetForm.newPassword}
              onChange={handleResetChange}
              required
              className="auth-input"
            />
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="auth-toggle-text">
            <button type="button" onClick={() => setView('login')} className="auth-link">Back to Login</button>
          </p>
        </div>
      ) : null}
    </div>
  );
}