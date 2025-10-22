import React from 'react';

const CircleLoader = () => {
  return (
    <div style={{
      position: 'relative',
      width: '80px',
      height: '80px'
    }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * 360) / 8;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              top: '50%',
              left: '50%',
              transform: `rotate(${angle}deg) translate(30px) translateX(-50%)`,
              animation: `fade 1s linear infinite`,
              animationDelay: `${i * 0.125}s`,
              opacity: 0.2
            }}
          />
        );
      })}
      <style>{`
        @keyframes fade {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

const App = () => {
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
      <CircleLoader />
    </div>
  );
};

export default App;