import React, { useState, useEffect } from 'react';

const WaveLoader = ({ 
  width = 100, 
  height = 60,
  color = '#000000', 
  speed = 1.2 
}) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'center',
    width: `${width}px`,
    height: `${height}px`,
    gap: '6px'
  };

  const barStyle = {
    width: '8px',
    backgroundColor: color,
    borderRadius: '4px',
    animation: `wave ${speed}s ease-in-out infinite`
  };

  const keyframes = `
    @keyframes wave {
      0%, 40%, 100% {
        height: 12px;
      }
      20% {
        height: ${height}px;
      }
    }
  `;

  return (
    <div className="wave-loader">
      <style>{keyframes}</style>
      <div style={containerStyle}>
        <div style={{...barStyle, animationDelay: '0ms'}} />
        <div style={{...barStyle, animationDelay: '100ms'}} />
        <div style={{...barStyle, animationDelay: '200ms'}} />
        <div style={{...barStyle, animationDelay: '300ms'}} />
        <div style={{...barStyle, animationDelay: '400ms'}} />
        <div style={{...barStyle, animationDelay: '500ms'}} />
        <div style={{...barStyle, animationDelay: '600ms'}} />
      </div>
    </div>
  );
};

const App = () => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <WaveLoader />
      {showText && (
        <p style={{
          marginTop: '30px',
          fontSize: 'clamp(14px, 2.5vw, 18px)',
          color: '#000000',
          fontWeight: '500',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.5',
          maxWidth: '90%',
          opacity: 0,
          animation: 'fadeIn 1s ease-in-out forwards'
        }}>
          I know you want to read, but the server is responding late.
        </p>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;