import { useState, useEffect } from 'react';
import { Edit2, CheckCircle, ChevronRight,  Crown } from 'lucide-react';
import AuthWarning from '../components/AuthWarning';
const API_BASE = `${import.meta.env.VITE_APP_BACKEND_URL}/api`;

export default function Auth() {
  const [view, setView] = useState('loading');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [redirectPath, setRedirectPath] = useState(null);
  const [showDocs, setShowDocs] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ email: '' });
  const [resetForm, setResetForm] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const redir = params.get('redirect');
    if (redir) {
      const decoded = decodeURIComponent(redir);
      setRedirectPath(decoded);
      localStorage.setItem("redirect_after_login", decoded);
    }
    const storedRedirect = localStorage.getItem("redirect_after_login");
    if (!redir && storedRedirect) {
      setRedirectPath(storedRedirect);
    }
    const urlToken = params.get('token');
  const googleLogin = params.get('google_login');
const githubLogin = params.get('github_login');
const discordLogin = params.get('discord_login');
const authError = params.get('error');

 if ((googleLogin === 'success' || githubLogin === 'success' || discordLogin === 'success') && urlToken) { 
      localStorage.setItem('token', urlToken);
      fetchProfile(urlToken);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (authError) {
      setMessage('Authentication failed. Please try again.');
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
        localStorage.removeItem("redirect_after_login");
        window.location.href = redirectPath;
      } else {
        setView('profile');
      }
    } else {
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

 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');
  
  try {
    const response = await fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });
    
    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      
      // Fetch full profile data instead of using partial login response
      await fetchProfile(data.token);
      
      setLoginForm({ email: '', password: '' });
    } else {
      setMessage(data.message || 'Login failed');
    }
  } catch (error) {
    setMessage('Login failed');
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/google`;
  };
const handleGithubLogin = () => {
  window.location.href = `${API_BASE}/auth/github`;
};
const handleDiscordLogin = () => {
  window.location.href = `${API_BASE}/auth/discord`;
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
  padding: 28px;
 margin-top:-70px;
  
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  position: relative;
  margin-bottom: 20px;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }
}

.docs-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  background: #f5f5f5;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.docs-icon:hover {
  background: #e0e0e0;
}

.docs-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.docs-modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

@media (max-width: 480px) {
  .docs-modal {
    padding: 20px;
  }
}

.docs-close {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  background: #f5f5f5;
  transition: all 0.2s;
}

.docs-close:hover {
  background: #e0e0e0;
}

.docs-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: black;
}

.docs-section {
  margin-bottom: 20px;
}

.docs-section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: black;
}

.docs-section-text {
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 8px;
}

.skeleton-loader {
  width: 100%;
}

.skeleton-avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin: 0 auto 24px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.medium {
  width: 80%;
}

.skeleton-line.full {
  width: 100%;
}

.skeleton-button {
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-top: 20px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.auth-heading {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 24px;
  text-align: center;
  color: black;
  margin-top: 0;
}

@media (max-width: 480px) {
  .auth-heading {
    font-size: 20px;
  }
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
  overflow: hidden;
}

.auth-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.auth-avatar::before {
  content: '';
  position: absolute;
  width: 28px;
  height: 28px;
  background-color: #999;
  border-radius: 50%;
  top: 10px;
  z-index: 1;
}

.auth-avatar::after {
  content: '';
  position: absolute;
  width: 50px;
  height: 28px;
  background-color: #999;
  border-radius: 50% 50% 0 0;
  bottom: 14px;
  z-index: 1;
}

.auth-avatar.has-image::before,
.auth-avatar.has-image::after {
  display: none;
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
  flex-wrap: wrap;
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

@media (max-width: 480px) {
  .verified-badge {
    font-size: 12px;
  }
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
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 5px;
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
  width: 100%;
}

.small-button:hover {
  background-color: #f5f5f5;
}

.small-button.cancel {
  border-color: #d0d0d0;
  color: #666;
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
  flex-shrink: 0;
}

.auth-buttons-row {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin-top: 15px;
  gap: 10px;
  min-height: 48px;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .auth-buttons-row {
    gap: 8px;
  }
}

.auth-mini-button {
  flex: 1;
  min-width: 100px;
  padding: 10px;
  background-color: white;
  border: 1px solid black;
  border-radius:20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

@media (max-width: 480px) {
  .auth-mini-button {
    font-size: 12px;
    padding: 8px;
    min-width: 80px;
  }
}

.auth-mini-button:hover {
  background: rgba(0,0,0,0.06);
}

.benefits-section {
  width: 100%;
  max-width: 400px;
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

@media (min-width: 768px) {
  .benefits-section {
    grid-template-columns: repeat(4, 1fr);
    max-width: 840px;
  }
}

@media (max-width: 767px) and (min-width: 481px) {
  .benefits-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .benefits-section {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

.benefit-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 20px 16px;
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 480px) {
  .benefit-card {
    padding: 16px 12px;
  }
}

.benefit-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

@media (max-width: 480px) {
  .benefit-title {
    font-size: 12px;
  }
}

.benefit-text {
  font-size: 11px;
  color: #666;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .benefit-text {
    font-size: 10px;
  }
}
  /* Avatar wrapper to center everything */
/* Avatar wrapper to center everything */
.avatar-wrapper {
  position: relative;
  display: block;
  width: fit-content;
  margin: 0 auto 24px;
}
/* Premium ring around avatar */
/* Premium ring around avatar */
.auth-avatar.premium {
  padding: 3px;
  background: linear-gradient(135deg, #FFD700 0%, #FFED4E 25%, #FFA500 50%, #FFED4E 75%, #FFD700 100%);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.6),
    0 4px 15px rgba(255, 165, 0, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
  animation: premiumGlow 3s ease-in-out infinite;
}

@keyframes premiumGlow {
  0%, 100% {
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 0.6),
      0 4px 15px rgba(255, 165, 0, 0.4),
      inset 0 1px 1px rgba(255, 255, 255, 0.5);
  }
  50% {
    box-shadow: 
      0 0 40px rgba(255, 215, 0, 0.8),
      0 6px 20px rgba(255, 165, 0, 0.5),
      inset 0 1px 1px rgba(255, 255, 255, 0.6);
  }
}

.auth-avatar.premium::before,
.auth-avatar.premium::after {
  display: none;
}

.auth-avatar.premium .auth-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.auth-avatar.premium.has-image .auth-avatar-inner {
  background-color: transparent;
}

/* Premium crown badge - positioned OUTSIDE avatar */
.premium-crown-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(255, 215, 0, 0.6);
  z-index: 10;
  border: 3px solid white;
}

.premium-crown-icon {
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Non-premium avatar - keep original structure */
.auth-avatar:not(.premium)::before {
  content: '';
  position: absolute;
  width: 28px;
  height: 28px;
  background-color: #999;
  border-radius: 50%;
  top: 10px;
  z-index: 1;
}

.auth-avatar:not(.premium)::after {
  content: '';
  position: absolute;
  width: 50px;
  height: 28px;
  background-color: #999;
  border-radius: 50% 50% 0 0;
  bottom: 14px;
  z-index: 1;
}

.auth-avatar:not(.premium).has-image::before,
.auth-avatar:not(.premium).has-image::after {
  display: none;
}
  .github-button {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  background-color: #24292e;
  color: white;
  border: 1px solid #24292e;
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

.github-button:hover {
  background-color: #1a1e22;
  border-color: #000;
}

.github-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.github-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
  .discord-button {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  background-color: #5865F2;
  color: white;
  border: 1px solid #5865F2;
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

.discord-button:hover {
  background-color: #4752C4;
  border-color: #4752C4;
}

.discord-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.discord-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
    `}</style>
 <AuthWarning /> 
      <div className="auth-wrapper">
        {view === 'loading' ? (
          <div className="auth-card">
            <div className="skeleton-loader">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line short" style={{marginTop: '20px'}}></div>
              <div className="skeleton-line full"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ) : view === 'profile' && user ? (
          <>
            <div className="auth-card">
            

             <div className="avatar-wrapper">
  <div className={`auth-avatar ${user.profilePicture ? 'has-image' : ''} ${user.isPremium ? 'premium' : ''}`}>
    {user.isPremium ? (
      <div className="auth-avatar-inner">
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={user.name}
            className="auth-avatar-image"
          />
        ) : null}
      </div>
    ) : (
      <>
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={user.name}
            className="auth-avatar-image"
          />
        ) : null}
      </>
    )}
  </div>
  {user.isPremium && (
    <div className="premium-crown-badge">
      <Crown size={18} className="premium-crown-icon" />
    </div>
  )}
