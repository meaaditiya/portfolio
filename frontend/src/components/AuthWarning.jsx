import React from 'react';
import { 
  AlertTriangle,
  Shield,
  Eye,
  ExternalLink,
  ShieldAlert,
  UserX,
  Lock,
  Info
} from 'lucide-react';

const AuthWarning = () => {
  const warningItems = [
    { 
      icon: AlertTriangle, 
      text: 'Always verify the authentication popup URL matches the official provider domain',
      color: '#DC2626'
    },
    { 
      icon: Shield, 
      text: 'Official Google login uses accounts.google.com - reject any other domain',
      color: '#B91C1C'
    },
    { 
      icon: Eye, 
      text: 'Check for HTTPS and the padlock icon in the authentication window',
      color: '#991B1B'
    },
    { 
      icon: ShieldAlert, 
      text: 'Never enter credentials on suspicious or unverified popup windows',
      color: '#7F1D1D'
    },
    { 
      icon: UserX, 
      text: 'If you notice any discrepancy in the auth popup, close it immediately and contact admin',
      color: '#DC2626'
    },
    { 
      icon: Lock, 
      text: 'GitHub login uses github.com/login and Discord uses discord.com/oauth2 - verify before proceeding',
      color: '#B91C1C'
    },
    { 
      icon: ExternalLink, 
      text: 'Read our complete security guidelines at /privacy-policy',
      color: '#991B1B',
      isLink: true
    },
    { 
      icon: Info, 
      text: 'Report suspicious activity to aaditiyatyagi.dev@gmail.com immediately',
      color: '#7F1D1D'
    }
  ];

  // Duplicate for seamless loop
  const duplicatedItems = [...warningItems, ...warningItems];

  const handleClick = (item) => {
    if (item.isLink) {
      window.location.href = '/privacy-policy';
    }
  };

  return (
    <>
      <style>{`
        /* Auth Warning Strip */
        .auth-warning-strip {
          width: 100%;
          margin: 0;
          position: relative;
          top:-30px;
          height: 42px;
          background: linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #7F1D1D 100%);
        }

        /* Auth Warning Container */
        .auth-warning-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
          border-top: 2px solid #991B1B;
          border-bottom: 2px solid #991B1B;
          box-shadow: 0 2px 8px rgba(127, 29, 29, 0.3);
        }

        .auth-warning-container::before,
        .auth-warning-container::after {
          content: '';
          position: absolute;
          top: 0;
          width: 60px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .auth-warning-container::before {
          left: 0;
          background: linear-gradient(to right, rgba(127, 29, 29, 1), transparent);
        }

        .auth-warning-container::after {
          right: 0;
          background: linear-gradient(to left, rgba(127, 29, 29, 1), transparent);
        }

        /* Auth Warning Track */
        .auth-warning-track {
          display: flex;
          width: fit-content;
          gap: 0;
          padding: 0;
          margin: 0;
          height: 100%;
          align-items: center;
          animation: authWarningScroll 55s linear infinite;
          will-change: transform;
        }

        @keyframes authWarningScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        /* Auth Warning Item */
        .auth-warning-item {
          flex: 0 0 auto;
          height: 42px;
          padding: 0 35px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          background: rgba(127, 29, 29, 0.95);
          border-right: 1px solid rgba(220, 38, 38, 0.5);
          cursor: default;
          transition: all 0.2s ease;
        }

        .auth-warning-item.clickable {
          cursor: pointer;
        }

        .auth-warning-item.clickable:hover {
          background: rgba(153, 27, 27, 0.95);
          transform: scale(1.02);
        }

        /* Icon Circle */
        .auth-warning-icon-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.3);
          animation: pulseWarning 2s ease-in-out infinite;
        }

        @keyframes pulseWarning {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.6);
          }
        }

        .auth-warning-icon {
          width: 14px;
          height: 14px;
        }

        /* Warning Text */
        .auth-warning-text {
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          line-height: 1.4;
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.3px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .auth-warning-strip {
            height: 38px;
          }

          .auth-warning-item {
            height: 38px;
            padding: 0 28px;
            gap: 8px;
          }

          .auth-warning-icon-circle {
            width: 24px;
            height: 24px;
          }

          .auth-warning-icon {
            width: 13px;
            height: 13px;
          }

          .auth-warning-text {
            font-size: 11px;
          }

          .auth-warning-container::before,
          .auth-warning-container::after {
            width: 45px;
          }

          .auth-warning-track {
            animation: authWarningScroll 45s linear infinite;
          }
        }

        @media (max-width: 480px) {
          .auth-warning-strip {
            height: 36px;
          }

          .auth-warning-item {
            height: 36px;
            padding: 0 22px;
            gap: 7px;
          }

          .auth-warning-icon-circle {
            width: 22px;
            height: 22px;
          }

          .auth-warning-icon {
            width: 12px;
            height: 12px;
          }

          .auth-warning-text {
            font-size: 10px;
          }

          .auth-warning-container::before,
          .auth-warning-container::after {
            width: 30px;
          }

          .auth-warning-track {
            animation: authWarningScroll 35s linear infinite;
          }
        }
      `}</style>

      <div className="auth-warning-strip">
        <div className="auth-warning-container">
          <div className="auth-warning-track">
            {duplicatedItems.map((item, index) => {
              const IconComponent = item.icon;
              
              return (
                <div
                  key={`${item.text}-${index}`}
                  className={`auth-warning-item ${item.isLink ? 'clickable' : ''}`}
                  onClick={() => handleClick(item)}
                >
                  <div 
                    className="auth-warning-icon-circle"
                    style={{ backgroundColor: item.color }}
                  >
                    <IconComponent className="auth-warning-icon" />
                  </div>
                  <span className="auth-warning-text">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthWarning;