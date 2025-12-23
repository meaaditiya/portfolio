import React, { useState, useEffect } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';

const NewsletterStrip = ({ blogId, isLoggedIn, userEmail }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showStrip, setShowStrip] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  // Check if user is already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isLoggedIn || !userEmail) {
        setCheckingSubscription(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/api/public/check-subscription`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              listName: 'Blog Subscription'
            })
          }
        );

        const data = await response.json();
        
        if (data.isSubscribed) {
          setShowStrip(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [isLoggedIn, userEmail]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    const emailToSubscribe = isLoggedIn && userEmail ? userEmail : email.trim();
    
    if (!emailToSubscribe) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/public/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailToSubscribe,
            listName: 'Blog Subscription'
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setMessage('Successfully subscribed! 🎉');
        setMessageType('success');
        setEmail('');
        
        setTimeout(() => {
          setShowStrip(false);
        }, 2000);
      } else {
        setMessage(data.message || 'Subscription failed');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error subscribing. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if checking or if user is subscribed
  if (checkingSubscription || !showStrip) return null;

  return (
    <div style={styles.strip}>
      <div style={styles.labelText}>Subscribe to get updates (Ignore if already subscribed)</div>
      <div style={styles.content}>
        {!isLoggedIn && (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isLoading}
            style={{
              ...styles.input,
              ...(isLoading && styles.inputDisabled)
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        )}

        <button9
          onClick={handleSubscribe}
          disabled={isLoading}
          style={{
            ...styles.button9,
            ...(isLoading && styles.button9Disabled)
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = '#111827';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1f2937';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isLoading ? (
            <Loader2 size={16} style={styles.spinner} />
          ) : messageType === 'success' ? (
            <Check size={16} />
          ) : null}
          <span>
            {isLoading ? 'Subscribing...' : messageType === 'success' ? 'Subscribed!' : 'Subscribe'}
          </span>
        </button9>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          ...(messageType === 'success' ? styles.messageSuccess : styles.messageError)
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

const styles = {
  strip: {
    width: '100%',
    padding: '20px 0',
    margin: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  labelText: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'lowercase',
    letterSpacing: '0.3px'
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  input: {
    padding: '10px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: 'white',
    minWidth: '280px',
    height: '40px',
    boxSizing: 'border-box'
  },
  inputDisabled: {
    background: '#f3f4f6',
    cursor: 'not-allowed'
  },
  button9: {
    padding: '0 24px',
    fontSize: '14px',
    fontWeight: '500',
    background: '#1f2937',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    height: '38px',
    minWidth: '120px'
  },
  button9Disabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  },
  message: {
    marginTop: '8px',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    textAlign: 'center'
  },
  messageSuccess: {
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0'
  },
  messageError: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  }
};

export default NewsletterStrip;