</div>

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
            
            <div className="auth-buttons-row">
              {redirectPath && (
                <button 
                  className="auth-mini-button"
                  onClick={() => {
                    localStorage.removeItem("redirect_after_login"); 
                    window.location.href = redirectPath;
                  }}
                >
                  Blog <ChevronRight size={12}/>
                </button>
              )}
              <button 
                className="auth-mini-button"
                onClick={() => window.location.href = "/posts"}
              >
                Posts
              </button>
              <button 
                className="auth-mini-button"
                onClick={() => window.location.href = "/"}
              >
                Explore
              </button>
            </div>

          </>
        ) : view === 'login' ? (
          <>
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
<button onClick={handleGithubLogin} disabled={loading} className="github-button">
  <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
  Continue with GitHub
</button>
<button onClick={handleDiscordLogin} disabled={loading} className="discord-button">
  <svg className="discord-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
  Continue with Discord
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

       
      </>
    ) : view === 'register' ? (
      <>
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
<button onClick={handleGithubLogin} disabled={loading} className="github-button">
  <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
  Continue with GitHub
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

       
      </>
    ) : view === 'forgot' ? (
      <>
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

        <div className="benefits-section">
          <div className="benefit-card">
            <div className="benefit-title">Share Ideas</div>
            <div className="benefit-text">Express yourself through writing</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-title">Build Audience</div>
            <div className="benefit-text">Grow your readership</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-title">Connect</div>
            <div className="benefit-text">Engage with readers</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-title">Create</div>
            <div className="benefit-text">Write and publish freely</div>
          </div>
        </div>
      </>
    ) : view === 'reset' ? (
      <>
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

        <div className="benefits-section">
          <div className="benefit-card">
            <div className="benefit-title">Share Ideas</div>
            <div className="benefit-text">Express yourself through writing</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-title">Build Audience</div>
            <div className="benefit-text">Grow your readership</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-title">Connect</div>
            <div className="benefit-text">Engage with readers</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-title">Create</div>
            <div className="benefit-text">Write and publish freely</div>
          </div>
        </div>
      </>
    ) : null}

  </div>
</>
);
}