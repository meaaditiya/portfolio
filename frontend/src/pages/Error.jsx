import React, { useEffect } from 'react';

const StylishErrorPage = () => {
  useEffect(() => {
    // Add some interactive animations
    const container = document.querySelector('.error-container');
    const icon = document.querySelector('.icon');
    
    if (container && icon) {
      // Mouse follow effect
      const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 10;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;
        
        container.style.transform = `translate(${x}px, ${y}px) rotateX(${y * 0.5}deg) rotateY(${x * 0.5}deg)`;
      };
      
      // Hover effects
      const handleMouseEnter = () => {
        container.style.transform += ' scale(1.05)';
        container.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
      };
      
      const handleMouseLeave = () => {
        container.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(215, 195, 170, 0.2)';
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      // Random glitch effect occasionally
      const glitchInterval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every 3 seconds
          icon.style.animation = 'none';
          icon.offsetHeight; // Trigger reflow
          icon.style.animation = 'iconPulse 3s ease-in-out infinite, iconRotate 8s linear infinite, glitch 0.3s ease-out';
        }
      }, 3000);
      
      // Cleanup
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        clearInterval(glitchInterval);
      };
    }
  }, []);

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .error-page-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #f7f3ef 0%, #f1ebe4 50%, #ede5dc 100%);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #2d2825;
          line-height: 1.6;
          overflow: hidden;
          padding: 2rem;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .stylish-at-logo {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.1rem;
          z-index: 10;
          min-width: 0;
          flex-shrink: 0;
          margin-bottom: 2rem;
        }
        
        .at-logo-text {
          font-family: 'Great Vibes', cursive;
          font-size: 25px;
          font-weight: normal;
          background: linear-gradient(90deg, #000, #444, #000);
          background-size: 300% 100%;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-stroke: 1px #000;
          text-transform: uppercase;
          line-height: 0.6;
          margin: 0;
          transition: transform 0.3s ease;
        }
        
        .at-subtext {
          font-family: 'Great Vibes', cursive;
          font-size: 18px;
          margin-top: 0px;
          color: #000000cc;
          letter-spacing: 0.3px;
          text-align: center;
          white-space: nowrap;
          transition: opacity 0.3s ease;
          margin-bottom: -10px;
        }
        
        .stylish-at-logo:hover .at-logo-text {
          transform: scale(1.05);
        }
        
        .stylish-at-logo:hover .at-subtext {
          opacity: 0.8;
        }
        
        @keyframes moveGradient {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        
        @keyframes slideAnimation {
          0% {
            transform: translateX(0px);
          }
          25% {
            transform: translateX(5px);
          }
          50% {
            transform: translateX(0px);
          }
          75% {
            transform: translateX(-5px);
          }
          100% {
            transform: translateX(0px);
          }
        }

        .error-container {
          width: 400px;
          height: 400px;
          padding: 2rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 50%;
          border: 2px solid transparent;
          background-clip: padding-box;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 0 0 1px rgba(215, 195, 170, 0.2);
          animation: float 6s ease-in-out infinite, rotateGlow 12s linear infinite;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .error-container::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, 
            rgba(215, 195, 170, 0.4), 
            rgba(201, 178, 153, 0.6),
            rgba(139, 111, 62, 0.4),
            rgba(215, 195, 170, 0.4));
          border-radius: 50%;
          animation: borderSpin 8s linear infinite;
          z-index: -1;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }

        @keyframes rotateGlow {
          0% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(10deg) brightness(1.05); }
          100% { filter: hue-rotate(0deg) brightness(1); }
        }

        @keyframes borderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #d7c3aa 0%, #c9b299 50%, #b8a085 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
         
          position: relative;
          box-shadow: 
            0 4px 16px rgba(139, 111, 62, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .icon::before {
          content: "⚠";
          font-size: 24px;
          color: #8b6f3e;
        
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .icon::after {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border: 2px solid transparent;
          border-radius: 50%;
          background: linear-gradient(45deg, 
            rgba(215, 195, 170, 0.6), 
            transparent, 
            rgba(139, 111, 62, 0.6),
            transparent);
          animation: halo 4s linear infinite;
          z-index: -1;
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes halo {
          0% { transform: rotate(0deg) scale(1); opacity: 0.4; }
          50% { transform: rotate(180deg) scale(1.1); opacity: 0.8; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.4; }
        }

        @keyframes glitch {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px) scale(1.1); }
          40% { transform: translateX(2px) scale(0.9); }
          60% { transform: translateX(-1px) scale(1.05); }
          80% { transform: translateX(1px) scale(0.95); }
        }

        h1 {
          font-size: 1.6rem;
          margin-bottom: 1rem;
          font-weight: 500;
          color: #4a3f35;
          letter-spacing: -0.02em;
          opacity: 0.9;
          background: linear-gradient(45deg, #4a3f35, #6b5d52, #4a3f35);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: textShimmer 3s ease-in-out infinite, fadeInText 1.5s ease-out;
        }

        .subtitle {
          font-size: 1rem;
          color: #6b5d52;
          margin-bottom: 0;
          opacity: 0;
          animation: fadeInSubtitle 2s ease-out 1s both, subtlePulse 4s ease-in-out 2s infinite;
          background: linear-gradient(45deg, #6b5d52, #8b7a6b, #6b5d52);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
        }

        @keyframes textShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fadeInText {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.9); 
          }
          to { 
            opacity: 0.9; 
            transform: translateY(0) scale(1); 
          }
        }

        @keyframes fadeInSubtitle {
          from { 
            opacity: 0; 
            transform: translateY(15px); 
          }
          to { 
            opacity: 0.8; 
            transform: translateY(0); 
          }
        }

        @keyframes subtlePulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.9; }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .at-logo-text {
            font-size: 25px;
          }
          .at-subtext {
            font-size: 18px;
          }
        }
        
        @media (max-width: 768px) {
          .at-logo-text {
            font-size: 32px;
          }
          .at-subtext {
            font-size: 18px;
            letter-spacing: 0.2px;
          }
          .stylish-at-logo {
            padding: 0.05rem;
          }
          
          .error-container {
            width: 320px;
            height: 320px;
            margin: 1rem;
            padding: 1.5rem;
          }
          
          h1 {
            font-size: 1.3rem;
          }
          
          .subtitle {
            font-size: 0.9rem;
          }
          
          .icon {
            width: 50px;
            height: 50px;
          }
        }
        
        @media (max-width: 680px) {
          .stylish-at-logo {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateX(-50%) translateY(-50%);
          }
        }
        
        @media (max-width: 640px) {
          .at-logo-text {
            font-size: 30px;
          }
          .at-subtext {
            font-size: 18px;
          }
        }
        
        @media (max-width: 560px) {
          .at-logo-text {
            font-size: 28px;
          }
          .at-subtext {
            font-size: 18px;
            margin-top: 0px;
          }
        }
        
        @media (max-width: 480px) {
          .at-logo-text {
            font-size: 26px;
          }
          .at-subtext {
            font-size: 18px;
            letter-spacing: 0px;
          }
          
          @keyframes slideAnimation {
            0%, 100% {
              transform: translateX(0px);
            }
            25% {
              transform: translateX(2px);
            }
            75% {
              transform: translateX(-2px);
            }
          }
          
          .error-page-container {
            padding: 1rem;
          }
        }
        
        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .at-logo-text,
          .at-subtext,
          .error-container,
          .icon {
            animation: none;
          }
        }
        
        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .at-logo-text {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
      `}</style>
      
      <div className="error-page-container">
        {/* Stylish AT Logo */}
        <div className="stylish-at-logo">
          <div className="at-logo-text"></div>
          <div className="at-subtext"></div>
        </div>

        {/* Error Container */}
        <div className="error-container">
          <div className="icon"></div>
          <h1>Uh no, something isn't right with the application.</h1>
          <p className="subtitle">Trying to fix it.</p>
        </div>
      </div>
    </>
  );
};

export default StylishErrorPage;