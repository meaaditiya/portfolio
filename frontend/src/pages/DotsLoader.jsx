import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  Zap, 
  Database, 
  Coffee, 
  Eye, 
  Grid, 
  Send, 
  Star, 
  Target, 
  Calculator, 
  Coffee as CoffeeIcon, 
  Cloud, 
  Rewind, 
  Settings, 
  Heart, 
  Timer, 
  Globe, 
  Brain, 
  Move 
} from 'lucide-react';

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
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    { text: "Loading... please hold tight!", icon: Clock },
    { text: "Just a moment... the magic is happening.", icon: Sparkles },
    { text: "Spinning up awesomeness...", icon: Zap },
    { text: "Hang on, grabbing your data!", icon: Database },
    { text: "Your content is brewing", icon: Coffee },
    { text: "Loading... don't blink!", icon: Eye },
    { text: "Pixels are aligning...", icon: Grid },
    { text: "Teleporting your request...", icon: Send },
    { text: "Summoning the goods...", icon: Star },
    { text: "Almost there, promise!", icon: Target },
    { text: "Crunching numbers and facts...", icon: Calculator },
    { text: "Still faster than your morning coffee", icon: CoffeeIcon },
    { text: "Fetching wonders from the cloud...", icon: Cloud },
    { text: "Loading like it's 1999...", icon: Rewind },
    { text: "Reticulating splines... whatever that means.", icon: Settings },
    { text: "Hold tight — unleashing the awesomeness.", icon: Heart },
    { text: "Good things take time... like this.", icon: Timer },
    { text: "Synchronizing with the universe...", icon: Globe },
    { text: "We're not stuck... just thinking deeply.", icon: Brain },
    { text: "Loading... feel free to stretch.", icon: Move }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = messages[messageIndex];
  const IconComponent = currentMessage.icon;

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
      <div style={{
        marginTop: '30px',
        fontSize: 'clamp(14px, 2.5vw, 18px)',
        color: '#000000',
        fontWeight: '500',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.5',
        maxWidth: '90%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: 1,
        animation: 'fadeIn 0.5s ease-in-out'
      }}>
        <IconComponent size={20} />
        <span>{currentMessage.text}</span>
      </div>
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