import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// 👀 Custom Console Message
console.log(
  `%c🚨 Hey there, curious developer! 🚨`,
  'color: white; background-color: crimson; font-size: 20px; padding: 8px; font-weight: bold; border-radius: 6px;'
);

console.log(
  `%cSo you’ve opened the console... 🕵️‍♂️✨\n\n` +
  `Welcome to the backstage of this web app! 🎭\n` +
  `You're clearly someone special — the 1% who dives deep 🤓🧠\n\n` +
  `This site was handcrafted with 💖, sweat 💦, and way too much coffee ☕.\n` +
  `If you're looking for secrets 🔐, easter eggs 🥚, or bugs 🐞... you might find a few (shhh 🤫).\n\n` +
  `Anyway, thanks for being curious! Curiosity builds great things 🚀\n\n` +
  `— Yours truly, the Dev 👨‍💻\n\n` +
  `🌈✨💡💻🛠️🔥📦🧩🎉`,
  'color: #00adb5; font-size: 14px; font-family: monospace;'
);

// ❌ Disable all other console methods in production
if (import.meta.env.MODE === 'production') {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// ✅ Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// 🎯 Render React App
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
